
const form = document.getElementById('form_productos');
form.addEventListener('submit', e => {
    e.preventDefault();
    let n=document.getElementById('nombre').value;
    let d=document.getElementById('descripcion').value;
    let c=document.getElementById('codigo').value;
    let p=document.getElementById('precio').value;
    let f=document.getElementById('foto').value;
    let s=document.getElementById('stock').value;
    const data ={
        nombre: n,
        descripcion: d,
        codigo: c,
        precio: p,
        stock: s,
        foto: f,
        timestamp: Date.now()
    };
    fetch('/api/productos', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
    let myBool = (document.getElementById('admin').value === 'false');
    if(myBool){
        alert("¡No tiene permisos de Administrador para Agregar productos!");
    }
    setTimeout(() => {
        window.location.reload()
    }, 1000);
})

const botonesEliminar=document.querySelectorAll(".botones-eliminar");
botonesEliminar.forEach((boton, indice) => {
	boton.addEventListener('click',()=>{
        let id=document.getElementById(`valor${indice+1}`).value;
        fetch(`/api/productos/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
        })
        let myBool = (document.getElementById('admin').value === 'false');
        if(myBool){
            alert("¡No tiene permisos de Administrador para Eliminar productos!");
        }
        window.location.reload();
    });
});

const botonesEditar=document.querySelectorAll(".botones-editar");
botonesEditar.forEach((boton, indice) => {
	boton.addEventListener('click',()=>{
        let id=document.getElementById(`valor${indice+1}`).value;
        let nombre=document.getElementById(`valor2${indice+1}`).value;
        let precio=document.getElementById(`valor3${indice+1}`).value;
        let foto=document.getElementById(`valor4${indice+1}`).value;
        let descripcion=document.getElementById(`valor5${indice+1}`).value;
        let codigo=document.getElementById(`valor6${indice+1}`).value;
        let stock=document.getElementById(`valor7${indice+1}`).value;

        Swal.fire({
            title: 'Editar Producto',
            html: `<div class="form-group"><label for="campo1">Nombre:</label><input type="text" id="campo1" class="swal2-input" placeholder="Nombre" value="${nombre}" required></div>
            <div class="form-group"><label for="campo2">Descripción:</label><input type="text" id="campo2" class="swal2-input" placeholder="Descripcion" value="${descripcion}"required></div>
            <div class="form-group"><label for="campo3">Codigo:</label><input type="text" id="campo3" class="swal2-input" placeholder="Codigo" value="${codigo}"required></div>
            <div class="form-group"><label for="campo4">Stock:</label><input type="number" id="campo4" class="swal2-input" placeholder="Stock" value="${stock}"required></div>
            <div class="form-group"><label for="campo5">Precio:</label><input type="number" id="campo5" class="swal2-input" placeholder="Precio" value="${precio}"required></div>
            <div class="form-group"><label for="campo6">Url:</label><input type="url" id="campo6" class="swal2-input" placeholder="Url" value="${foto}"required></div>`,
            confirmButtonText: 'Actualizar',
            showCancelButton: true,
            focusConfirm: false,
          }).then((result) => {
            if(result.isConfirmed){
                const data ={
                    nombre:Swal.getPopup().querySelector('#campo1').value,
                    descripcion: Swal.getPopup().querySelector('#campo2').value,
                    codigo: Swal.getPopup().querySelector('#campo3').value,
                    precio: Swal.getPopup().querySelector('#campo5').value,
                    stock: Swal.getPopup().querySelector('#campo4').value,
                    foto: Swal.getPopup().querySelector('#campo6').value,
                    timestamp: Date.now()
                }
                fetch(`/api/productos/${id}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'PUT',
                    body: JSON.stringify(data)
                })
                let myBool = (document.getElementById('admin').value === 'false');
                if(myBool){
                    alert("¡No tiene permisos de Administrador para Editar productos!");
                }
                setTimeout(() => {
                    window.location.reload()
                }, 600);
            }
          })
        
    });
});

