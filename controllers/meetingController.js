const { Meeting, Ticket, User } = require('../models');
const NotFoundError = require('../error/NotFoundError');
const ForbiddenError = require('../error/ForbiddenError');

const getAllMeetings = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    const { rows: meetings, count: total_count } =
      await Meeting.findAndCountAll({
        where: { agent_id: agentId },
        include: [
          { model: Ticket, as: 'ticket' },
          { model: User, as: 'client' },
          { model: User, as: 'agent' },
        ],
      });

    res.json({ data: meetings, total_count });
  } catch (err) {
    next(err);
  }
};

const getMeetingsByTicketId = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    const { rows: meetings, count: total_count } =
      await Meeting.findAndCountAll({
        where: { ticket_id: ticketId },
        include: [
          { model: Ticket, as: 'ticket' },
          { model: User, as: 'client' },
          { model: User, as: 'agent' },
        ],
      });

    res.json({ data: meetings, total_count });
  } catch (err) {
    next(err);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id, {
      include: [
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'client' },
        { model: User, as: 'agent' },
      ],
    });

    if (!meeting) throw new NotFoundError('Meeting not found', 'Meeting');
    res.json({ data: meeting });
  } catch (err) {
    next(err);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const { ...rest } = req.body;
    const { ticket_id } = req.params;
    const client_id = req.user.id;

    const client = await User.findByPk(client_id);
    const ticket = await Ticket.findByPk(ticket_id);

    if (!client) throw new NotFoundError('User not found', 'Meeting');
    if (!ticket) throw new NotFoundError('Ticket not found', 'Meeting');

    if (ticket.status === 'CLOSED') {
      throw new ForbiddenError(
        'Cannot create meeting for closed ticket',
        'Meeting',
      );
    }

    const meeting = await Meeting.create({
      ticket_id,
      client_id,
      status: 'ACCEPTED',
      ...rest,
    });

    res.status(201).json({ data: meeting });
  } catch (err) {
    next(err);
  }
};

const requestMeeting = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const client_id = req.user.id;

    const client = await User.findByPk(client_id);
    const ticket = await Ticket.findByPk(ticket_id);

    if (!ticket) throw new NotFoundError('Ticket not found', 'Meeting');

    if (ticket.status === 'CLOSED') {
      throw new ForbiddenError(
        'Cannot request meeting for closed ticket',
        'Meeting',
      );
    }

    const meetingRequest = await Meeting.create({
      ticketId,
      client_id,
      agent_id: ticket.assigned_to,
    });

    res.status(201).json({ data: meetingRequest });
  } catch (err) {
    next(err);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    if (!meeting) throw new NotFoundError('Meeting not found', 'Meeting');

    const { meeting_link, status, scheduled_at } = req.body;
    await meeting.update({ meeting_link, status, scheduled_at });

    res.json({ data: meeting });
  } catch (err) {
    next(err);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    if (!meeting) throw new NotFoundError('Meeting not found', 'Meeting');

    await meeting.destroy();
    res.json({ message: `Meeting with ID ${id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMeetings,
  getMeetingsByTicketId,
  getMeetingById,
  createMeeting,
  requestMeeting,
  updateMeeting,
  deleteMeeting,
};
