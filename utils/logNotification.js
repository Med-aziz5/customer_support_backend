const { Notification } = require('../models');

async function logNotification(userId, message) {
  try {
    await Notification.create({
      user_id: userId,
      message,
    });
  } catch (err) {
    console.error('Failed to log notification:', err);
  }
}

module.exports = logNotification;
