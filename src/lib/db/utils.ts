import { db } from './index';
import { settings, models, providers } from './schema';
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
  const allProviders = await db.select().from(providers).where(eq(providers.enabled, true));
  
  if (allProviders.length === 0) {
    console.log('No enabled providers found for model refresh');
    return;
  }

  for (const provider of allProviders) {
    try {
      console.log(`Refreshing models for provider: ${provider.name} (${provider.baseUrl})`);
      const response = await axios.get(`${provider.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
        },
        timeout: 10000,
      });

      const upstreamModels = response.data.data;
      if (!Array.isArray(upstreamModels)) {
        console.warn(`Provider ${provider.name} returned invalid models data`);
        continue;
      }

      for (const m of upstreamModels) {
        await db.insert(models).values({
          id: m.id,
          name: m.id,
          providerId: provider.id,
        }).onConflictDoUpdate({
          target: [models.id, models.providerId],
          set: { name: m.id },
        });
      }
      console.log(`Successfully refreshed ${upstreamModels.length} models for ${provider.name}`);
    } catch (error: any) {
      console.error(`Failed to refresh models for provider ${provider.name}:`, error.message);
    }
  }
}
