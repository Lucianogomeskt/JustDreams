const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Amizade = sequelize.define('Amizade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Aluno',
      key: 'id'
    }
  },
  amigoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Aluno',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pendente', 'aceito', 'recusado'),
    defaultValue: 'pendente',
    allowNull: false
  }
}, {
  tableName: 'amizades',
  timestamps: true
});

module.exports = Amizade;