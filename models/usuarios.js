const mongoose =require( 'mongoose');

const usuariosCollection = 'usuarios';

const UsuariosSchema= new mongoose.Schema({
    username: {type: String, required: true},
    name: {type: String, required: true},
    password: {type: String, required: true},
    direccion: {type: String, required: true},
    telefono: {type: String, required: true},
    foto: {type: String, required: true},
    edad: {type: Number, required: true},
    contador: {type: Number, required: true}
});

const usuarios = mongoose.model(usuariosCollection, UsuariosSchema);
module.exports ={usuarios};