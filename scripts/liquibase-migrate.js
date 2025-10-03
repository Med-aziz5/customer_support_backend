const LiquibaseConfig = require('../config/liquibase-config');

async function runMigrations() {
  try {
    const liquibase = new LiquibaseConfig();
    await liquibase.runMigrations();
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message?.includes('Could not acquire change log lock')) {
      console.warn('⚠️ Skipping migrations: Liquibase lock exists');
      process.exit(0);
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

runMigrations();
