var express = require('express');

// En este fichero hospital, no usamos BCRYPT ni jwt(jsonwebtoken)
// Middleware para verificar token
var mdAutentication = require('../middlewares/autentication');

var app = express();

var Hospital = require('../models/hospital');


// ========================================
// OBTENER TODOS LOS HOSPITALES
// ========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        // .skip, .limit, .exec, .save son funciones del mongoose
        // limit es para hacer la páginación de los resultados del get
        // aqui tendremos 5 por páginas con el .limit y la var desde
        .skip(desde)
        .limit(5)
        // con .populate obtenemos los datos del usuario (nombre e email)
        // y desaparece el id
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        // mensaje: 'ok',
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });

});

// ========================================
// ACTUALIZAR HOSPITAL
// ========================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id ' + id + 'no existe',
                errors: { mensaje: 'No existe un hospital con este id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                // mensaje: 'la actualización de hospitales funciona',
                hospital: hospitalGuardado
            });

        });

    });

});

// ========================================
// CREAR NUEVOS HOSPITALES - se usa aqui la librería BODY PARSER
// ========================================

app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            // message: 'el hospital se ha creado correctamente'
        });

    });

});

// ========================================
// ELIMINAR HOSPITAL por el id
// ========================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un hospital con este id',
                errors: { mensaje: 'no existe un hospital con este id' }
            });
        }
        res.status(200).json({
            ok: true,
            // mensaje: 'el mensaje se ha eliminado correctamente',
            hospital: hospitalBorrado

        });

    });


});

module.exports = app;