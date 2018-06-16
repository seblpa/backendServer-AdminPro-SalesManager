var express = require('express');

// ========================================
// BCRYPT - se usa esta libreria para encryptar contraseña del usuario
var bcrypt = require('bcryptjs');
// ========================================

var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autentication');

var app = express();

var Usuario = require('../models/usuario');

// ========================================
// OBTENER TODOS LOS USUARIOS
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        // .skip, .limit, .exec, .save son funciones del mongoose
        // limit es para hacer la páginación de los resultados del get
        // aqui tendremos 5 por páginas con el .limit y la var desde
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando BBDD!',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                });

            });

});


// ========================================
// ACTUALIZAR USUARIO
// ========================================
app.put('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario!',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con este id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar usuario!',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

// ========================================
// CREAR NUEVOS USUARIOS - se usa aqui la librería BODY PARSER
// ========================================
app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'error al crear usuario!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ========================================
// ELIMINAR USUARIO por el id
// ========================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'error al borrar usuario!',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con este id',
                errors: { message: 'No existe un usuario con este id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado

        });

    });

});

module.exports = app;