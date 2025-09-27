const { User } = require('../models');
const NotFoundError = require('../error/NotFoundError');

const getAllUsers = async (req, res, next) => {
  try {
    const { rows: users, count: total_count } = await User.findAndCountAll();
    res.json({ data: users, total_count });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) throw new NotFoundError('User not found', 'User');

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found', 'User');

    const { name, email, role } = req.body;
    await user.update({ name, email, role });

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found', 'User');

    await user.destroy();
    res.json({ message: `User with ID ${id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
