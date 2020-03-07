const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
//Carregando o modelo de Categorias
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
//Carregando o modelo de Postagens
require('../models/Postagem');
const Postagem = mongoose.model("postagens");
const {eAdmin} = require("../helprs/eAdmin");

//Pagina Principal
router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
});

//Pagina dos Post
router.get('/post',(req, res) => {
    res.post("Pagina de posts")
});

//Listar Categorias
router.get("/categorias", (req, res) => {
    //Listagem das categorias reegistradas
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias}) 
    }).catch((err) => {
        req.flash("error_msg", "Houve uma fala ao listas as categorias")
        res.redirect("/admin")
    })
    
});

//Adcionar Categorias
router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias")
});

//Pagina de cadastro de categorias
router.post("/categorias/nova",eAdmin, (req, res) => {
    
    //Validação de formulário
    var erro = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erro.push({text: "Nome inválido"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){
        erro.push({text: "Slug inválido"})
    }
    
    if(req.body.nome.length < 2) {
        erro.push({text: "Nome da categoria muito pequeno"})
    }
    
    if(req.body.slug.length < 2) {
        erro.push({text: "Slug da categoria muito pequeno"})
    }
    
    if(erro.length > 0){
        res.render("admin/addcategorias", {erro: erro})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
               req.flash("success_msg", "Categoria criada com sucesso!")
               res.redirect("/admin/categorias")
        }).catch((erro) => {
                req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente mais tarde!")
                res.redirect("/admin")
        })
    }
});

//Edição de categorias (Primeira Parte)
router.get("/categoria/edit/:id", eAdmin, (req, res) => {
    //Trazer os dados da categoria 
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe em nosso banco de dados")
        res.redirect("/admin/categorias")
    })  
})
//Edição de categorias (Segunda Parte)
router.post("/categorias/edit", eAdmin, (req,res) => {

    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editado com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um falha ao salvar a edição, tente novamente mais tarde")
            res.redirect("/admin/categorias")
        })
    
    
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria, tente novamente mais tarde")
        res.redirect("/admin/categorias")
    })
})

//Exclusão de categorias
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
        
    }).catch((err) => {
        req.flash("error_msg", "Houve um falha ao deletar a categoria, tente novamente mais tarde")
        res.redirect("/admin/categorias")
        
    })
})

//Pagina de listagens das postagens
router.get("/postagens", eAdmin, (req, res) => {
//Listar as postagens de cada cadegoria
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao listar as postagens, tente novamente mais tarde")
        res.redirect("/admin")
    })
});

//Lisagens das categorias cadastradas
router.get("/postagens/add", eAdmin,  (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao carregar o formulário")
        res.redirect("/admin")
        console.log(err)
    })
    
})

//Adcionado as postagens nas categorias
router.post("/postagens/nova", eAdmin, (req, res) => {
    var erro = []

    if(req.body.categoria == "0") {
        erro.push({text: "Categoria inválida, registre uma categoria"})
    }

    if(erro.length > 0){
        res.render("admin/addpostagem", {erro: erro})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro ao listar as cadastrar sua postagem, tente novamente mais tarde");
            res.redirect("/admin/postagens")
            console.log(err);
        })
    }
});

//Edição de postagens 
    router.get("/postagens/edit/:id", eAdmin, (req, res) => {
        //Preechendo os campos automaticos com os dados da postagem
        Postagem.findOne({_id: req.params.id}).then((postagem) => {

            Categoria.find().then((categorias) => {
                res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
            }).catch((err) => {
                req.flash("error_msg", "Ocoreu um erro ao carregar ao listar as categorias, tente novamente mais tarde") 
                res.redirect("/admin/postagens")
            })
        }).catch((err) => {
            req.flash("error_msg", "Ocoreu um erro ao carregar o formulário de edição, tente novamente mais tarde")
            res.redirect("/admin/postagens")
        })
    })

//Atualização dos dados editados
router.post("/postagem/edit", (req, res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!");
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro no sistema")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Ocoreu um erro ao salvar a edição, tente novamente mais tarde")
        res.redirect("/admin/postagens")
    })
})

//Exluir uma postagem
router.get("/postagens/deletar/:id", (req, res) => { 
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Erro no sistema")
        res.redirect("/admin/postagens")
    })
})

module.exports = router;