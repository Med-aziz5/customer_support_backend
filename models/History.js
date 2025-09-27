module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define('History', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

  }, {
    timestamps: true,
    paranoid: true, 
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ['created_at', 'updated_at', 'deleted_at']
      }
    },
  });

   History.associate = models => {
    History.belongsTo(models.Ticket, {
      foreignKey: 'ticket_id',
      onDelete: 'SET NULL'
    });
  }; 

  return History;
};