const crea_carrito = document.getElementById('addCarrito');
crea_carrito.addEventListener('click', e => {
    fetch('/api/carrito', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        // body: JSON.stringify(data)
    })
    setTimeout(() => {
        window.location.reload()
    }, 1000);
})
const verProductosCarrito=document.querySelectorAll(".botones-verc");
verProductosCarrito.forEach((boton, indice) => {
	boton.addEventListener('click',()=>{
        document.getElementById(`verc${indice+1}`).submit();  
    });
});
const agregar = document.getElementById('agregar');
if(agregar){
    agregar.addEventListener('click', e => {
        e.preventDefault();
        let idp=document.getElementById('id').value;
        let id=document.getElementById('carritoAdd').value;
        const data ={
            id: id
        };
        fetch(`/api/carrito/${idp}/productos`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        setTimeout(() => {
            window.location.reload()
        }, 1000);
    })
}



const botonesEliminarcarrito=document.querySelectorAll(".botones-eliminarcarrito");
botonesEliminarcarrito.forEach((boton, indice) => {
	boton.addEventListener('click',()=>{
        let id=document.getElementById(`carritoAdd${indice+1}`).value;
        fetch(`/api/carrito/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
        })

        setTimeout(() => {
            window.location.href="/api/carrito";
        }, 1000);
    });
});
const botonesEliminarc=document.querySelectorAll(".botones-eliminarc");
botonesEliminarc.forEach((boton, indice) => {
	boton.addEventListener('click',()=>{
        let id=document.getElementById(`carritoAdd`).value;
        let id_prod=document.getElementById(`valor${indice+1}`).value;
        fetch(`/api/carrito/${id}/productos/${id_prod}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
        })
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
});


const botonesEditarc=document.querySelectorAll(".botones-editarc");
botonesEditarc.forEach((boton, indice) => {
	boton.addEventListener('click',()=>{
        let id=document.getElementById(`carritoAdd`).value;
        let id_prod=document.getElementById(`valor8${indice+1}`).value;
        let id_prod_m=document.getElementById(`valorp${indice+1}`).value;

        Swal.fire({
            title: 'Editar Producto',
            html: `<div class="form-group"><label for="campo1">ID Producto:</label><input type="text" id="campo1" class="swal2-input" placeholder="Nombre" value="${id_prod_m}"></div>`,
            confirmButtonText: 'Actualizar',
            showCancelButton: true,
            focusConfirm: false,
          }).then((result) => {
              if(result.isConfirmed){
                const data ={
                    idProducto:Swal.getPopup().querySelector('#campo1').value
                }
                fetch(`/api/carrito/${id}/productos/${id_prod}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'PUT',
                    body: JSON.stringify(data)
                })
                setTimeout(() => {
                    window.location.reload()
                }, 600);
              }
            
          })
        
    });
});