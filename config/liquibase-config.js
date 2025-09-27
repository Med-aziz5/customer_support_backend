// config/liquibase-config.js
const { Liquibase } = require('node-liquibase');
const path = require('path');
const appConfig = require('./app-config');

class LiquibaseConfig {
  constructor() {
    this.config = this.buildConfig();
    this.liquibase = new Liquibase(this.config);
  }

  /**
   * Build Liquibase configuration from app config
   */
  buildConfig() {
    const dbConfig = appConfig.db;

    return {
      changeLogFile: 'db/changelog/db.changelog-master.xml',  // Liquibase changelog file path
      url: `jdbc:postgresql://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`,
      username: dbConfig.user,
      password: dbConfig.password,
      driver: 'org.postgresql.Driver',
      
      logLevel: 'INFO',
      outputDefaultSchema: false,
      outputDefaultCatalog: false,
      defaultSchemaName: 'public',
      liquibaseSchemaName: 'public'
    };
  }

  /**
   * Run database migrations
   */
  async runMigrations() {
    try {
      await this.liquibase.update();
      console.log('✅ Liquibase migrations completed successfully');
    } catch (error) {
      console.error('❌ Liquibase migration failed:', error);
      throw error;
    }
  }

  /**
   * Check migration status
   */
  async getStatus() {
    try {
      const status = await this.liquibase.status();
      console.log('📊 Liquibase status:', status);
      return status;
    } catch (error) {
      console.error('❌ Failed to get Liquibase status:', error);
      throw error;
    }
  }

  /**
   * Rollback migrations
   */
  async rollback(count = 1) {
    try {
      await this.liquibase.rollbackCount(count);
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

module.exports = LiquibaseConfig;
