const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    eAdmin: {       //Verificação se o usuário é administrador ou não    
        type: Number,
        default: 0  // 0 é o usuário comum e 1 é usuário administrador
    },
    senha: {
        type: String,
        required: true
    }
})

mongoose.model("usuarios", Usuario);