#!/usr/bin/env node
 
/**
* Liquibase Migration Script
* Runs database migrations manually.
*/
 
const LiquibaseConfig = require('../config/liquibase-config');
 
async function runMigrations() {
  try {
    const liquibaseConfig = new LiquibaseConfig();  // Initialize LiquibaseConfig
    await liquibaseConfig.runMigrations();  // Run the migrations
    console.log('✅ Migrations completed successfully!');
    process.exit(0);  // Exit with success code
  } catch (error) {
    console.error('❌ Migration failed:', error);  // Log error if migration fails
    process.exit(1);  // Exit with failure code
  }
}
 
runMigrations();  // Execute the migration process