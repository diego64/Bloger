//Configução dos modulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias"); 
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);

//Sessão
app.use(session({
    secret: "nodemoduleexpress",
    resave: true,
    saveUninitialized: true
}));

//Configuração do passport
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Middlewares 
app.use((req, res, next) => {
    //Variaveis Globais
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
});

//Body-Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'})); //config
app.set('view engine', 'handlebars'); //Template Engine

//Banco de Dados
mongoose.connect('mongodb+srv://omnistack:omnistack@omnistack-77ls0.mongodb.net/bloger?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

//Public
    app.use(express.static(path.join(__dirname,"public")));

//Rotas

//Rota Principal (Home Page)
app.get('/',(req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens} )
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro em nosso sistema, mas não se preocupe, já estamos trabalhando para normalizar o mais rápido possivél")
        res.redirect("/404")
    })

//Leia Mais
app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
            res.render("postagem/index", {postagem: postagem})
        }else{
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu uma falha no sistema")
        res.redirect("/")
    })
})

//Rota de erro
app.get("/404", (req, res) => {
    res.send('Erro 404!')
})
    
});

//Listar Categorias
app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listas as categorias, tente novamente mais tarde" +err)
        res.redirect("/")
    })
})

//Redirecionamento para um categoria em especifico 
app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
             //Postagem.findById(categoria).then((postagens) => {
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

            }).catch((err) => {
                req.flash("error_msg", "Erro ao listar as categorias, tente novamente mais tarde" +err)
                res.redirect("/")
            })

        }else{
            req.flash("error_msg", "Esta categoria não está registrada em nosso banco de dados" +err)
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar as categorias, tente novamente mais tarde" +err)
        res.redirect("/")
    })
})

//Administrador
app.use('/admin', admin);

//Usuario
app.use("/usuarios", usuarios)

const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor Rondando com Sucesso *.*")
})