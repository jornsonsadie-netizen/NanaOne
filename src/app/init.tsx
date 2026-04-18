import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { initDatabase } from '@/lib/db/utils';

export default async function Page() {
  await initDatabase();
  return null;
}
