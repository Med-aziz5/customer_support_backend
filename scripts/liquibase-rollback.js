#!/usr/bin/env node
/**
 * Liquibase Rollback Script
 * Reverts the last database change set.
 */
 const LiquibaseConfig = require('../config/liquibase-config');

 async function rollback() {
   try {
     const liquibaseConfig = new LiquibaseConfig();
     await liquibaseConfig.liquibase.rollback({ count: 1 });
     
     console.log('✅ Rollback completed successfully!');
     process.exit(0);
   } catch (error) {
     console.error('❌ Rollback failed:', error);
     process.exit(1);
   }
 }
 
 rollback();
 