module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    'Feedback',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      ticket_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'feedbacks',
      timestamps: true,
      paranoid: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    },
  );

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Ticket, {
      foreignKey: 'ticket_id',
      as: 'ticket',
    });
    Feedback.belongsTo(models.User, {
      foreignKey: 'client_id',
      as: 'client',
    });
  };

  return Feedback;
};
