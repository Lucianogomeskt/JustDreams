const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlunoTurma = sequelize.define('AlunoTurma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
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
  data_entrada: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'alunos_turmas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AlunoTurma;



