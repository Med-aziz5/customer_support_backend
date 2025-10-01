const { Feedback, Ticket, User } = require('../models');
const NotFoundError = require('../error/NotFoundError');

const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'client' },
      ],
    });

    if (!feedbacks.length)
      throw new NotFoundError('No feedbacks found', 'Feedback');
    res.json({ data: feedbacks });
  } catch (err) {
    next(err);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id, {
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

const getFeedbackByAgent = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        {
          model: Ticket,
          as: 'ticket',
          where: { assigned_to: req.params.agentId },
        },
      ],
    });

    if (!feedbacks.length)
      throw new NotFoundError('No feedbacks found for this agent', 'Feedback');

    const total_rating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const average_rating = total_rating / feedbacks.length;

    res.json({
      agentId: req.params.agentId,
      total_feedbacks: feedbacks.length,
      average_rating,
    });
  } catch (err) {
    next(err);
  }
};

const createFeedback = async (req, res, next) => {
  try {
    const { content, rating } = req.body;
    const { ticket_id } = req.params;
    const client_id = req.user.id;

    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Feedback');

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

const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) throw new NotFoundError('Feedback not found', 'Feedback');

    await feedback.update(req.body);
    res.json({ data: feedback });
  } catch (err) {
    next(err);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) throw new NotFoundError('Feedback not found', 'Feedback');

    await feedback.destroy();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getMyAverageRating = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { client_id: req.user.id },
    });

    if (!feedbacks.length)
      throw new NotFoundError(
        'No feedbacks found for your account',
        'Feedback',
      );

    const total_rating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const average_rating = total_rating / feedbacks.length;

    res.json({
      clientId: req.user.id,
      total_feedbacks: feedbacks.length,
      average_rating,
    });
  } catch (err) {
    next(err);
  }
};

const getBestRatedAgent = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        {
          model: Ticket,
          as: 'ticket',
          include: [{ model: User, as: 'assignedTo' }],
        },
      ],
    });

    if (!feedbacks.length)
      throw new NotFoundError('No agents with feedback found', 'Feedback');

    const ratings = {};
    feedbacks.forEach((f) => {
      const agent = f.ticket.assignedTo;
      if (agent) {
        if (!ratings[agent.id]) ratings[agent.id] = [];
        ratings[agent.id].push(f.rating);
      }
    });

    const bestAgent = Object.entries(ratings)
      .map(([id, arr]) => ({
        id,
        average: arr.reduce((a, b) => a + b, 0) / arr.length,
      }))
      .sort((a, b) => b.average - a.average)[0];

    res.json({ agentId: bestAgent.id, average_rating: bestAgent.average });
  } catch (err) {
    next(err);
  }
};

const getWorstRatedAgent = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        {
          model: Ticket,
          as: 'ticket',
          include: [{ model: User, as: 'assignedTo' }],
        },
      ],
    });

    if (!feedbacks.length)
      throw new NotFoundError('No agents with feedback found', 'Feedback');

    const ratings = {};
    feedbacks.forEach((f) => {
      const agent = f.ticket.assignedTo;
      if (agent) {
        if (!ratings[agent.id]) ratings[agent.id] = [];
        ratings[agent.id].push(f.rating);
      }
    });

    const worstAgent = Object.entries(ratings)
      .map(([id, arr]) => ({
        id,
        average: arr.reduce((a, b) => a + b, 0) / arr.length,
      }))
      .sort((a, b) => a.average - b.average)[0];

    res.json({ agentId: worstAgent.id, average_rating: worstAgent.average });
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
