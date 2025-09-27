const { Feedback, Ticket, User } = require('../models');
const NotFoundError = require('../error/NotFoundError');
const { fn, col } = require('sequelize');

// Get all feedbacks – unchanged
const getAllFeedbacks = async (req, res, next) => {
  try {
    const { rows: feedbacks, count: total_count } =
      await Feedback.findAndCountAll({
        include: [
          { model: Ticket, as: 'ticket' },
          { model: User, as: 'client' },
        ],
      });

    if (!feedbacks.length)
      throw new NotFoundError('No feedbacks found', 'Feedback');

    res.json({ data: feedbacks, total_count });
  } catch (err) {
    next(err);
  }
};

// Get feedback by ID – unchanged
const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id, {
      include: [
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'client' },
      ],
    });

    if (!feedback) throw new NotFoundError('Feedback not found', 'Feedback');
    res.json({ data: feedback });
  } catch (err) {
    next(err);
  }
};

// Get feedback stats for an agent
const getFeedbackByAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;

    const feedbacks = await Feedback.findAll({
      attributes: [
        [fn('COUNT', col('Feedback.id')), 'total_feedbacks'],
        [fn('SUM', col('Feedback.rating')), 'total_rating'],
      ],
      include: [
        {
          model: Ticket,
          as: 'ticket',
          attributes: [],
          where: { assigned_to: agentId },
        },
      ],
      raw: true,
    });

    const total_feedbacks = feedbacks[0].total_feedbacks;
    const total_rating = feedbacks[0].total_rating;

    if (!total_feedbacks) {
      throw new NotFoundError('No feedbacks found for this agent', 'Feedback');
    }

    const average_rating = total_rating / total_feedbacks;

    res.json({
      agentId,
      total_feedbacks,
      average_rating,
    });
  } catch (err) {
    next(err);
  }
};

// Create feedback – unchanged
const createFeedback = async (req, res, next) => {
  try {
    const { content, rating } = req.body;
    const { ticket_id } = req.params;
    const client_id = req.user.id;

    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Feedback');

    const client = await User.findByPk(client_id);
    if (!client) throw new NotFoundError('Client not found', 'Feedback');

    const feedback = await Feedback.create({
      ticket_id,
      client_id,
      content,
      rating,
    });
    res.status(201).json({ data: feedback });
  } catch (err) {
    next(err);
  }
};

// Update feedback – unchanged
const updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) throw new NotFoundError('Feedback not found', 'Feedback');

    await feedback.update({
      ...(content && { content }),
      ...(rating && { rating }),
    });

    res.json({ data: feedback });
  } catch (err) {
    next(err);
  }
};

// Delete feedback – unchanged
const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id);
    if (!feedback) throw new NotFoundError('Feedback not found', 'Feedback');

    await feedback.destroy();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get current client's average rating – unchanged
const getMyAverageRating = async (req, res, next) => {
  try {
    const clientId = req.user.id;

    const { rows: feedbacks, count: total_feedbacks } =
      await Feedback.findAndCountAll({
        where: { client_id: clientId },
        attributes: ['rating'],
        raw: true,
      });

    if (!total_feedbacks) {
      throw new NotFoundError(
        'No feedbacks found for your account',
        'Feedback',
      );
    }

    const total_rating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const average_rating = total_rating / total_feedbacks;

    res.json({
      clientId,
      total_feedbacks,
      average_rating,
    });
  } catch (err) {
    next(err);
  }
};

// Get best rated agent
const getBestRatedAgent = async (req, res, next) => {
  try {
    const bestAgent = await Feedback.findOne({
      attributes: [[fn('AVG', col('rating')), 'average_rating']],
      include: [
        {
          model: Ticket,
          as: 'ticket',
          attributes: [],
          include: [
            {
              model: User,
              as: 'assignedTo',
              attributes: ['id', 'first_name', 'last_name', 'email'],
            },
          ],
        },
      ],
      group: [
        'ticket.assignedTo.id',
        'ticket.assignedTo.first_name',
        'ticket.assignedTo.last_name',
        'ticket.assignedTo.email',
      ],
      order: [[fn('AVG', col('rating')), 'DESC']],
      raw: true,
      nest: true,
    });

    if (!bestAgent) {
      throw new NotFoundError('No agents with feedback found', 'Feedback');
    }

    res.json({
      agent: bestAgent.ticket.assignedTo,
      average_rating: parseFloat(bestAgent.average_rating),
    });
  } catch (err) {
    next(err);
  }
};

// Get worst rated agent
const getWorstRatedAgent = async (req, res, next) => {
  try {
    const worstAgent = await Feedback.findOne({
      attributes: [[fn('AVG', col('rating')), 'average_rating']],
      include: [
        {
          model: Ticket,
          as: 'ticket',
          attributes: [],
          include: [
            {
              model: User,
              as: 'assignedTo',
              attributes: ['id', 'first_name', 'last_name', 'email'],
            },
          ],
        },
      ],
      group: [
        'ticket.assignedTo.id',
        'ticket.assignedTo.first_name',
        'ticket.assignedTo.last_name',
        'ticket.assignedTo.email',
      ],
      order: [[fn('AVG', col('rating')), 'ASC']],
      raw: true,
      nest: true,
    });

    if (!worstAgent) {
      throw new NotFoundError('No agents with feedback found', 'Feedback');
    }

    res.json({
      agent: worstAgent.ticket.assignedTo,
      average_rating: worstAgent.average_rating,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  getFeedbackByAgent,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getMyAverageRating,
  getBestRatedAgent,
  getWorstRatedAgent,
};
