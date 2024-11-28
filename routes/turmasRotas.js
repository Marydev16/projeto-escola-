const express = require('express');
const BD = require('../db');
const router = express.Router();

// Listar turmas (R – Read)
router.get('/', async (req, res) => {
  const resultado = await BD.query('SELECT * FROM turmas_escola');
  res.render('turmasTelas/lista', { turmas: resultado.rows });
});

//Rota para abrir tela para criar um nova turma (C - Create)
//Para acessar /turmas/novo
router.get("/novo", (req, res) => {
  res.render("turmasTelas/criar");
});

router.post("/novo", async (req, res) => {
  try {
    const { nome_turma } = req.body;
    await BD.query(
      `insert into turmas_escola (nome_turmas) values ($1)`,
      [nome_turma]
    );
    res.redirect("/turmas");
  } catch (erro) {
    // Retornar uma resposta com o erro
    res.render("turmasTelas/criar", {mensagem: erro})
  }
});

//Excluindo uma turma (D - Delete)
//Para acessar /turmas/1/deletar
router.post("/:id/deletar", async (req, res) => {
  const { id } = req.params;
  await BD.query("delete from turmas_escola where id_turma = $1", [id]);
  res.redirect("/turmas");
});

//Editar uma turma (U - Update)
//Para acessar /turmas/4/editar
router.get("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const resultado = await BD.query(
    "select * from turmas_escola where id_turma = $1",
    [id]
  );
  res.render("turmasTelas/editar", { turma: resultado.rows[0] });
});

router.post("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const { nome_turma } = req.body;
  await BD.query(
    `update turmas_escola set nome_turma = $1 where id_turma = $2 `,
    [nome_turma, id]
  );
  res.redirect("/turmas");
});

module.exports = router;
