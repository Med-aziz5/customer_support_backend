require('dotenv').config();

const express = require('express');
const cors = require('cors');
const ErrorHandlerModule = require('./error/errorHandler');
const db = require('./models');
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
const httpPort = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notes', noteRoutes);

// Global error handler
app.use(ErrorHandlerModule.errorHandler);

db.sequelize
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Unable to connect to the database:', err));

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');

    await ensureAdmin();

    const liquibase = new LiquibaseConfig();
    await liquibase.runMigrations();

    app.listen(httpPort, () => {
      console.log(`Server running on port ${httpPort}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
