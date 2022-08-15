// const socket = io.connect();

// // document.querySelector('button').addEventListener('click', () => {
// //     addProducto();
// // });
// // document.getElementById("envioMensaje").addEventListener('click', () => {
// //     addMessage();
// // });

// function addProducto() {

//     const producto = {
//         nombre: document.getElementById("nombre").value,
//         precio: document.getElementById("precio").value,
//         foto: document.getElementById("foto").value,
//     }
//     socket.emit("new-product", producto);
//     document.getElementById("nombre").value = "";
//     document.getElementById("precio").value = "";
//     document.getElementById("foto").value = "";

//     return false
// }
// function addMessage() {
//     let date = new Date();
//         let day = date.getDate()
//         let month = date.getMonth() + 1
//         let year = date.getFullYear()
//         let hour = date.getHours()
//         let min = date.getMinutes()
//         let sec = date.getSeconds()
//     const message = {
//         author: document.getElementById("email").value,
//         message: document.getElementById("text").value,
//         fecha: `${day}/${month}/${year} ${hour}:${min}:${sec}`,
//     }
//     socket.emit("new-message", message);

//     document.getElementById("text").value = ""
//     document.getElementById("text").focus()

//     return false
// }
// function renderProductos(data) {
//     let html_titulo=`<h2 style="color:blue;">Productos</h2><br>`;
//     let html1="";
//     let html2="";
//     let html='<h3 class="alert alert-warning">No hay productos</h3>';
//     if(data.length > 0) {
//         html1=`
//     <div class="table-responsive">
//     <table class="table table-dark">
//         <tr style="color: yellow;"> <th>Nombre</th> <th>Precio</th> <th style="text-align:center">Foto</th> </tr>`;
//     html = data.map((elem, index) => {
//         return(`<tr>
//         <td>${elem.nombre}</td>
//         <td>${elem.precio}</td>
//         <td style="text-align:center"><img src="${elem.foto}" alt="" width="30%" height="30%" ></td>
//     </tr>`)
//     }).join(" ")
//     html2=`</table>
//     </div>`;
//     }
    
//     document.getElementById("products").innerHTML = html_titulo+html1+html+html2;
// }
// function renderMensajes(data) {
//     let html='<h3 class="alert alert-warning">No hay Mensajes</h3>';
//     if(data.length > 0) {
//         html = data.map((elem, index) => {
            
//             return(`<div>
//             <strong class="text-primary">${elem.author}</strong>  <span style="color:#6F4E37">[${elem.fecha}] :</span>
//             <em class="text-success font-italic">${elem.message}</em>
//             </div>`)
//         }).join(" ")
//     }
//     document.getElementById("messages").innerHTML = html;
// }
// socket.on("products", function(data) {renderProductos(data)})
// socket.on("messages", function(data) {renderMensajes(data)})