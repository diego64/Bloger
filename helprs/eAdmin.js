//Verificar se o usuario autenticado tem permissões de administrador
module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }
        req.flash("error_msg", "Você prescisa ter permissão de administrador para poder acessar") 
        res.redirect("/")
    }
}