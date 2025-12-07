const API_URL = 'http://localhost:5000/api';

function showError(fieldId, message){
    const errorDiv = document.getElementById(fieldId + '-error');
    if(errorDiv){
        errorDiv.textContent = message;
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.9em';
        errorDiv.style.marginTop = '5px';
    }
}

function clearErrors(){
    const errorDivs = document.querySelectorAll('.error-message');
    errorDivs.forEach(div => div.textContent = '');
}

function showMessage(message, isSuccess = true){
    let messageDiv = document.getElementById('api-message');
    if(!messageDiv){
        messageDiv = document.createElement('div');
        messageDiv.id = 'api-message';
        messageDiv.style.cssText = `
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
        text-align: center,
        font-weight: bold;
        `;
        document.querySelector('form').prepend(messageDiv);
    }

    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = isSuccess ? '#155724' : '#721c24';
    messageDiv.style.border = `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`;
}

document.addEventListener('DOMContentLoaded', function(){
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit',async function (event) {
        event.preventDefault();

        clearErrors();

        const studentData = {
            first_name: document.getElementById('firstName').value.trim(),
            surname: document.getElementById('surname').value.trim(),
            date_of_birth: document.getElementById('birthDate').value,
            cellphone: document.getElementById('userTel').value.trim(),
            address_street: document.getElementById('street').value.trim(),
            address_postal_code: document.getElementById('pc').value.trim(),
            address_city: document.getElementById('userCity').value.trim(),
            country: document.getElementById('country').value,
            email: document.getElementById('userEmail').value.trim(),
            password: document.getElementById('userPassword').value,
            confirm_password: document.getElementById('confirmPassword').value
        };

        let isValid = true;
        
        if(!studentData.first_name){
            showError('firstName','First name is required');
            isValid = false; 
        }

        if(!studentData.surname){
            showError('surname','Surname is required');
            isValid = false; 
        }

        if(!studentData.date_of_birth){
            showError('birthDate','Date of birth is required');
            isValid = false; 
        }

        if(!studentData.country){
            showError('country','Country is required');
            isValid = false; 
        }

        const confirmEmail = document.getElementById('confirmEmail').value.trim();
        if(studentData.email !== confirmEmail){
            showError('confirmEmail','Emails do not match');
            isValid = false;
        }

        if(studentData.password !== studentData.confirm_password){
            showError('confirmPassword','Passwords do not match');
            isValid = false;
        }

        if(studentData.password.length < 6){
            showError('userPassword', 'Password must be at least 6 characters');
            isValid = false;
        }

        if(!isValid){
            showMessage('Please fix the errors below',false);
            return;
        }

        if(!studentData.cellphone) delete studentData.cellphone;
        if(!studentData.address_street) delete studentData.address_street;
        if(!studentData.address_postal_code) delete studentData.address_postal_code;
        if(!studentData.address_city) delete studentData.address_city;

        const submitBtn = signupForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        try{
            showMessage('Creating your account...',true);
            const response = await fetch(`${API_URL}/students/register`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });

            const result = await response.json();

            if(result.success){
                showMessage('Account created successfully!',true);
                signupForm.reset();

                setTimeout(()=>{
                    window.location.href = 'SignUp.html';
                },1000);
            }
            else{
                showMessage(`${result.error}`,false);
                if(result.error.includes('email')){
                    showError('userEmail',result.error)
                }
            }
        }
        catch(error){
            console.error('Sign-up error',error);
            showMessage('Network error. Please check if backend is running',false);
        }
        finally{
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    

    });
});