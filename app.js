const express = require('express')
const path = require('path')
const session = require('express-session')

const app = express()

//Configurações do Servidor
app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs')  //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json());  // utilizar dados em formato JSON
app.use(session({
    secret:'SesiSenai', //Um segredo para assinar a sessão
    resave: false,
    saveUninitialized: true //Se não houver dados na sessão, não salva
}))

//Middleware pra verificar se o usuario esta logado
const VerificarAutenticacao = (req, res, next) => {
    if (req.session.usuarioLogado) {
        //Disponibilizando o nomeUsuario da sessão para a tela .ejs
        res.locals.nomeUsuario = req.session.nomeUsuario
        next()
    } else {
        res.redirect('/auth/login')
    }
}

//Rota da página principal "Landing Page"
app.get('/', (req, res) => {
    //    views/landing/index.ejs
    res.render('landing/index')
})

//Utilizando Rotas Admin
const adminRotas = require('./routes/admin')
app.use('/admin', VerificarAutenticacao, adminRotas)

//Utilizando Rotas de Professores
const professoresRotas = require('./routes/professoresRotas')
app.use('/professores', VerificarAutenticacao, professoresRotas)

//Utilizando Rotas de Turmas
const turmasRotas = require('./routes/turmasRotas')
app.use('/turmas', VerificarAutenticacao, turmasRotas)

//Utilizando Rotas de Disciplinas
const disciplinasRotas = require('./routes/disciplinasRotas')
app.use('/disciplinas', VerificarAutenticacao, disciplinasRotas)


//Utilizando Rotas de login
const loginRotas = require('./routes/loginRotas')
app.use('/auth', loginRotas)

//Utilizando Rotas de alunos
const alunosRotas = require('./routes/alunosRotas')
app.use('/alunos', VerificarAutenticacao, alunosRotas)

const porta = 3000
app.listen(porta, () => {
    console.log(`Servidor rodando na porta http://localhost:${porta}`)
})