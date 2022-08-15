const mongoose =require('mongoose');

const carritoCollection = 'carritos';

const carritoSchema= new mongoose.Schema({
    id: {type: Number, required: true},
    user: {type: String, required: true},
    productos: [{
        nombre: {type: String, required: true},
        descripcion: {type: String, required: true},
        codigo: {type: String, required: true},
        precio: {type: String, required: true},
        stock: {type: Number, required: true},
        foto: {type: String, required: true},
        timestamp: {type: Number, required: true},
        id: {type: Number, required: true},
        id_producto: {type: Number, required: true}
    }],
    timestamp: {type: Number, required: true}
});

const carrito = mongoose.model(carritoCollection, carritoSchema);

module.exports={carrito};