import { initSchema } from '../config/db';

async function run() {
  console.log('Running standalone database migration and schema setup...');
  try {
    await initSchema();
    console.log('Database schema migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
