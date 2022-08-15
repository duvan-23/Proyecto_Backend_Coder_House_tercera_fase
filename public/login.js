const olvidar=document.getElementById("olvidar");
if(olvidar){
    olvidar.addEventListener('click',(e)=>{
        e.preventDefault();
        window.location.href=`/logout`;
       
    });
}
