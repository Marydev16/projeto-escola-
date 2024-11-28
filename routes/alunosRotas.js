const express = require("express");
const router = express.Router();
const BD = require("../db");

//Listar alunos (R - Read)
//Rota localhost:3000/alunos/
router.get("/", async (req, res) => {
    try {
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome'

        const buscaDados = await BD.query(`
            select a.nome, a.sexo, t.nome_turma, a.idade, a.sexo, a.id_aluno
            from alunos a
                inner join turmas_escola as t on a.id_turma = t.id_turma
            where upper(a.nome) like $1 or upper(t.nome_turma) like $1
            order by ${ordenar}`, [`%${busca.toUpperCase()}%`])
        res.render("alunosTelas/lista", { 
                    vetorDados: buscaDados.rows,
                    busca : busca,
                    ordenar: ordenar })

    } catch ( erro ) {
        console.log('Erro ao listar alunos', erro)
        res.render('alunosTelas/lista', { mensagem : erro, vetorDados: []})
    }
})

//Rota para abrir tela para criar um novo aluno (C - Create)
//Endereço localhost:3000/alunos/novo
router.get("/novo", async (req, res) => {
    try {
        const resultado = 
            await BD.query('select * from turmas_escola order by nome_turma')
        res.render("alunosTelas/criar", { turmasCadastradas: resultado.rows })

    } catch ( erro ) {
        console.log('Erro ao abrir tela de cadastro de alunos', erro)
        res.render('alunosTelas/criar', { mensagem : erro })
    }
})

router.post("/novo", async (req, res) => {
    try {
        const nome_aluno = req.body.nome
        const idade = req.body.idade
        const email = req.body.email
        const cpf = req.body.cpf
        const sexo = req.body.sexo
        const id_turma = req.body.id_turma
        await BD.query('insert into alunos (nome, idade, email, cpf, sexo, id_turma) values ($1, $2, $3, $4, $5, $6)',
                            [nome_aluno, idade, email, cpf, sexo, id_turma])
        //Redirecionando para a tela de consulta de alunos
        res.redirect('/alunos/')

    } catch ( erro ) {
        console.log('Erro ao cadastrar alunos', erro)
        res.render('alunosTelas/criar', { mensagem : erro })
    }
})

router.get('/:id/editar', async(req, res) => {
    try {
        const { id } = req.params
        const resultado = 
            await BD.query('select * from alunos where id_aluno = $1', [id])
        
        const turmasCadastradas = 
            await BD.query('select * from turmas_escola order by nome_turma')

        const disciplinasCadastradas = 
            await BD.query('select * from disciplinas order by nome_disciplina')
        
        const notas = await BD.query(`
            select d.nome_disciplina, ad.media, ad.nr_faltas, ad.status
            from disciplinas as d 
                inner join aluno_disciplina as ad on d.id_disciplina = ad.id_disciplina 
            where ad.id_aluno = $1
        `, [id])

        res.render('alunosTelas/editar', {
            aluno: resultado.rows[0],
            turmasCadastradas: turmasCadastradas.rows, 
            disciplinasCadastradas : disciplinasCadastradas.rows,
            notas: notas.rows
        })
    } catch (erro) {
        console.log('Erro ao editar aluno', erro);
    }
})

router.post('/:id/editar', async(req, res) => {
    try {
        const { id } = req.params
        const { nome, idade, email, cpf, sexo, id_turma } = req.body
        await BD.query(`update alunos 
                set nome = $1, 
                idade = $2,
                email = $3,
                cpf = $4,
                sexo = $5,
                id_turma = $6
                where id_aluno = $7`, [nome, idade, email, cpf, sexo, id_turma, id  ])
        res.redirect('/alunos/')
    } catch (erro) {
        console.log('Erro ao gravar aluno', erro);        
    }
})

//Criando rota para lançar uma nota 
router.post('/:id/lancar-nota', async(req, res) => {
    try {
        const { id } = req.params
        const { media, faltas, id_disciplina } = req.body
        await BD.query(`insert into aluno_disciplina
                      (id_disciplina, id_aluno, media, nr_faltas) values 
                      ($1, $2, $3, $4)
            `, [id_disciplina, id, media, faltas ])
        res.redirect(`/alunos/${id}/editar`)
    } catch (erro) {
        console.log('Erro ao gravar aluno', erro);        
    }
})

module.exports = router