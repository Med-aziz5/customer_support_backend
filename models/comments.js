module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    'Comment',
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
      author_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'comments',
      timestamps: true,
      paranoid: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    },
  );

  Comment.associate = (models) => {
    Comment.belongsTo(models.Ticket, { as: 'ticket', foreignKey: 'ticket_id' });
    Comment.belongsTo(models.User, { as: 'author', foreignKey: 'author_id' });
  };

  return Comment;
};
