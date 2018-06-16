var express = require('express');

// En este fichero médico, no usamos BCRYPT ni jwt(jsonwebtoken)
// Middleware para verificar token
var mdAutentication = require('../middlewares/autentication');

var app = express();

var Medico = require('../models/medico');


// ========================================
// OBTENER TODOS LOS MEDICOS
// ========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        // .skip, .limit, .exec, .save son funciones del mongoose
        // limit es para hacer la páginación de los resultados del get
        // aqui tendremos 5 por páginas con el .limit y la var desde
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando médico',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        // mensaje: 'ok',
                        medicos: medicos,
                        total: conteo
                    });

                });

            });

});

// ========================================
// ACTUALIZAR MÉDICO
// ========================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id ' + id + 'no existe',
                errors: { mensaje: 'No existe un medico con este id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                // mensaje: 'la actualización de medicos funciona',
                medico: medicoGuardado
            });

        });

    });

});

// ========================================
// CREAR NUEVOS MEDICOS - se usa aqui la librería BODY PARSER
// ========================================

app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            // message: 'el medico se ha creado correctamente'
        });

    });

});

// ========================================
// ELIMINAR MEDICO por el id
// ========================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un medico con este id',
                errors: { mensaje: 'no existe un medico con este id' }
            });
        }
        res.status(200).json({
            ok: true,
            // mensaje: 'el medico se ha eliminado correctamente',
            medico: medicoBorrado

        });

    });

});

module.exports = app;