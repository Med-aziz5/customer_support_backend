#!/usr/bin/env node
/**
 * Liquibase Status Script
 * Shows which migrations have been applied or are pending.
 */
 const LiquibaseConfig = require('../config/liquibase-config');

 async function status() {
   try {
     const liquibaseConfig = new LiquibaseConfig();
     await liquibaseConfig.liquibase.status({ verbose: true });
     
     console.log('✅ Status check completed!');
     process.exit(0);
   } catch (error) {
     console.error('❌ Status check failed:', error);
     process.exit(1);
   }
 }
 
 status();
 