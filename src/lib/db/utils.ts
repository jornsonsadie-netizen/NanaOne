import { db } from './index';
import { settings, models } from './schema';
import axios from 'axios';
import { eq } from 'drizzle-orm';

export async function initDatabase() {
  // Simple check to see if settings exist, if not, create default from .env
  const existingSettings = await db.select().from(settings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settings).values({
      id: 1,
      upstreamEndpoint: process.env.UPSTREAM_API_ENDPOINT,
      upstreamKey: process.env.UPSTREAM_API_KEY,
      adminPassword: process.env.ADMIN_PASSWORD,
    });
  }
}

export async function refreshModels() {
  const s = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  if (!s[0]) return;

  try {
    const response = await axios.get(`${s[0].upstreamEndpoint}/models`, {
      headers: {
        Authorization: `Bearer ${s[0].upstreamKey}`,
      },
    });

    const upstreamModels = response.data.data;
    for (const m of upstreamModels) {
      await db.insert(models).values({
        id: m.id,
        name: m.id,
        provider: 'upstream',
      }).onConflictDoUpdate({
        target: models.id,
        set: { name: m.id },
      });
    }
  } catch (error) {
    console.error('Failed to refresh models:', error);
  }
}
