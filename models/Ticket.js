const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define(
    'Ticket',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
        defaultValue: 'PENDING',
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      assigned_to: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM('BUG', 'FEATURE_REQUEST', 'SUPPORT', 'BILLING'),
        allowNull: false,
      },
    },
    {
      tableName: 'tickets',
      paranoid: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      defaultScope: {
        attributes: {
          exclude: ['created_at', 'updated_at', 'deleted_at'],
        },
      },
    },
  );

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
    });

    Ticket.belongsTo(models.User, {
      as: 'assignedTo',
      foreignKey: 'assigned_to',
    });
  };

  Ticket.afterUpdate(async (ticket, options) => {
    if (ticket.assigned_to && ticket.status === 'PENDING') {
      await ticket.update(
        { status: 'IN_PROGRESS' },
        { transaction: options.transaction, hooks: false },
      );
    }
  });

  return Ticket;
};
