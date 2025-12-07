import {formValidator,validators} from './main.js';

const loginConfig = {
    fields:{
        email:[
            {validate: validators.required, message: "Email is required"},
            {validate: validators.email, message: "Invalid email format"},
        ],
        password:[
            {validate: validators.required, message: "Password is required"},
            {validate: validators.minLength(8), message: "Incorrect password"},
        ]
    }
    
}

  new formValidator("login-form",loginConfig);




 function showHidePassword(){
    let toggle = document.querySelectorAll(".eye");
    let openEye = document.querySelector(".eyeOpen");
    let closeEye = document.querySelector(".eyeClosed");
    let input = document.getElementById("password");
    toggle.forEach(icon =>{
        icon.addEventListener("click", () => {
        if(input.type === "password"){
            input.type = "text";
            closeEye.style.display = "none";
            openEye.style.display = "flex";
            
         }
        else{
            input.type = "password";
            openEye.style.display = "none";
            closeEye.style.display = "flex";
        }

    });
    });
    
}
showHidePassword();






 



