// Requires
var express = require('express');

// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =====================================================================
// BUSQUEDA POR COLECCION
// =====================================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla; // esto es la colección donde queremos buscar
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda solo son: usuarios, médicos y hospitales',
                error: { mensaje: 'Tipo de tabla/colección no válido' }
            });
    }

    promesa.then(data => {

        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});




// =====================================================================
// BUSQUEDA GENERAL
// =====================================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // ahora creamos una expressión regular para la búsqueda
    var regex = new RegExp(busqueda, 'i'); //aquí sirve para q sea insensible a 
    // minuscula y mayuscula

    // aqui se podría poner un termino solo, por ej. buscar /norte/i
    // en lugar de regex para buscar lo que contiene norte, la i sirve
    // para que no diferencie entre minuscula y mayuscula
    // Hospital.find({ nombre: regex }, (err, hospitales) => {


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuesta => {

            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('error al cargar usuario', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;