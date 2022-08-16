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
const dotenv = require( 'dotenv/config')
const nodemailer = require('nodemailer');
const messages = [];
const productos = [];
const administrador =true;
const palabras = ['Frase', 'inicial'];

let contenedorProductos = new Contenedor("productos.txt");
let contenedorProductosCarro = new Contenedor("carrito.txt");
let contenedorFire = new ContenedorFirebase("carrito");
const url = process.env.URL;
let contenedorMongo = new ContenedorMongoDb(url);
const cluster = require( 'cluster');
const os = require( 'os');
const parseArgs = require('minimist');

//passport
const passport = require( "passport");
const { Strategy: LocalStrategy } = require('passport-local');
//session
const session = require( 'express-session')
//encriptor
const bcrypt = require( 'bcrypt');
//logger 
const logger = require( './logger.js');

//nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
      user: 'duvancaicedo20@gmail.com',
      pass: 'graygobzubvdnkvv',
    },
  })
//sms
const twilio =require('twilio');

const accountSid = 'ACde04753ddf170f1c46d322d0785c4bf3'
const authToken = '476f8e9a6da8cc2cdead981d6e93e13b'

const twilioClient = twilio(accountSid, authToken)
//cluster

//validar node en cmd
//comando: tasklist /fi "imagename eq node.exe"
const options_puerto ={
    alias:{
        p:'puerto',
        m:'modo'
    },
    default:{
        puerto:8080,
        modo:"FORK"
    }
}
const { modo }= parseArgs(process.argv.slice(2),options_puerto);
const numCpus= os.cpus().length;
const modoCluster = process.argv[3] == 'CLUSTER';
if(cluster.isPrimary && modo =="CLUSTER" || modoCluster && cluster.isPrimary){
    logger.info('Numero de procesadores: ' + numCpus);
    logger.info('PID:' + process.pid);
    for (let i = 0; i < numCpus; i++) {
        cluster.fork();   
    }
    cluster.on('exit', worker => {
        // console.log('Worker1 ' + process.pid + ' murio');
        cluster.fork();
    })
}else{
    const adm_correo="duvamendi2@hotmail.com";
    const adm_telefono="+573107873745";
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
                logger.error(err)
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
            
            //correo ingreso 
            let usuario_info='Registro de nuevo cliente<br>';

            usuario_info+=`<h2>Nombre: ${user.name}</h2> `;
            usuario_info+=`<h2>Edad: ${user.edad}</h2> `;
            usuario_info+=`<h2>Correo: ${user.username} </h2>`;
            usuario_info+=`<h2>Dirección: ${user.direccion} </h2>`;
            usuario_info+=`<h2>Teléfono: ${user.telefono} </h2>`;
            usuario_info+="------------------------<br>";
            
            const asunto =`Nuevo Registro de usuario`;
            const info = await transporter.sendMail({
                from: 'duvancaicedo20@gmail.com',
                to: [adm_correo],
                subject: asunto,
                html: usuario_info,
            })
            logger.info('Correo enviado', info)

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
                logger.error(err)
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
    let count2=0;
    //-------
    app.post('/register',upload.single('file'), passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/api/productos/'}));
    app.get('/register', async(req, res) => {
        if(count2==0){
            await contenedorMongo.conectar();
        }
        count2=count2+1;
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
        res.render('./views/register');
    })

    app.get('/', isAuth, (req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
        res.redirect('/api/productos/');
    })
    app.get('/failregister', (req, res) => {
        // const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
        res.render('./views/register-error')
    })
    app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/api/productos/'}));
    app.get('/faillogin', (req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
    res.render('./views/login-error')
    })

    app.post('/', (req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
    
    app.get('/login', async(req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        logger.info(`Ruta ${url}, Metodo ${method}`);
        req.logout(err => {
            res.redirect('/login')
            // res.render('./views/adios',{nombre:nombre})
        })
    })
    app.get('/perfil', isAuth, async(req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
        const usuario =await  contenedorMongo.getByNombre(req.user.username);
        return res.render('./views/info',{datos: usuario,nombre:usuario.name});
    })
    app.post('/comprar', async(req, res) => {
        const { url, method } = req;
        const {id} =req.body;
        let productos='Lista Productos <br>';
        logger.info(`Ruta ${url}, Metodo ${method}`);
        const carrito =await  contenedorMongo.getByIdCarrito(parseInt(id));
        let object= carrito[0].productos;
        object.forEach((element, index) => { 
            productos+=`<h1>  Producto  ${index+1} </h1><br>`;
            productos+=`<h2>Nombre: ${element.nombre}</h2> `;
            productos+=`<h2>Descripción: ${element.descripcion} </h2>`;
            productos+=`<h2>Codigo: ${element.codigo} </h2>`;
            productos+=`<h2>Precio: ${element.precio} </h2>`;
            productos+=`<h2>Foto: ${element.foto} </h2>`;
            productos+="------------------------<br>";

        })
        const usuario =await  contenedorMongo.getByNombre(req.user.username);
        const asunto =`Nuevo pedido de ${usuario.name}, correo: ${usuario.username}`;
        //envia correo
        const info = await transporter.sendMail({
            from: 'duvancaicedo20@gmail.com',
            to: [adm_correo],
            subject: asunto,
            html: productos,
          })
        logger.info('Correo enviado', info)
        //envia sms
        const from = '+14705249066';
        const to = usuario.telefono;
        const body = `Buen día, ${usuario.name}, su pedido ha sido recibido y se encuentra en proceso`;
        const info1 = await twilioClient.messages.create({body, from, to})
        logger.info('SMS enviado', info1)
        //envia whatsapp
        try{
            const message = await twilioClient.messages.create({
                body:asunto,
                to: `whatsapp:${adm_telefono}`,
                from: 'whatsapp:+14155238886'
            });
            logger.info('Whatsapp enviado',message)
        }catch(err){
            logger.error(err)
        }
        // return res.render('./views/info',{datos: usuario,nombre:usuario.name});
    })
    //-------------productos-------------


    routerProductos.get('/:id?', isAuth, async(req, res) => {
        const { url, method } = req;
        logger.info(`Ruta /api/productos, Metodo ${method}`);
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
        return res.render( './views/productos', {productos:productos1, nombre:usuario.name,foto:foto});
    })

    routerProductos.post('/', async(req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        const { url, method } = req;
        logger.info(`Ruta /api/carrito, Metodo ${method}`);
        // let carritos=await contenedorProductosCarro.getAll();
        let carritos=await contenedorMongo.getAllCarrito(req.user.username);
        const usuario =await  contenedorMongo.getByNombre(req.user.username);
        return res.render( './views/productos_carro', {carritos:carritos,nombre:usuario.name});
    })

    routercarrito.get('/:id/productos', isAuth, async (req, res) => {//1
        const { url, method } = req;
        logger.info(`Ruta /api/carrito/:id/productos, Metodo ${method}`);
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
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
        const {id} = req.params;
        await contenedorMongo.deleteByIdCarrito(Number(id));
        // await contenedorProductosCarro.deleteById(Number(id))
        res.render( './views/productos', {productos:await contenedorProductosCarro.getAll()});
    })

    routercarrito.delete('/:id/productos/:id_prod',async(req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
        const {id} = req.params;
        const {id_prod} = req.params;
        await contenedorMongo.deleteByIdCarritoP(Number(id), Number(id_prod))
        // await contenedorProductosCarro.deleteByIdCarrito(Number(id), Number(id_prod))
        res.render( './views/productos', {productos:await contenedorProductosCarro.getAll()});
    })


    routercarrito.put('/:id/productos/:id_prod', async (req, res) => {
        const { url, method } = req;
        logger.info(`Ruta ${url}, Metodo ${method}`);
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
        const { url, method } = req
        logger.warn(`Ruta ${method} ${url} no implementada`)
        res.status(404).send({error:-2,descripcion: "ruta "+req.url+ " metodo "+req.method+" no implementada"})
    })
    process.on('uncaughtException', function (err) {
        logger.error(err);
    });
    const PORT = process.env.PORT || parseInt(process.argv[2]) || 8080

    const server = app.listen(PORT, () => {
        logger.info('Servidor HTTP escuchando en el puerto ' + PORT)
    })
    server.on('error', error => logger.error(`Error en servidor ${error}`))

}