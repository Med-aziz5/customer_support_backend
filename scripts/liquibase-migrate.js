#!/usr/bin/env node

/**
 * Liquibase Migration Script
 * Runs database migrations manually (safe mode).
 */

const LiquibaseConfig = require('../config/liquibase-config');

async function runMigrations() {
  try {
    const liquibaseConfig = new LiquibaseConfig();
    await liquibaseConfig.runMigrations();
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    if (
      error.message &&
      error.message.includes('Could not acquire change log lock')
    ) {
      console.warn('⚠️ Skipping migrations because Liquibase lock exists.');
      process.exit(0); // Don’t fail, just skip
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

runMigrations();
