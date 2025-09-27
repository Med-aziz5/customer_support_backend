module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ticket_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    agent_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'notes',
    timestamps: true,
    underscored: true,
    defaultScope: {
      include: [
        { association: 'ticket' },
        { association: 'agent' },
      ],
            attributes: {
        exclude: ['created_at', 'updated_at', 'deleted_at'],
      },
    },
  });

  Note.associate = (models) => {
    Note.belongsTo(models.Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
    Note.belongsTo(models.User, { foreignKey: 'agent_id', as: 'agent' });
  };

  return Note;
};
