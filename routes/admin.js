const express = require('express')
const router = express.Router()
const BD = require ("../db")

//Rota principal do Painel Administrativo
router.get('/', async (req, res) => {
    const qAlunos = await BD.query(`
        select count(*) as total_alunos from alunos`)

    const qDisciplinas = await BD.query(`
        select count(*) as total_disciplinas from disciplinas`)

    const qMediaDisciplinas = await BD.query(`
        select d.nome_disciplina, avg(ad.media) as media
        from disciplinas as d 
            inner join aluno_disciplina as ad on d.id_disciplina = ad.id_disciplina
        group by d.nome_disciplina`)
    
    const qStatusAluno = await BD.query(`
        select status, count(*) as total from aluno_disciplina group by status`)

    res.render('admin/dashboard', {
        totalAlunos : qAlunos.rows[0].total_alunos,
        totalDisciplinas : qDisciplinas.rows[0].total_disciplinas,
        mediaDisciplinas : qMediaDisciplinas.rows,
        statusAluno : qStatusAluno.rows
    })
})

module.exports = router