const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const { User } = require('../../../models');

async function seedUsers() {
  try {
    const users = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream('admin.csv')
        .pipe(csv())
        .on('data', (row) => users.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: hashedPassword,
        role: user.role || 'user',
        status: user.status || 'pending',
      });
      console.log(`✅ Seeded user: ${user.email}`);
    }

    console.log('🎉 All users seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
}

seedUsers();
