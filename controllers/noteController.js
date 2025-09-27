const { Note, Ticket } = require('../models');
const NotFoundError = require('../error/NotFoundError');
const BusinessError = require('../error/BusinessError');

const getAllNotes = async (req, res, next) => {
  try {
    const filters = req.filters || {};
    const pagination = req.pagination || {};

    const { count, rows } = await Note.findAndCountAll({
      where: filters,
      ...pagination,
    });
    if (!rows.length) throw new NotFoundError('No notes found', 'Note');

    res.json({ data: rows, total_count: count });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);
    if (!note) throw new NotFoundError('Note not found', 'Note');
    res.json(note);
  } catch (error) {
    next(error);
  }
};

const getNotesByTicketId = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const notes = await Note.findAll({
      where: { ticket_id: ticket_id },
      include: [
        { model: User, as: 'agent', attributes: ['id', 'email', 'role'] },
      ],
    });
    if (!notes.length)
      throw new NotFoundError('No notes found for this ticket', 'Note');
    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new BusinessError('Content is required to create a note', 'note');
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Ticket');

    const note = await Note.create({
      ticket_id: ticketId,
      agent_id: req.user.id,
      content,
    });

    const fullNote = await Note.findByPk(note.id, {
      include: [
        { association: 'agent', attributes: ['id', 'email'] },
        { association: 'ticket', attributes: ['id', 'title'] },
      ],
    });

    res.status(201).json({ data: fullNote });
  } catch (error) {
    console.error('Error creating note:', error);
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const note = await Note.findByPk(id);
    if (!note) throw new NotFoundError('Note not found', 'Note');

    note.content = content;
    await note.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);
    if (!note) throw new NotFoundError('Note not found', 'Note');

    await note.destroy();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  getNotesByTicketId,
  createNote,
  updateNote,
  deleteNote,
};
