const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfessorTurma = sequelize.define('ProfessorTurma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  professor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'professores',
      key: 'id'
    }
  },
  turma_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'turmas',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'professores_turmas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProfessorTurma;



