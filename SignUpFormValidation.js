

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
            {validate: validators.minLength(8), message: "Password must be atleast 8 characters"},
            {validate: validators.passwordStrength, message: "Password must contain uppercase, number and special-characters"}
        ],
        confirmPassword:[
            {validate: validators.required, message: "Confirm password"},
            {validate: validators.passwordStrength, message: "Invalid password"}
        ]
 },
 onSubmit:(formData) =>{
        console.log(`Login data: ${formData}`);
    }

};

new formValidator("signup-form",registerConfig);