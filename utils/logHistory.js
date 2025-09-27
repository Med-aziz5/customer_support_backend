const { History } = require('../models');

async function logHistory(ticketId, userId, description) {
  try {
    await History.create({
      ticket_id: ticketId,
      user_id: userId,
      description,
    });
  } catch (err) {
    console.error('Failed to log history:', err);
  }
}

module.exports = logHistory;
