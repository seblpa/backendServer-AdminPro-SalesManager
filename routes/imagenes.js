// Requires
var express = require('express');

// Inicializar variables
var app = express();

// esta librería o paquete node nos ayuda a crear path.
// no hay q descargar nada ya que viene con node.
var path = require('path');
// ahora con el fs, vamos a comprobar si existe el path (existsSync())
var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    // params sirve para referirse a los parametros que recibimos en la url
    // aquí el :tipo es el medicos, usuarios, hospitales que están en la carpeta uploads
    // y el :img es el fichero de la imagen dentro de cada carpeta
    var tipo = req.params.tipo;
    var img = req.params.img;

    // queremos verificar si la imagen existe y si no existe, vamos a crear una imagen por defecto
    // con el resolve el path me ayuda a resolver este path para q siempre esté correcto
    // dentro del resolve, debemos especificar toda la ruta de la imagen
    // con el __dirname, tengo toda la ruta desde me encuentro en este momento, que la imagen
    // esté en un servidor o en local
    // aqui la imagen está en local, pero si estuviera desplegada en un servidor, pondríamos la url 
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;