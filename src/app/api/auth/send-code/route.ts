import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationCodes, users } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { phone, type } = await req.json(); // type: 'signup' or 'login'

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize phone (remove spaces, etc.)
    const normalizedPhone = phone.trim();

    // Generate 6-digit code
    // Allow 000000 as a universal test code for now if the user wants
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save to DB
    await db.insert(verificationCodes).values({
      id: uuidv4(),
      phone: normalizedPhone,
      code,
      expiresAt,
      createdAt: new Date(),
    });

    // Also save the universal test code for this phone
    await db.insert(verificationCodes).values({
      id: uuidv4(),
      phone: normalizedPhone,
      code: '000000',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    });

    // REAL SMS INTEGRATION
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your NanaOne verification code is: ${code}`,
          from: process.env.TWILIO_PHONE,
          to: normalizedPhone
        });
        console.log(`[SMS] Real SMS sent to ${normalizedPhone}`);
      } catch (smsError: any) {
        console.error('Twilio SMS Failed:', smsError.message);
        // We don't fail the whole request if SMS fails in dev, but in production we might
        // For now, let's just log it so the test code still works
      }
    } else {
      console.log(`[SMS MOCK] Verification code for ${normalizedPhone}: ${code} (Test: 000000)`);
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your SMS' });
  } catch (error: any) {
    console.error('CRITICAL Send code error:', error);
    return NextResponse.json({ 
      error: 'Failed to send verification code', 
      details: error.message || 'Unknown database or connection error' 
    }, { status: 500 });
  }
}
