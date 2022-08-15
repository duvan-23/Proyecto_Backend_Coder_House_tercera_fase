const admin = require('firebase-admin');
const fs = require('fs');


let ContenedorFirebase= class{
    constructor(nombre){
        this.nombre = nombre;
    }
    async conectar(){
        let serviceAccount = JSON.parse(fs.readFileSync('./db/ecommerce-cdb38-firebase-adminsdk-81ffw-8ae1c98706.json'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        return  console.log("Conectado a firebase correctamente");
    }
    async save(data){
        let nombre =this.nombre;
        return await leerTodo(data,nombre);     
    }

    async deleteById(id){
        let nombre =this.nombre;
        return await eliminarId(id,nombre);
    }

    async getAll(){
        let nombre =this.nombre;
        return await leerAll(nombre);
    }

    async getById(id){
        let nombre =this.nombre;
        return await leerId(id, nombre);
    }

    async saveCarrito(data, id){
        let nombre =this.nombre;
        return await leerCarrito(nombre,data,id);
    }
    
    async deleteByIdCarrito(id, id_prod){
        let nombre =this.nombre;
        return await eliminarIdCarrito(id,nombre,id_prod);
    }

    async putIdCarrito(id,datos,id_prod){
        let nombre =this.nombre;
        return await actualizarCarrito(id,nombre,datos,id_prod);
    }
}

async function actualizarCarrito(id,nombre,datos,id_prod){
    let resultado=[],r2,id_doc;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==", Number(id)).get();
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        contenido.forEach(doc =>
            id_doc=doc.id
        );

        resultado[0].productos.forEach((object,index) =>{
            if(object.id === Number(id_prod)){
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
        const db = admin.firestore();
        const query = db.collection(nombre);
        resultado = await query.doc(id_doc).update({productos: resultado});
        console.log(resultado);
    }
    catch(err){
        console.log(err);
    }
}

async function eliminarIdCarrito(id,nombre,id_prod){
    let resultado=[],r2,id_doc;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==", Number(id)).get();
        contenido.forEach(doc =>
            resultado.push(doc.data())
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
        const db = admin.firestore();
        const query = db.collection(nombre);
        resultado = await query.doc(id_doc).update({productos: resultado});
        console.log(resultado);
    }
    catch(err){
        console.log(err);
    }
}

async function leerCarrito(nombre,data,id){
    let resultado=[],r2,id_doc;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==", Number(id)).get();
        
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        if(resultado.length>1){
            return "Id especificado no existe en el archivo"
        }
        console.log(resultado[0]);
        contenido.forEach(doc =>
            id_doc=doc.id
        );
        r2=resultado;
        
        resultado=resultado[0].productos[resultado[0].productos.length-1].id+1;
    }
    catch(err){
        // r2= [];
        resultado= 1;
    }
    return guardarCarrito([resultado,r2],data,nombre,id,id_doc);
}

async function guardarCarrito(resultados,data,nombre,id,id_doc){
    let datos =data,resultado;
    datos.id= resultados[0];
    resultados[1].forEach((object,index) =>{
        if(object.id === Number(id)){
            resultados[1][index].productos.push(datos);
        }
    });
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        resultado = await query.doc(id_doc).update({productos: resultados[1][0].productos});
    }
    catch(err){
        resultado=err;
    }
    return console.log(resultado);
}  

async function leerId(id,nombre){
    let resultado=[],r2;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==",id).get();
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        
        if(resultado.length>1){
            resultado[0]="Id especificado no existe en el archivo"
        }
    }
    catch(err){
        resultado= err;
    }
    return resultado[0];
}


async function leerAll(nombre){
    let resultado=[],r2;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.orderBy("id", "asc").get();
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        
    }
    catch(err){
        resultado= err;
    }
    return resultado;
}

async function eliminarId(id,nombre){
    let resultado=[],r2,item,doc_elim;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==",id).get();
        item=contenido;
        contenido.forEach(doc =>
            resultado.push(doc.id)
        );
         item = await query.doc(resultado[0]).delete();
        // doc_elim.forEach(doc =>
        //     r2.push(doc.data())
        // );
    }
    catch(err){
        resultado= err;
        r2="";
    }
    return console.log(item);
    // return console.log(await doc_elim);
}

async function leerTodo(data,nombre){
    let resultado= [],r2;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.orderBy("id", "desc").limit(1).get();
        
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        r2=resultado;
        resultado=resultado[resultado.length-1].id+1;
    }
    catch(err){
        r2= [];
        resultado= 1;
    }
    return guardar([resultado,r2],data,nombre);
    
}

async function guardar(resultados,data,nombre){
    let id;
    let datos =data;
    datos.id= resultados[0];
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        await query.add(datos);
    }
    catch(err){
        console.log(err);
    }
    return console.log(resultados[0]);
}  

module.exports = ContenedorFirebase;