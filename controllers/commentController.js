const { Comment, Ticket, User } = require('../models');
const NotFoundError = require('../error/NotFoundError');

const getComments = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const filters = ticketId ? { ticket_id: ticketId } : {};

    const { rows: comments, count: total_count } =
      await Comment.findAndCountAll({
        where: filters,
        include: [
          { model: Ticket, as: 'ticket' },
          { model: User, as: 'author' },
        ],
      });

    res.json({ data: comments, total_count });
  } catch (err) {
    next(err);
  }
};

const getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id, {
      include: [
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'author' },
      ],
    });

    if (!comment) throw new NotFoundError('Comment not found', 'Comment');

    res.json({ data: comment });
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { ticket_id } = req.params;

    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Comment');

    const comment = await Comment.create({
      ticket_id,
      author_id: req.user.id,
      content,
    });

    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
};

const getCommentsByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found', 'Comment');

    const { rows: comments, count: total_count } =
      await Comment.findAndCountAll({
        where: { ticket_id: ticketId },
        include: [
          { model: Ticket, as: 'ticket' },
          { model: User, as: 'author', attributes: ['id', 'email', 'role'] },
        ],
      });

    res.json({ data: comments, total_count });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) throw new NotFoundError('Comment not found', 'Comment');

    comment.content = content;
    await comment.save();

    res.json({ data: comment });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) throw new NotFoundError('Comment not found', 'Comment');

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByTicket,
};
