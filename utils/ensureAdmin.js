const bcrypt = require('bcrypt');
const { User } = require('../models');

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';

  if (!email || !password) {
    console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    return;
  }

  const existingAdmin = await User.findOne({ where: { email } });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashed,
      status: 'ACTIVE',
      role: 'ADMIN',
    });
    console.log(`✅ Default admin created: ${email}`);
  } else {
    console.log('ℹ️ Admin already exists, skipping creation.');
  }
}

module.exports = ensureAdmin;
