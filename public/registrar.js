const crea_carrito = document.getElementById('registrar');
crea_carrito.addEventListener('click', e => {
    let id=document.getElementById(`file`).value;
    const data ={
        file: id
    };
    fetch('/img', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then((data) => alert(data));
    // setTimeout(() => {
    //     window.location.reload()
    // }, 1000);
})