const { Notification } = require('../models');
const NotFoundError = require('../error/NotFoundError');

const getNotificationsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { rows: notifications, count: total_count } =
      await Notification.findAndCountAll({
        where: { user_id: userId },
      });

    res.json({ data: notifications, total_count });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      throw new NotFoundError('Notification not found', 'Notification');
    }

    notification.is_read = true;
    await notification.save();

    res.json({ message: `Notification marked as read` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotificationsByUser,
  markNotificationAsRead,
};
