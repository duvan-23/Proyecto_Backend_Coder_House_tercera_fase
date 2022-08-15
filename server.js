const express =require( 'express');
const  {Router}  =require( 'express');
// const {Router} = express;
const Contenedor =require( './ContenedorArchivo.js');
const ContenedorFirebase =require( './ContenedorFirebase.js');
const ContenedorMongoDb =require( './ContenedorMongoDb.js');
const mongoose =require( "mongoose");
const  models =require( "./models/productos.js");
const routerProductos= new Router();
const routercarrito= new Router();
const fetch =require('node-fetch');
const upload = require('./conf_storage/storage');
const messages = [];
const productos = [];
const administrador =true;
const palabras = ['Frase', 'inicial'];

let contenedorProductos = new Contenedor("productos.txt");
let contenedorProductosCarro = new Contenedor("carrito.txt");
let contenedorFire = new ContenedorFirebase("carrito");
let contenedorMongo = new ContenedorMongoDb("carrito");
//passport
const passport = require( "passport");
const { Strategy: LocalStrategy } = require('passport-local');
//session
const session = require( 'express-session')
//encriptor
const bcrypt = require( 'bcrypt');

// PASSPORT REGISTER
passport.use('register', new  LocalStrategy({
    passReqToCallback: true
}, async (req, username, password, done) => {

    const { direccion,telefono,edad,name } = req.body

    // const usuario = usuarios.find(usuario => usuario.username == username);
    const usuario = await contenedorMongo.getByNombre(username);
    if (usuario!="Email especificado no existe en el archivo") {
        return done('user already registered'+username)
    }
    const rounds = 10;
    bcrypt.hash(password, rounds, async(err, hash) => {
        if (err) {
        console.error(err)
        return
        }
        const contador=0;
        password=hash;
        const user = {
        username,
        name,
        password,
        direccion,
        telefono,
        foto:req.file.path,
        edad,
        contador
        }
        await contenedorMongo.insertarUsuarios(user);

        return done(null, user)
    })   
}))

// PASSPORT LOGIN
passport.use('login', new  LocalStrategy(async(username, password, done) => {
    // const user = usuarios.find(usuario => usuario.username == username)
    const user =await  contenedorMongo.getByNombre(username);
    if (user=="Email especificado no existe en el archivo") {
    return done(null, false)
    }
    let respuesta;
    bcrypt.compare(password, user.password, (err, res) => {
        if (err) {
        console.error(err)
        return
        }
        respuesta=res; //true or false
        if (!respuesta) {
            return done(null, false)
        }
        user.contador = 0
        return done(null, user)
    })
    
}))

 // SERIALIZAR Y DESERIALIZAR

 passport.serializeUser(function(user, done) {
    done(null, user.username)
})

passport.deserializeUser(async function(username, done) {
    // const usuario = usuarios.find(usuario => usuario.username == username);
    const usuario =await  contenedorMongo.getByNombre(username);
    done(null, usuario)
})


const app = express()

app.use(
    session({
        secret: 'shhhhhhhhhhhhhh',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000,
        },
        rolling: true,
    })
)
function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
    next()
    } else {
    res.redirect('/login')
    }
}
// MIDDLEWARES DE PASSPORT
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))
app.set('views', './public')

app.set('view engine', 'pug')
//-------
app.post('/register',upload.single('file'), passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/api/productos/'}));
app.get('/register', (req, res) => {
    const { url, method } = req;
    // logger.info(`Ruta ${url}, Metodo ${method}`);
    res.render('./views/register');
})
app.get('/failregister', (req, res) => {
    // const { url, method } = req;
    // logger.info(`Ruta ${url}, Metodo ${method}`);
    res.render('./views/register-error')
})
app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/api/productos/'}));
app.get('/faillogin', (req, res) => {
    const { url, method } = req;
    // logger.info(`Ruta ${url}, Metodo ${method}`);
res.render('./views/login-error')
})

app.post('/', (req, res) => {
    const { url, method } = req;
    // logger.info(`Ruta ${url}, Metodo ${method}`);
    let datos = req.body.nombre;
    if (req.user.contador) {
        req.user.contador++
        res.redirect('/api/productos/');
    } else if(req.body.nombre){
        req.user.contador = 1;
        req.user.username = datos;
        res.redirect('/api/productos/');
    }else{
        res.redirect('/login');
    }
    
})
app.post('/img',upload.single('file'), (req, res) => {
    const { name , edad, username, direccion, telefono, password } = req.body;
    let info={
        name,
        edad,
        username,
        direccion,
        telefono,
        password,
        foto:req.file.path
    }
    fetch('http://localhost:8080/register', {
        method: 'POST',
        body: JSON.stringify(info),
        headers: { 'Content-Type': 'application/json' }
    })
    // logger.info(`Ruta ${url}, Metodo ${method}`);
    // let originalFileName = req.file.path;
    // res.redirect('/api/productos/');
    // res.redirect(302, '/register');
})
let count2=0;
app.get('/login', async(req, res) => {
    const { url, method } = req;
    // logger.info(`Ruta ${url}, Metodo ${method}`);
    // res.sendFile('index.pug', {root: __dirname})
    if(count2==0){
        await contenedorMongo.conectar();
    }
    count2=count2+1;
    if (req.isAuthenticated()) {
        res.redirect('/api/productos/');
    }else{
        res.render('./views/login')
    }
})
app.get('/logout', (req, res) => {
    const { url, method } = req;
    // logger.info(`Ruta ${url}, Metodo ${method}`);
    req.logout(err => {
        res.redirect('/login')
        // res.render('./views/adios',{nombre:nombre})
    })
})
app.get('/perfil', isAuth, async(req, res) => {
    const usuario =await  contenedorMongo.getByNombre(req.user.username);
    return res.render('./views/info',{datos: usuario,nombre:usuario.name});
})
//-------------productos-------------


routerProductos.get('/:id?', isAuth, async(req, res) => {
    
    if (!req.user.contador) {
        req.user.contador = 0
    }
    let contador =req.user.contador+1;
    await contenedorMongo.putUsuarios(req.user.username,contador);
    const { id } = req.params
    let producto=[], productos1;
    const usuario =await  contenedorMongo.getByNombre(req.user.username);
    let foto=__dirname+"/"+usuario.foto;
    if(id){
        productos1=await contenedorMongo.getById(parseInt(id));
        // productos1=await contenedorProductos.getById(parseInt(id));
        if(productos1!='Id especificado no existe en el archivo'){
            producto.push(productos1[0]);
            producto[0].admin=administrador;
        }
        return res.render('./views/productos',{productos: producto, nombre:usuario.name,foto:foto});
    }
    productos1=await contenedorMongo.getAll();
    // productos1=await contenedorProductos.getAll();
    if(productos1!=""){
        productos1[0].admin=administrador;
    }
    console.log(usuario.name);
    console.log(foto);
    return res.render( './views/productos', {productos:productos1, nombre:usuario.name,foto:foto});
})

routerProductos.post('/', async(req, res) => {
    if(administrador){
        await contenedorMongo.save(req.body);
        let productos1=await contenedorMongo.getAll();
        // await contenedorProductos.save(req.body);
        // let productos1=await contenedorProductos.getAll();
        return res.render( './views/productos', {productos:productos1});
    }else{
        res.send({error:-1,descripcion: "ruta /api/productos/ metodo POST no autorizado"});
    }
})
routerProductos.delete('/:id',async(req, res) => {
    if(administrador){
        const {id} = req.params;
        await contenedorMongo.deleteById(Number(id))
        // await contenedorProductos.deleteById(Number(id))
        res.render( './views/productos', {productos:await contenedorProductos.getAll()});
    }else{
        res.send({error:-1,descripcion: "ruta /api/productos/:id metodo DELETE no autorizado"});
    }
})

routerProductos.put('/:id', async (req, res) => {
    if(administrador){
        const { id } = req.params
        let datos = req.body;
        datos.id=Number(id);
        res.send(await contenedorMongo.putId(id,datos));
        // res.send(await contenedorProductos.putId(id,datos));
    }else{
        res.send({error:-1,descripcion: "ruta /api/productos/:id metodo PUT no autorizado"});
    }
})
let count=0;
//-------------carrito-------------
routercarrito.get('/', isAuth, async(req, res) => {//1
    // let carritos=await contenedorProductosCarro.getAll();
    let carritos=await contenedorMongo.getAllCarrito(req.user.username);
    const usuario =await  contenedorMongo.getByNombre(req.user.username);
    return res.render( './views/productos_carro', {carritos:carritos,nombre:usuario.name});
})

routercarrito.get('/:id/productos', isAuth, async (req, res) => {//1
    const { id } = req.params;
    let productos;
    let datoCarrito = req.query.id_carro;
    // productos=await contenedorProductosCarro.getById(parseInt(id));
    // let carritos=await contenedorProductosCarro.getAll();
    productos=await contenedorMongo.getByIdCarrito(parseInt(id));
    let carritos=await contenedorMongo.getAllCarrito(req.user.username);
    const usuario =await  contenedorMongo.getByNombre(req.user.username);
    return res.render( './views/productos_carro', {carritos:carritos,productos:productos[0].productos,idcarrito:datoCarrito,nombre:usuario.name});
})

routercarrito.post('/', async(req, res) => {//1
    let producto, productos1;
    // return res.render('./views/productos',{productos: producto});
    producto=[];

    let data ={
        user:req.user.username,
        timestamp: Date.now(),
        productos:producto
    }
    // await contenedorProductosCarro.save(data);
    // let carritos=await contenedorProductosCarro.getAll();
    await contenedorMongo.saveCarrito(data);
    let carritos=await contenedorMongo.getAllCarrito(req.user.username);
    const usuario =await  contenedorMongo.getByNombre(req.user.username);
    return res.render('./views/productos_carro',{carritos: carritos,nombre:usuario.name});
})
routercarrito.post('/:id/productos', async(req, res) => {
    let producto, productos1,producto2;
    const { id } = req.params;
    let datos = req.body;
    let datoCarrito = req.query.id_carro;
    // return res.render('./views/productos',{productos: producto});
    producto=await contenedorMongo.getById(parseInt(id));
    producto=producto[0];
    // producto=await contenedorProductos.getById(parseInt(id));
    if(producto!='Id especificado no existe en el archivo'){
        // producto.id_producto=producto.id;
        // delete producto.id;
        producto2={
            nombre: producto.nombre,
            descripcion:producto.descripcion,
            codigo:producto.codigo,
            precio:producto.precio,
            stock:producto.stock,
            foto:producto.foto,
            timestamp:producto.timestamp,
            id_producto:producto.id
        }
        await contenedorMongo.saveCarritoP(producto2, parseInt(datos.id));
        // await contenedorProductosCarro.saveCarrito(producto, datos.id);
        let carritos=await contenedorMongo.getAllCarrito(req.user.username);
        // carritos=await contenedorProductosCarro.getAll();
        productos1=await contenedorMongo.getByIdCarrito(parseInt(datos.id));
        // productos1=await contenedorProductosCarro.getById(parseInt(datos.id));
        const usuario =await  contenedorMongo.getByNombre(req.user.username);
        return res.render('./views/productos_carro',{carritos: carritos,productos:productos1,idcarrito:datoCarrito,nombre:usuario.name});
    }
})

routercarrito.delete('/:id',async(req, res) => {//1

    const {id} = req.params;
    await contenedorMongo.deleteByIdCarrito(Number(id));
    // await contenedorProductosCarro.deleteById(Number(id))
    res.render( './views/productos', {productos:await contenedorProductosCarro.getAll()});
})

routercarrito.delete('/:id/productos/:id_prod',async(req, res) => {

    const {id} = req.params;
    const {id_prod} = req.params;
    await contenedorMongo.deleteByIdCarritoP(Number(id), Number(id_prod))
    // await contenedorProductosCarro.deleteByIdCarrito(Number(id), Number(id_prod))
    res.render( './views/productos', {productos:await contenedorProductosCarro.getAll()});
})


routercarrito.put('/:id/productos/:id_prod', async (req, res) => {
    let producto,producto2;
    const { id, id_prod } = req.params;

    let datos = req.body;
    producto=await contenedorMongo.getById(parseInt(datos.idProducto));
    // producto=await contenedorProductos.getById(parseInt(datos.idProducto));
    producto=producto[0];
    if(producto!='Id especificado no existe en el archivo'){
        producto2={
            nombre: producto.nombre,
            descripcion:producto.descripcion,
            codigo:producto.codigo,
            precio:producto.precio,
            stock:producto.stock,
            foto:producto.foto,
            timestamp:producto.timestamp,
            id_producto:producto.id,
            id:Number(id_prod)
        }
        // producto.id_producto=producto.id;
        // delete producto.id;
        // producto.id=Number(id);
        res.send(await contenedorMongo.putIdCarritoP(id,producto2,id_prod));
        // res.send(await contenedorProductosCarro.putIdCarrito(id,producto2,id_prod));
    }
})

app.use('/api/productos',routerProductos)
app.use('/api/carrito',routercarrito)
app.use((req, res, next) => {
    
    res.status(404).send({error:-2,descripcion: "ruta "+req.url+ " metodo "+req.method+" no implementada"})
  })
const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log('Servidor HTTP escuchando en el puerto ' + PORT)
})
server.on('error', error => console.log(`Error en servidor ${error}`))