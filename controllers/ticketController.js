const { Ticket, User } = require('../models');
const NotFoundError = require('../error/NotFoundError');
const BusinessError = require('../error/BusinessError');
const ForbiddenError = require('../error/ForbiddenError');
const logHistory = require('../utils/logHistory');
const { fn, col } = require('sequelize');
const { Op } = require('sequelize');

const getAllTickets = async (req, res, next) => {
  try {
    const { rows: tickets, count: total_count } = await Ticket.findAndCountAll({
      where: {
        assigned_to: { [Op.is]: null },
      },
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'assignedTo' },
      ],
    });

    res.json({ data: tickets, total_count });
  } catch (err) {
    next(err);
  }
};
const getMyAssignedTickets = async (req, res, next) => {
  try {
    const { rows: tickets, count: total_count } = await Ticket.findAndCountAll({
      where: {
        assigned_to: req.user.id,
      },
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'assignedTo' },
      ],
    });

    res.json({ data: tickets, total_count });
  } catch (err) {
    next(err);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({
      where: { id },
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'assignedTo' },
      ],
    });

    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');
    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

const getTicketsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('userId from token:', userId);

    const { rows: tickets, count: total_count } = await Ticket.findAndCountAll({
      where: { user_id: userId },
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'assignedTo' },
      ],
    });

    res.json({ data: tickets, total_count });
  } catch (err) {
    next(err);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category } = req.body;
    const user_id = req.user.id;

    const openTicketsCount = await Ticket.count({ where: { user_id } });
    if (openTicketsCount >= 5) {
      throw new BusinessError(403, 'User already has 5 open tickets', 'Ticket');
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: req.body.priority.toUpperCase(),
      user_id,
      category,
      status: 'PENDING',
    });

    console.log('Created ticket:', ticket);

    await logHistory(
      ticket.id,
      req.user.id,
      `Ticket created: title="${title}", description="${description}", category="${category}"`,
    );
    res.status(201).json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    const agent = await User.findByPk(agentId);
    if (agent.role !== 'AGENT')
      throw new BusinessError(400, 'User is not an agent', 'Ticket');
    if (!agent) throw new NotFoundError('Agent not found', 'Ticket');

    ticket.assigned_to = agentId;
    await ticket.save();

    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

const updateTicketByClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    const { title, description, category } = req.body;
    await ticket.update({ title, description, category });

    await logHistory(
      ticket.id,
      req.user.id,
      `Client updated ticket: title="${title}", description="${description}", category_id=${category}`,
    );

    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

const updateTicketByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    const { priority, status, assigned_to } = req.body;
    await ticket.update({ priority, assigned_to, status });

    await logHistory(
      ticket.id,
      req.user.id,
      `Admin updated ticket: priority="${priority}", status="${status}", assigned_to=${assigned_to}`,
    );

    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    await ticket.destroy();

    await logHistory(id, req.user.id, `Ticket deleted by user`);

    res.json({ message: `Ticket with ID ${id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

const assignTicketToSelf = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const agentId = req.user.id;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found', 'Ticket');
    }

    if (ticket.assigned_to) {
      throw new ForbiddenError('Ticket is already assigned');
    }

    if (ticket.status !== 'PENDING') {
      throw new ForbiddenError('Only pending tickets can be assigned');
    }

    ticket.assigned_to = agentId;
    await ticket.save();

    res.status(200).json({
      message: 'Ticket successfully assigned',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

const resolveTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    if (ticket.status !== 'IN_PROGRESS') {
      throw new BusinessError(
        400,
        'Only tickets with status IN_PROGRESS can be resolved',
        'Ticket',
      );
    }

    await ticket.update({ status: 'RESOLVED' });

    await logHistory(ticket.id, agentId, `Ticket resolved by user ${agentId}`);

    res.json({ message: '✅ Ticket resolved successfully', data: ticket });
  } catch (err) {
    next(err);
  }
};

const getMySolvedTickets = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    const total_solved_tickets = await Ticket.count({
      where: {
        assigned_to: agentId,
        status: 'RESOLVED',
      },
    });

    if (!total_solved_tickets) {
      throw new NotFoundError('You have not solved any tickets yet', 'Ticket');
    }

    res.json({
      agentId,
      total_solved_tickets,
    });
  } catch (err) {
    next(err);
  }
};

const getTotalSolvedTickets = async (req, res, next) => {
  try {
    const total_solved = await Ticket.count({
      where: { status: 'RESOLVED' },
    });

    res.json({ total_solved });
  } catch (err) {
    next(err);
  }
};

const getTotalTicketsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const total_tickets = await Ticket.count({
      where: { user_id: userId },
    });

    res.json({ userId, total_tickets });
  } catch (err) {
    next(err);
  }
};

const getTotalTickets = async (req, res, next) => {
  try {
    const total_tickets = await Ticket.count();

    res.json({ total_tickets });
  } catch (err) {
    next(err);
  }
};

const getAgentWithMostSolvedTickets = async (req, res, next) => {
  try {
    const results = await Ticket.findAll({
      attributes: ['assigned_to', [fn('COUNT', col('id')), 'solved_count']],
      where: {
        status: 'RESOLVED',
        assigned_to: { [Op.ne]: null },
      },
      group: ['assigned_to'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    });

    if (!results.length) {
      return res.json({
        agents: [],
        total_solved: 0,
      });
    }

    const maxSolved = results[0].solved_count;

    const topAgents = results.filter((r) => r.solved_count === maxSolved);

    const agents = await User.findAll({
      where: { id: topAgents.map((a) => a.assigned_to) },
      attributes: ['id', 'name', 'email'],
      raw: true,
    });

    res.json({
      agents,
      total_solved: parseInt(maxSolved, 10),
    });
  } catch (err) {
    next(err);
  }
};

const getAgentWithLeastSolvedTickets = async (req, res, next) => {
  try {
    const results = await Ticket.findAll({
      attributes: ['assigned_to', [fn('COUNT', col('id')), 'solved_count']],
      where: {
        status: 'RESOLVED',
        assigned_to: { [Op.ne]: null },
      },
      group: ['assigned_to'],
      order: [[fn('COUNT', col('id')), 'ASC']],
      raw: true,
    });

    if (!results.length) {
      return res.json({
        agents: [],
        total_solved: 0,
      });
    }

    const minSolved = results[0].solved_count;

    const bottomAgents = results.filter((r) => r.solved_count === minSolved);

    const agents = await User.findAll({
      where: { id: bottomAgents.map((a) => a.assigned_to) },
      attributes: ['id', 'name', 'email'],
      raw: true,
    });

    res.json({
      agents,
      total_solved: parseInt(minSolved, 10),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  getTicketsByUser,
  createTicket,
  updateTicketByAdmin,
  updateTicketByClient,
  deleteTicket,
  assignTicket,
  assignTicketToSelf,
  resolveTicket,
  getMySolvedTickets,
  getTotalSolvedTickets,
  getTotalTicketsByUser,
  getTotalTickets,
  getAgentWithMostSolvedTickets,
  getAgentWithLeastSolvedTickets,
  getMyAssignedTickets,
};
