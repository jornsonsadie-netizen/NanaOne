import { refreshModels } from './src/lib/db/utils';

async function run() {
  console.log('Running refresh models...');
  await refreshModels();
  console.log('Done!');
  process.exit(0);
}

run();
