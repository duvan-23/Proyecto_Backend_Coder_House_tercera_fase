const mongoose =require('mongoose');

const productosCollection = 'productos';

const ProductosSchema= new mongoose.Schema({
    nombre: {type: String, required: true},
    descripcion: {type: String, required: true},
    codigo: {type: String, required: true},
    precio: {type: String, required: true},
    stock: {type: Number, required: true},
    foto: {type: String, required: true},
    timestamp: {type: Number, required: true},
    id: {type: Number, required: true}
});

const productos = mongoose.model(productosCollection, ProductosSchema);

module.exports={productos};