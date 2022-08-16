const mongoose=require( "mongoose");
const {productos} =require("./models/productos.js");
const {carrito} =require("./models/carrito.js");
const { usuarios}=require( "./models/usuarios.js");
const logger = require( './logger.js');
const models= productos;
const models2= carrito;
const models3= usuarios;
let ContenedorMongoDb =class{
    constructor(nombre){
        this.nombre = nombre;
    }

    async conectar(){
        let conexion = await mongoose.connect(this.nombre);

        return logger.info("Conexión a MongoDB correcta");
    }

    async getById(id){
        let nombre =this.nombre;
        return await leerId(id, nombre);
    }

    async getAll(){
        let nombre =this.nombre;
        return await leerAll(nombre);
    }

    async save(data){
        let nombre =this.nombre;
        return await leerTodo(nombre,data);
    }

    async deleteById(id){
        let nombre =this.nombre;
        return await eliminarId(id,nombre);
    }

    async putId(id,datos){
        let nombre =this.nombre;
        return await actualizar(id,nombre,datos);
    }
    //carrito
    async saveCarrito(data){
        let nombre =this.nombre;
        return await leerTodoCarrito(data,nombre);     
    }

    async deleteByIdCarrito(id){
        let nombre =this.nombre;
        return await eliminarIdCarrito(id,nombre);
    }

    async getAllCarrito(user){
        let nombre =this.nombre;
        return await leerAllCarrito(nombre,user);
    }

    async getByIdCarrito(id){
        let nombre =this.nombre;
        return await leerIdCarrito(id, nombre);
    }
    async saveCarritoP(data, id){
        let nombre =this.nombre;
        return await leerCarritoP(id,nombre,data);
    }

    async deleteByIdCarritoP(id, id_prod){
        let nombre =this.nombre;
        return await eliminarIdCarritoP(id,nombre,id_prod);
    }

    async putIdCarritoP(id,datos,id_prod){
        let nombre =this.nombre;
        return await actualizarCarritoP(id,nombre,datos,id_prod);
    }
    //usuarios
    async putUsuarios(name,datos){
        let nombre =this.nombre;
        return await actualizarUsuarios(name,nombre,datos);
    }
    async insertarUsuarios(data){
        let nombre =this.nombre;
        return await guardarUsuarios(nombre,data);
        // return await leerTodo(nombre,data);
    }
    async getByNombre(name){
        let nombre =this.nombre;
        return await leerNombre(name, nombre);
    }
}
//usuarios
async function actualizarUsuarios(name,nombre,datos){
    let resultado2,r3;
    try{
        const contenido =await models3.updateOne({username:name},{$set: {contador:datos}});
        resultado2 =contenido;
    }
    catch(err){
        resultado2= err;
    }
    return resultado2;
}
async function guardarUsuarios(ruta,data){
    let resultado;
    try{
        // await fs.promises.writeFile(ruta, JSON.stringify(resultados[1],null, 2))
        await models3.create([data]);
        resultado=console.log("Guardo Exitosamente");
    }
    catch(err){
        resultado=console.log(err);
    }
    // return console.log(err);
    return resultado;
} 
async function leerNombre(name,nombre){
    let resultado,r2;
    try{
        const contenido =await models3.find({username: name}, {_id: 0, __v: 0});
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        resultado =contenido;
        if(resultado.length==0){
            resultado[0]="Email especificado no existe en el archivo"
        }
    }
    catch(err){
        resultado= err;
    }
    return resultado[0];
}
//---------------
async function actualizarCarritoP(id,nombre,datos,id_prod){
    let resultado=[],r2,id_doc;

    try{
        const contenido =await models2.find({id:id});
        
        contenido.forEach(doc =>
            resultado.push(doc)
        );
        contenido.forEach(doc =>
            id_doc=doc.id
        );

        resultado[0].productos.forEach((object,index) =>{
            if(object.id == id_prod){
                r2=index;
            }
        });

        resultado[0].productos.splice(r2,1,datos);
    }
    catch(err){
        resultado= err;
    }
    // return console.log(resultado[0].productos);
    return actualizarCarrito2(resultado[0].productos,nombre,id_doc);
}
async function actualizarCarrito2(resultado,nombre,id_doc){
    
    try{
        const contenido =await models2.updateOne({id:id_doc},{productos: resultado});
        resultado =contenido;
        console.log(resultado);
    }
    catch(err){
        console.log(err);
    }
}

async function eliminarIdCarritoP(id,nombre,id_prod){
    let resultado=[],r2,id_doc;
    try{
        const contenido =await models2.find({id: id});
        contenido.forEach(doc =>
            resultado.push(doc)
        );
        contenido.forEach(doc =>
            id_doc=doc.id
        );

        resultado[0].productos.forEach((object,index) =>{
            if(object.id === id_prod){
                r2=index;
            }
        });

        resultado[0].productos.splice(r2,1);
    }
    catch(err){
        resultado= err;
    }
    // return console.log(resultado[0].productos);
    return guardarC(resultado[0].productos,nombre,id_doc);
}

async function guardarC(resultado,nombre,id_doc){
    
    try{
        // const db = admin.firestore();
        // const query = db.collection(nombre);
        // resultado = await query.doc(id_doc).update({productos: resultado});
        const contenido =await models2.updateOne({id:id_doc},{productos: resultado});
        resultado =contenido;
        console.log(resultado);

        
    }
    catch(err){
        console.log(err);
    }
}
async function leerCarritoP(id,nombre,data){
    let resultado=[],r2,id_doc;
    try{
        const contenido =await models2.find({id: parseInt(id)});
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        contenido.forEach(doc =>
            resultado.push(doc)
        );
        if(resultado.length==0){
            return "Id especificado no existe en el archivo";
        }
        console.log(resultado[0]);
        contenido.forEach(doc =>
            id_doc=doc.id
        );
        r2=resultado;
        resultado=resultado[0].productos[resultado[0].productos.length-1].id+1;
    }
    catch(err){
        resultado= 1;
    }
    return guardarCarritoP([resultado,r2],data,nombre,id,id_doc);
}

async function guardarCarritoP(resultados,data,nombre,id,id_doc){
    let datos =data,resultado,resultado2;
    datos.id= resultados[0];
    resultados[1].forEach((object,index) =>{
        if(object.id === Number(id)){
            resultados[1][index].productos.push(datos);
        }
    });
    try{
        // const db = admin.firestore();
        // const query = db.collection(nombre);
        // resultado = await query.doc(id_doc).update({productos: resultados[1][0].productos});
        const contenido =await models2.updateOne({id:id},{$set: {productos: resultados[1][0].productos}});
        resultado2 =contenido;
    }
    catch(err){
        resultado2= err;
    }
    return console.log(resultado2);
}  
async function leerTodoCarrito(data,nombre){
    let resultado= [],r2;
    try{
        const contenido =await models2.find({});
        resultado =contenido;
        r2=resultado;
        resultado=resultado[resultado.length-1].id+1;
    }
    catch(err){
        r2= [];
        resultado= 1;
    }
    return guardarCarrito([resultado,r2],data,nombre);
    
}

async function guardarCarrito(resultados,data,nombre){
    let id;
    let datos =data;
    datos.id= resultados[0];
    try{
        await models2.create([datos]);
    }
    catch(err){
        console.log(err);
    }
    return console.log(resultados[0]);
}  

async function eliminarIdCarrito(id,nombre){
    let resultado,r2;
    try{
        const contenido =await models2.deleteMany({id: id});
        resultado =contenido;
    }
    catch(err){
        resultado= err;
    }
    return console.log(resultado);
}
async function leerAllCarrito(nombre,user){
    let resultado,r2;
    try{
        
        const contenido =await models2.find({user:user});
        // const contenido =await fs.promises.readFile(nombre, 'utf8');
        resultado =contenido;
    }
    catch(err){
        resultado= err;
    }
    return resultado;
    // return console.log(resultado);
}
async function leerIdCarrito(id,nombre){
    let resultado,r2;
    try{
        const contenido =await models2.find({id: id}, {_id: 0, __v: 0});
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        resultado =contenido;
        if(resultado.length==0){
            resultado="Id especificado no existe en el archivo"
        }
    }
    catch(err){
        resultado= err;
    }
    return resultado;
}


//productos
async function actualizar(id,nombre,datos){
    let resultado2,r3;
    try{
        const contenido =await models.updateOne({id:id},{$set: datos});
        resultado2 =contenido;
    }
    catch(err){
        resultado2= err;
    }
    return console.log(resultado2);
}

async function eliminarId(id,nombre){
    let resultado,r2;
    try{
        const contenido =await models.deleteMany({id: id});
        resultado =contenido;
    }
    catch(err){
        resultado= err;
    }
    return console.log(resultado);
}

async function leerTodo(ruta,data){
    let resultado,r2;
    try{
        const contenido =await models.find({});
        resultado =contenido;
        r2=resultado;
        resultado=resultado[resultado.length-1].id+1;
    }
    catch(err){
        r2= [];
        resultado= 1;
    }
    return guardar([resultado,r2],data,ruta);
}

async function guardar(resultados,data,ruta){
    let id;
    let datos =data;
    datos.id= resultados[0];
    resultados[1].push(datos);
    try{
        // await fs.promises.writeFile(ruta, JSON.stringify(resultados[1],null, 2))
        await models.create([datos]);
    }
    catch(err){
        console.log(err);
    }
    return ""+resultados[0];
}  


async function leerAll(nombre){
    let resultado,r2;
    try{
        
        const contenido =await models.find({});
        // const contenido =await fs.promises.readFile(nombre, 'utf8');
        resultado =contenido;
    }
    catch(err){
        resultado= err;
    }
    return resultado;
    // return console.log(resultado);
}

async function leerId(id,nombre){
    let resultado,r2;
    try{
        const contenido =await models.find({id: id}, {_id: 0, __v: 0});
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        resultado =contenido;
        if(resultado.length==0){
            resultado="Id especificado no existe en el archivo"
        }
    }
    catch(err){
        resultado= err;
    }
    return resultado;
}

module.exports= ContenedorMongoDb;