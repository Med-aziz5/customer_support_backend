const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../error/NotFoundError');
const UnauthorizedError = require('../error/UnauthorizedError');
const Forbidden = require('../error/ForbiddenError');
const { User } = require('../models');
const { sendResetCodeEmail } = require('../utils/email');
const { generateTokens } = require('../utils/tokenGenerator');
const ConflictError = require('../error/ConflictError');

const register = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (!!existingUser)
      throw new ConflictError('User with same email already exist', 'AUTH');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      ...rest,
      password: hashedPassword,
      role: 'CLIENT',
      status: 'ACTIVE',
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        accessToken,
        user: {
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAgent = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (!!existingUser)
      throw new ConflictError('agent with same email already exist', 'AUTH');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      ...rest,
      password: hashedPassword,
      role: 'AGENT',
      status: 'ACTIVE',
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        accessToken,
        user: {
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: ['email', 'password', 'id', 'role'],
    });

    if (!user) throw new NotFoundError('User not found', 'User');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError('Invalid password');

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'User logged in successfully',
      data: {
        accessToken,
        user: {
          email: user.email,
          role: user.role,
          id: user.id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const user = req.user;

    const userDetails = await User.findOne({
      where: { id: user.id },
    });

    res.send({
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      role: userDetails.role,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { old_Password, new_Password } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'password'],
    });
    if (!user) throw new NotFoundError('User not found', 'User');

    const isMatch = await bcrypt.compare(old_Password, user.password);
    if (!isMatch)
      throw new UnauthorizedError('Old password is incorrect', 'AUTH');

    const hashedPassword = await bcrypt.hash(new_Password, 10);
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

//this function is not working for now
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new NotFoundError('User not found', 'User');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    resetCodes[email] = { code, expiresAt };

    try {
      await sendResetCodeEmail(user, code);
    } catch (emailError) {
      console.error('Reset code email failed:', emailError);
    }

    res.status(200).json({ message: 'Reset code sent to your email' });
  } catch (error) {
    next(error);
  }
};
//this function is not working for now
const resetPasswordWithCode = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new NotFoundError('User not found', 'User');

    const stored = resetCodes[email];
    if (!stored || stored.code !== code || stored.expiresAt < Date.now()) {
      throw new UnauthorizedError('Invalid or expired code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    delete resetCodes[email];

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt)
      throw new UnauthorizedError('No refresh token provided', 'AUTH');

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            throw new UnauthorizedError('Refresh token expired', 'AUTH');
          } else {
            throw new Forbidden('Invalid refresh token', 'AUTH');
          }
        }

        const foundUser = await User.findByPk(decoded.UserInfo.id);
        if (!foundUser) throw new UnauthorizedError('User not found', 'AUTH');

        const { accessToken } = generateTokens(foundUser);
        res.json({ accessToken });
      },
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  createAgent,
  login,
  logout,
  getUserDetails,
  refresh,
  changePassword,
  requestPasswordReset,
  resetPasswordWithCode,
};
