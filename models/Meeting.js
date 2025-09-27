const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Meeting = sequelize.define(
    'Meeting',
    {
      ticket_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      agent_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
        defaultValue: 'PENDING',
      },
      meeting_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: 'meetings',
      paranoid: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      defaultScope: {
        attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
      },
    },
  );

  Meeting.associate = (models) => {
    Meeting.belongsTo(models.Ticket, { as: 'ticket', foreignKey: 'ticket_id' });
    Meeting.belongsTo(models.User, { as: 'client', foreignKey: 'client_id' });
    Meeting.belongsTo(models.User, { as: 'agent', foreignKey: 'agent_id' });
  };

  return Meeting;
};
