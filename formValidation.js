
class formValidator{
    constructor(formId,validationConfig){
        this.form = document.getElementById(formId);
        this.config = validationConfig;
        this.errors = {};
        this.initializeEvents();
    }

    initializeEvents(){
        this.form.addEventListener("submit",(e)=>{
            e.preventDefault();
            this.handleSubmit();
        });
        //Real time validation
        Object.keys(this.config.fields).forEach(fieldName =>{
            const input = document.getElementById(fieldName);
            if(input){
                input.addEventListener("blur",()=>this.validateField(fieldName));
                input.addEventListener("input",()=>this.clearFieldError(fieldName));
            }
        });
    }

    validateField(fieldName){
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        const value = input.value.trim();
        const rules = this.config.fields[fieldName];

        for(let rule of rules){
            if(!rule.validate(value)){
                this.showError(input, errorElement, rule.message);
                this.errors[fieldName] = rule.message;
                return false;
            }
        }
        this.showSuccess(input,errorElement);
        delete this.errors[fieldName];
        return true;
    }

    validateForm(){
        let isValid = true;
        Object.keys(this.config.fields).forEach(fieldName=>{
            if(!this.validateField(fieldName)){
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit(){
        if(this.validateForm()){
            const formData = this.getFormData();
            this.config.onSubmit(formData);
        }
    }

    getFormData(){
        const data = {};
        Object.keys(this.config.fields).forEach(fieldName =>{
            data[fieldName] = document.getElementById(fieldName).value.trim();
        });
        return data;
    }

    showError(input,errorElement,message){
        input.classList.add("error");
        input.classList.remove("success");
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }


    showSuccess(input,errorElement,message){
        input.classList.add("success");
        input.classList.remove("error");
        errorElement.textContent = '';
        errorElement.style.display = "none";
    }

    clearFieldError(fieldName){
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
         input.classList.remove("error");
         errorElement.textContent = '';
    }

}

const validators = {
    required: (value) => value.trim() !== "",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (min) => (value) => value.length >= min,
    maxLength: (max) => (value) => value.length <= max,
    pattern: (regex) => (value) => regex.test(value),
    passwordStrength: (value) =>{
        return /^(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])/.test(value);
    }
};

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
    },
    onSubmit:(formData) =>{
        console.log(`Login data: ${formData}`);
    }
}

new formValidator("login-form",loginConfig);


function showHidePassword(){
    let toggle = document.querySelectorAll(".eye");
    let openEye = document.querySelector(".eyeOpen");
    let closeEye = document.querySelector(".eyeClosed");
    let input = document.getElementById("password");
    toggle.forEach(icon =>{
        iconaddEventListener("click", () => {
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
