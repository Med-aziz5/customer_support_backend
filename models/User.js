const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      role: {
        type: DataTypes.ENUM('CLIENT', 'AGENT', 'ADMIN'),
        allowNull: false,
        defaultValue: 'CLIENT',
      },
      status: {
        type: DataTypes.ENUM(
          'ACTIVE',
          'INACTIVE',
          'SUSPENDED',
          'PENDING',
          'DELETED',
        ),
      },
    },
    {
      tableName: 'users',
      paranoid: true,
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      defaultScope: {
        attributes: {
          exclude: ['password', 'created_at', 'updated_at', 'deleted_at'],
        },
      },
    },
  );

  User.associate = (models) => {
    User.hasMany(models.Ticket, { foreignKey: 'user_id' });
    User.hasMany(models.Ticket, { foreignKey: 'assigned_to' });
  };

  return User;
};
