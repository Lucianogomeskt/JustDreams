const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressoJogo = sequelize.define('ProgressoJogo', {
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
  fase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  acertos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  erros: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  tempo_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Tempo total em segundos'
  },
  tempo_por_pergunta: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Tempo médio por pergunta em segundos'
  },
  status: {
    type: DataTypes.ENUM('em_andamento', 'concluido', 'pausado'),
    allowNull: false,
    defaultValue: 'em_andamento'
  },
  nivel_dificuldade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    }
  },
  pontuacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Pontuação calculada baseada no desempenho'
  },
  medalha: {
    type: DataTypes.ENUM('bronze', 'prata', 'ouro', 'diamante'),
    allowNull: true
  },
  tentativas_por_pergunta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array com número de tentativas por pergunta'
  },
  operacoes_usadas: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Contador de operações matemáticas usadas'
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'progresso_jogo',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['aluno_id', 'fase_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['data_inicio']
    }
  ]
});

module.exports = ProgressoJogo;
