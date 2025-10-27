const { Aluno, syncDatabase } = require('../../../../../src/models');

(async () => {
  try {
    await syncDatabase();
    const alunos = await Aluno.findAll({ attributes: ['id','nome','turma'], limit: 50 });
    console.log('Alunos encontrados:', alunos.map(a => a.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error('Erro listando alunos:', err);
    process.exit(1);
  }
})();