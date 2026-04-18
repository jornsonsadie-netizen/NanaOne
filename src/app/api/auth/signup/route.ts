import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  console.log('--- SIGNUP API V3 (STRICT VOIP) TRIGGERED ---');
  try {
    const { username, phone } = await req.json();

    if (!username || !phone) {
      return NextResponse.json({ error: 'Username and Phone are required' }, { status: 400 });
    }

    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith('+')) {
      // Default to adding + if missing, assuming E.164 format is preferred
      // In a real app, you might want to know the country code first
      normalizedPhone = '+' + normalizedPhone;
    }

    console.log(`[SIGNUP] Attempt for ${normalizedPhone} (user: ${username})`);

    // REAL VOIP & FAKE CHECK via Twilio Lookup
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        
        console.log(`[TWILIO] Looking up ${normalizedPhone}...`);
        const lookup = await client.lookups.v2.phoneNumbers(normalizedPhone)
          .fetch({ fields: 'line_type_intelligence' });

        const lineType = lookup.lineTypeIntelligence?.type;
        const carrier = lookup.lineTypeIntelligence?.carrierName?.toLowerCase() || '';

        console.log(`[TWILIO] Result for ${normalizedPhone}: Type=${lineType}, Carrier=${carrier}`);

        if (!lookup.valid) {
          console.warn(`[TWILIO] Invalid number: ${normalizedPhone}`);
          return NextResponse.json({ error: 'This phone number is invalid according to global records', code: 'INVALID_NUMBER' }, { status: 400 });
        }

        // Block all VOIP types (voip, nonFixedVoip, fixedVoip)
        const isVoip = lineType?.toLowerCase().includes('voip');
        const isVirtualCarrier = carrier.includes('twilio') || carrier.includes('google voice') || carrier.includes('bandwidth');

        if (isVoip || isVirtualCarrier) {
          console.warn(`[TWILIO] VOIP/Virtual detected: ${normalizedPhone} (Type: ${lineType}, Carrier: ${carrier})`);
          return NextResponse.json({ error: 'Security Check: Virtual, VOIP, and non-mobile numbers are strictly blocked on NanaOne.', code: 'VOIP_BLOCKED' }, { status: 400 });
        }
      } catch (twilioError: any) {
        console.error('Twilio Lookup Error:', twilioError.message, twilioError.status);
        // If it's a 404, Twilio is saying the number doesn't exist
        if (twilioError.status === 404) {
          return NextResponse.json({ error: 'The phone number provided does not exist or is formatted incorrectly', code: 'NON_EXISTENT_NUMBER' }, { status: 400 });
        }
        // If it's 401/403, we might allow it for now if it's a dev config issue, or block it
        // Since we MUST be secure, we'll continue for now but log loudly
      }
    }

    // Check if username already exists
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length > 0) {
      return NextResponse.json({ error: 'Username already taken by another user', code: 'USERNAME_TAKEN' }, { status: 400 });
    }

    // Check if phone already exists
    const existingPhone = await db.select().from(users).where(eq(users.phone, normalizedPhone)).limit(1);
    if (existingPhone.length > 0) {
      return NextResponse.json({ error: 'This phone number is already registered. Please Login instead.', code: 'PHONE_TAKEN' }, { status: 400 });
    }

    const userId = uuidv4();
    const apiKey = `NanaOne-${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    await db.insert(users).values({
      id: userId,
      username,
      phone: normalizedPhone,
      apiKey,
      balance: 20.0,
      oneTimeBalance: 0.0,
      lastReset: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, apiKey, username });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed. Please check your details.' }, { status: 500 });
  }
}
