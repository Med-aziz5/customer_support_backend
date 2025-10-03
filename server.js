require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./models');
const ErrorHandlerModule = require('./error/errorHandler');
const LiquibaseConfig = require('./config/liquibase-config');
const ensureAdmin = require('./utils/ensureAdmin');

const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const commentRoutes = require('./routes/commentRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notes', noteRoutes);

app.use(ErrorHandlerModule.errorHandler);

// Retry helper to wait for a table
async function waitForTable(tableName, retries = 10, delay = 1000) {
  const queryInterface = db.sequelize.getQueryInterface();
  for (let i = 0; i < retries; i++) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes(tableName)) return;
    } catch (err) {}
    await new Promise((res) => setTimeout(res, delay));
  }
  throw new Error(`Table "${tableName}" not found after ${retries} retries`);
}

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    const liquibase = new LiquibaseConfig();
    try {
      await liquibase.runMigrations();
      console.log('✅ Liquibase migrations complete');
    } catch (err) {
      if (
        err.message &&
        err.message.includes('Could not acquire change log lock')
      ) {
        console.warn('⚠️ Skipping Liquibase migration because lock exists');
      } else {
        throw err;
      }
    }

    // Wait for the "users" table before running ensureAdmin
    await waitForTable('users');
    await ensureAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
