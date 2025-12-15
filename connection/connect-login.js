const API_URL = 'http://localhost:5000/api';

const LoginConnector = {
    showMessage: function(message, isError=false){
        let messageContainer = document.getElementById('api-message');

        if(!messageContainer){
            messageContainer = document.createElement('div');
            messageContainer.id = 'api-message';
            messageContainer.style.cssText = `
                padding: 12px;
                margin: 15px 0;
                border-radius: 8px;
                text-align: center,
                font-weight: 500;
            `; 
            const form = document.getElementById('login-form');
            form.parentNode.insertBefore(messageContainer, form.nextSibling);
        }

        messageContainer.textContent = message;
        // messageContainer.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
        messageContainer.style.color = isError ? '#e20a20ff' : '#155724';
        // messageContainer.style.border = `1px solid ${isError ? '#e20a20ff' : '#c3e6cb'}`;

        if(!isError){
            setTimeout(()=>{
                messageContainer.textContent = '';
                messageContainer.style.cssText = '';
            },5000);
        }
    },

    showLoading: function(show = true){
        const submitButton = document.querySelector('#login-form .Next');
        if(!submitButton) return;
        if(show){
            submitButton.textContent = 'Logging in...';
            submitButton.disabled = true;
            submitButton.style.opacity = '0.7';
        }
        else{
            submitButton.textContent = 'Next';
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    },

    saveAuthData: function(token,userData){
        localStorage.setItem('pathfinderr_token',token);
        localStorage.setItem('pathfinderr_user',JSON.stringify(userData));
        // console.log('Login successful for',userData.email);
    }
};

function getReturnUrl(){
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl =  urlParams.get('return');
    if(!returnUrl || returnUrl === 'undefined'){
        return 'DashboardSummary.html';
    }
    return decodeURIComponent(returnUrl);
}

document.addEventListener('DOMContentLoaded',function(){
    const loginForm = document.getElementById('login-form');
    if(!loginForm) return;

    const existingToken = localStorage.getItem('pathfinderr_token');
    if(existingToken){
        console.log('User already logged in');
    }

    const submitButton = loginForm.querySelector('.Next');
    if(submitButton){
        submitButton.addEventListener('click',async function(event){
            event.preventDefault();

            const oldMessage = document.getElementById('api-messsage');
            if(oldMessage) oldMessage.remove();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if(!email || !password){
                LoginConnector.showMessage('Please fill in all fields',true);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)){
                LoginConnector.showMessage('Please enter a valid email address',true);
                return;
            }
            
            try{
                
                LoginConnector.showLoading(true);
                LoginConnector.showMessage('Connecting to Server...',false);
                
                const response = await fetch(`${API_URL}/auth/login`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

                const result = await response.json();
                if(result.success){
                    LoginConnector.saveAuthData(result.data.token,result.data);
                    LoginConnector.showMessage('Login successful! Redirecting...',false);
                    const returnUrl = getReturnUrl();

                    setTimeout(()=>{
                        window.location.href = returnUrl; 
                    },1500);
                }
                else{
                    LoginConnector.showMessage(`${result.error || 'Login failed'}`,true);
                    LoginConnector.showLoading(false);
                }
            }
            catch(error){
                console.error('Login API error', error);
                let errorMessage = 'Cannot connect to server.';
                if(error.message.includes('Network') || error.message.includes('Failed to fetch')){
                    errorMessage += 'Pleasee check if backend is running on localhost:5000';
                }
                else{
                    errorMessage += error.message;
                }
                LoginConnector.showMessage(`${errorMessage}`,true);
                LoginConnector.showLoading(false);

            }

        });
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput){
        passwordInput.addEventListener('keypress',function(event){
            if(event.key == 'Enter'){
                event.preventDefault();
                submitButton.click();
            }
        });
    }

    const forgotPasswordLink = document.querySelector('.help a');
    if(forgotPasswordLink){
        forgotPasswordLink.addEventListener('click',function(event){
            event.preventDefault();
            LoginConnector.showMessage('Password reset feature coming soon!',false);
        });
    }

});