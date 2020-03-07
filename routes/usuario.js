const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Registro do usuario
router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

//Autenticando a senha do usuario
router.post("/registro", (req, res) => {
    var erro = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erro.push({text: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erro.push({text: "E-mail inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erro.push({text: "Senha inválida"})
    }

    if(req.body.senha.length < 6){
        erro.push({text: "A senha digitada é muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erro.push({text: "As senhas digitas são diferentes, por favor tente novamente"})
    }

    if(erro.length > 0){
        res.render("usuarios/registro", {erro: erro})
    } else { //Verificar se existe um usuario ja cadastradro buscando pelo e-mail cadastrado
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Esse email ja possui um cadastro no sistema!");
                res.redirect("/usuarios/registro");
            } else {
                //Criando um usuario
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha,salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro ao salvar os dados do usuário")
                            res.redirect("/usuarios/registro")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Ocorreu um erro ao criar o usuário, tente novamente mais tarde")
                            res.redirect("/usuarios/registro")
                        })
                    }) 
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro no sistema")
            res.redirect("/")
        })
    }
})

//Formulario de login 
router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

//Rota de autenticação
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/", //Autentição realizada com sucesso
        failureRedirect: "/usuarios/login", //Falha na autentição
        failureFlash: true
    }) (req, res, next)
})

//Rota de Logout
router.get("/logout",(req, res) => {
    req.logout()
    req.flash("success_msg", "Usuário desconectado")
    res.redirect("/")
})



module.exports = router