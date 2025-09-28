const sequelize = require('../config/database');
const Professor = require('./Professor');
const Aluno = require('./Aluno');
const Turma = require('./Turma');
const Progresso = require('./Progresso');
const ProgressoJogo = require('./ProgressoJogo');
const ProfessorTurma = require('./ProfessorTurma');
const AlunoTurma = require('./AlunoTurma');

// Definir relacionamentos

// Relacionamento Professor-Turma (muitos-para-muitos)
Professor.belongsToMany(Turma, {
  through: ProfessorTurma,
  foreignKey: 'professor_id',
  otherKey: 'turma_id',
  as: 'turmas'
});

Turma.belongsToMany(Professor, {
  through: ProfessorTurma,
  foreignKey: 'turma_id',
  otherKey: 'professor_id',
  as: 'professores'
});

// Relacionamento Aluno-Turma (muitos-para-muitos)
Aluno.belongsToMany(Turma, {
  through: AlunoTurma,
  foreignKey: 'aluno_id',
  otherKey: 'turma_id',
  as: 'turmas'
});

Turma.belongsToMany(Aluno, {
  through: AlunoTurma,
  foreignKey: 'turma_id',
  otherKey: 'aluno_id',
  as: 'alunos'
});

// Relacionamento Aluno-Progresso (um-para-muitos)
Aluno.hasMany(Progresso, {
  foreignKey: 'aluno_id',
  as: 'progressos'
});

Progresso.belongsTo(Aluno, {
  foreignKey: 'aluno_id',
  as: 'aluno'
});

// Relacionamento Aluno-ProgressoJogo (um-para-muitos)
Aluno.hasMany(ProgressoJogo, {
  foreignKey: 'aluno_id',
  as: 'progressosJogo'
});

ProgressoJogo.belongsTo(Aluno, {
  foreignKey: 'aluno_id',
  as: 'aluno'
});

// Relacionamento Turma-Progresso (um-para-muitos)
Turma.hasMany(Progresso, {
  foreignKey: 'turma_id',
  as: 'progressos'
});

Progresso.belongsTo(Turma, {
  foreignKey: 'turma_id',
  as: 'turma'
});

// Sincronizar modelos com o banco de dados
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // force: false para não recriar tabelas existentes
    console.log('✅ Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
  }
};

module.exports = {
  sequelize,
  Professor,
  Aluno,
  Turma,
  Progresso,
  ProgressoJogo,
  ProfessorTurma,
  AlunoTurma,
  syncDatabase
};



