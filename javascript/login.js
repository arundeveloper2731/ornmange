document.addEventListener("DOMContentLoaded",() =>{
    const loginform = document.getElementById("loginform");

    loginform.addEventListener("submit",function(){
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if(username ===""){
            alert("Enter username");
            event.preventDefault();
            return;
        }
        if(password ===""){
            alert("Enter password");
            event.preventDefault();
            return;
        }
    });
});