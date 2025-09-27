const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { UserInfo: { id: user.id, role: user.role } },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION },
  );

  const refreshToken = jwt.sign(
    { UserInfo: { id: user.id } },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION },
  );

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
