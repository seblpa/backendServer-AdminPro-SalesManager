// estas 2 librerias son para el token y el middleware de verificación
// mirar tambien en fichero login.js
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ========================================
// VERIFICIAR TOKEN - VAMOS A CREAR UN MIDDLEWARE
// con este middleware, vamos a leer el token
// y ver si el usuario puede seguir en estas rutas,
// por ej. eliminar, crear, actualizar.
// Las rutas a continuación necesitan autenticación
// y por eso debemos verificar el token
// ========================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });

    });

};