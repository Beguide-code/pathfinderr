
import {formValidator,validators} from './main.js';

 

const registerConfig = {
    fields:{
        firstName:[
            {validate: validators.required, message: "First name is required"}
        ],
        surname:[
            {validate: validators.required, message: "Surname is required"}
        ],
        birthDate:[
            {validate: validators.required, message: "Date of birth is required"}
        ],
        country:[
            {validate: validators.required, message: "Country is required"}
        ],
        userEmail:[
            {validate: validators.required, message: "Email is required"},
            {validate: validators.email, message: "Invalid email format"}
        ],
        confirmEmail:[
            {validate: validators.required, message: "Confirm email"},
            {validate: validators.email, message: "Invalid email"}
        ],
        userPassword:[
            {validate: validators.required, message: "Password is required"},
            {validate: validators.minLength(8), message: "Password must be atleast 8 characters"}
            // {validate: validators.passwordStrength, message: "Password must contain uppercase, number and special-characters"}
        ],
        confirmPassword:[
            {validate: validators.required, message: "Confirm password"},
            {validate: validators.minLength(8), message: "Invalid password"}
        ]
 }
};

     new formValidator("signup-form",registerConfig);


function showHidePassword1(){
    let toggle = document.querySelectorAll(".eye");
    let openEye = document.querySelector(".eyeOpen");
    let closeEye = document.querySelector(".eyeClosed");
    let input = document.getElementById("userPassword");
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
function showHidePassword2(){
    let toggle = document.querySelectorAll(".eye2");
    let openEye = document.querySelector(".eyeOpen2");
    let closeEye = document.querySelector(".eyeClosed2");
    let input = document.getElementById("confirmPassword");
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


showHidePassword1();
showHidePassword2();