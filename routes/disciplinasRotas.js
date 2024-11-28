const express = require("express");
const router = express.Router();
const BD = require("../db");

//Listar disciplinas (R - Read)
//Rota localhost:3000/disciplinas/
router.get("/", async (req, res) => {
    try {
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome_disciplina'
        const pg = req.query.pg || 1 //obtendo a pág de dados 

        const limite = 3 // Número de registros por página 
        const offset = (pg - 1) * limite //Quantidade de registros que quero "pular"

        const buscaDados = await BD.query(`
            select d.id_disciplina, d.nome_disciplina, p.nome_professor 
            from disciplinas as d
                left join professores as p on d.id_professor = p.id_professor
            where d.nome_disciplina like $1 or p.nome_professor like $1
            order by ${ordenar}
            limit $2 offset $3`, [`%${busca.toUpperCase()}%`, limite, offset])
        
        const totalItens = await BD.query(`
        select count(*) as total
            from disciplinas as d
                left join professores as p on d.id_professor = p.id_professor
            where d.nome_disciplina like $1 or p.nome_professor like $1
            `, [`%${busca.toUpperCase()}%`])

        const totalpgs = Math. ceil(totalItens.rows[0].total / limite)

        res.render("disciplinasTelas/lista", { 
            vetorDados: buscaDados.rows,
            busca : busca,
            ordenar : ordenar,
            pgAtual : parseInt(pg),
            totalPgs: totalpgs

        })

    } catch ( erro ) {
        console.log('Erro ao listar disciplinas', erro)
        res.render('disciplinasTelas/lista', { mensagem : erro })
    }
})

const listaProfessores = async () => {
    const resultado = await BD.query('select * from professores order by nome_professor')
    return resultado.rows
}

//Rota para abrir tela para criar um nova disciplina (C - Create)
//Endereço localhost:3000/disciplinas/novo
router.get("/novo", async (req, res) => {
    try {
        const professoresCadastrados = await listaProfessores()
        res.render("disciplinasTelas/criar", { professoresCadastrados })

    } catch ( erro ) {
        console.log('Erro ao abrir tela de cadastro de disciplinas', erro)
        res.render('disciplinasTelas/criar', { mensagem : erro })
    }
})

router.post("/novo", async (req, res) => {
    try {
        //const {nome_disciplina, id_professor} = req.body
        const nome_disciplina = req.body.nome_disciplina
        const id_professor = req.body.id_professor
        await BD.query('insert into disciplinas (nome_disciplina, id_professor) values ($1, $2)',
                            [nome_disciplina, id_professor])
        //Redirecionando para a tela de consulta de disciplinas
        res.redirect('/disciplinas/')

    } catch ( erro ) {
        console.log('Erro ao cadastrar disciplinas', erro)
        res.render('disciplinasTelas/criar', { mensagem : erro })
    }
})

router.get('/:id/editar', async(req,res) => {
    try {
        const { id } = req.params
        //const id = req.params.id
        const resultado = 
            await BD.query('select * from disciplinas where id_disciplina = $1', [id])
        //Lista com todos os profs cadastrados para o select
        const profCadastrados =
            await BD.query('select * from professores order by nome_professor')
        res.render('disciplinasTelas/editar', {
            disciplina: resultado.rows[0],
            professoresCadastrados: profCadastrados.rows
        })
    } catch (erro) {
        console.log('Erro ao editar disciplina', erro)
        res.redirect('/disciplinasTelas/editar', { mensagem: erro })
    }
})

router.post('/:id/editar'), async(req, res) => {
    try {
        const { id } = req.params
        const { nome_disciplina, id_professor } = req.body
        await BD.query(`update disciplinas set nome _disciplina = $1, id_professor = $2 where id_disciplina = $3`, [nome_disciplina, id_professor, id])
        res.redirect('/disciplinas/')
    } catch (erro) {
        console.log('Erro ao editar disciplina', erro)
    }
}


module.exports = router