const { History, Ticket } = require('../models');
const NotFoundError = require('../error/NotFoundError');

const getAllHistory = async (req, res, next) => {
  try {
    const { count, rows: histories } = await History.findAndCountAll({});

    res.json({ data: histories, total_count: count });
  } catch (error) {
    next(error);
  }
};

const getHistoryByTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw new NotFoundError('Ticket not found.', 'Ticket');

    const histories = await History.findAll({
      where: { ticket_id: id },
      includes: [
        { model: user, as: 'user', attributes: ['id', 'email', 'role'] },
      ],
    });

    res.status(200).json({
      ticket_id: id,
      total_count: histories.length,
      data: histories,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await History.findByPk(id);
    if (!history) throw new NotFoundError('History not found.', 'History');

    await history.destroy();
    res.json({ message: 'History deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHistory,
  getHistoryByTicket,
  deleteHistory,
};
