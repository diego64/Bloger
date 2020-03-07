const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Model do usuario
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function(passport){ //Campo que será analisado

passport.use(new localStrategy({usernameField: 'email', passwordField: "senha" }, (email, senha, done) => {
    Usuario.findOne({email: email}).then((usuario) => {
        if(!usuario){
            return done(null, false, {message: "Está conta não está registrada em nosso banco de dados"})
        }

        bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if(batem){
                return done(null, usuario)
            }else {
                return done(null, false, {message: "Senha incorreta"})
            }
        } )
    })
})) 

//Salvar os dados do usuario em uma sessão
passport.serializeUser((usuario, done) => { 
    done(null, usuario.id)
})

passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
        done(err, usuario)
    })
})
}