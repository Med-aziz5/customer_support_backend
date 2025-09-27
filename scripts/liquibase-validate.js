#!/usr/bin/env node
/**
 * Liquibase Validate Script
 * Validates all Liquibase changelogs before running migrations.
 */
 const LiquibaseConfig = require('../config/liquibase-config');

 async function validate() {
   try {
     const liquibaseConfig = new LiquibaseConfig();
     await liquibaseConfig.liquibase.validate();
     
     console.log('✅ Validation completed successfully!');
     process.exit(0);
   } catch (error) {
     console.error('❌ Validation failed:', error);
     process.exit(1);
   }
 }
 
 validate();
 