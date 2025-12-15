const API_URL = 'http://localhost:5000/api';

let currentUser = null;
let userApplications = [];

const elements = {
    userName: document.getElementById('user-name'),
    userGpa: document.getElementById('user-gpa'),
    userMajor: document.getElementById('user-major'),
    userGraduationYear: document.getElementById('user-graduation-year'),
    userMail: document.getElementById('user-mail'),
    userInterest: document.getElementById('user-interest'),
    appliedCount: document.getElementById('applied-count'),
    saveCount: document.getElementById('save-count'),
    acceptedCount: document.getElementById('accepted-count'),

    gpaInput: document.querySelector('input[name="gpa"]'),
    majorInput: document.getElementById('formGroupExampleInput2'),
    graduationInput: document.querySelector('input[placeholder="Ex : 2024"]'),
    interestsTextarea: document.getElementById('floatingTextarea2'),
    saveButton: document.querySelector('.modal-footer .btn-primary')

};

function checkAuth(){
    const token = localStorage.getItem('pathfinderr_token');
    const userStr = localStorage.getItem('pathfinderr_user');

    if(!token || !userStr){
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `LogIn.html?return=${returnUrl}`;
        return false;
    }

    currentUser = JSON.parse(userStr);
    return true;
}

async function loadUserProfile(){
    if(!currentUser) return;

    try{
        // console.log('Loading profile for user ID:',currentUser.id);

        const response = await fetch(`${API_URL}/students/${currentUser.id}`,{
            headers:{
                'Authorization': `Bearer ${localStorage.getItem('pathfinderr_token')}`
            }
        });
        if(!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if(result.success){
            updateProfileDisplay(result.data);
            populateEditForm(result.data);
        }
    }
    catch(error){
        console.error('Error loading profile',error);
        showMessage('Failed to load profile data','error');
    }
}

async function loadUserApplications(){
    if(!currentUser) return;

    try{
        const response = await fetch(`${API_URL}/applications`,{
            headers:{
                'Authorization': `Bearer ${localStorage.getItem('pathfinderr_token')}`
            }
        });
        if(!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if(result.success){
            userApplications = result.data;
            updateApplicationCounts();
        }
    }
    catch(error){
        console.error('Error loading applications',error);
    }
}

function updateProfileDisplay(userData){
    if(elements.userName){
        elements.userName.textContent = `Hi, ${userData.first_name || userData.first_name} ${userData.surname || ''}`;
    }
    if(elements.userMail){
        elements.userMail.textContent = userData.email ? `${userData.email}` : 'Email: Not set';
    }
    if(elements.userGpa){
        elements.userGpa.textContent = userData.gpa ? `${userData.gpa}` : 'GPA: Not set';
    }
    if(elements.userMajor){
        elements.userMajor.textContent = userData.major ? `${userData.major}` : 'Major: Not set';
    }
    if(elements.userGraduationYear){
        if(userData.graduation_year){
            elements.userGraduationYear.textContent = `Graduation Year:${userData.graduation_year}`;
        }
    }
    if(elements.userInterest){
        if(userData.interests && userData.interests.length > 0){
            const interestsText = Array.isArray(userData.interests) ? userData.interests.join(', ') : userData.interests;
            elements.userInterest.textContent = interestsText;
        }
    }
}


function populateEditForm(userData){
    if(elements.gpaInput){
        elements.gpaInput.value = userData.gpa || '';
    }
    if(elements.majorInput){
        elements.majorInput.value = userData.major || '';
    }
    if(elements.graduationInput && userData.graduation_year){
        const date = new Date(userData.graduation_year,0,1);
        elements.graduationInput.value = date.toISOString().split('T')[0];
        
    }
    if(elements.interestsTextarea){
        if(userData.interests){
            const interestsText = Array.isArray(userData.interests) ? userData.interests.join(', ') : userData.interests;
            elements.interestsTextarea.value = interestsText;
        }
    }
}

function updateApplicationCounts(){
    if(!userApplications.length) return;

    const appliedCount = userApplications.filter(app => app.status_application === 'applied').length;
    const interestedCount = userApplications.filter(app => app.status_application === 'interested').length;
    const acceptedCount = userApplications.filter(app => app.status_application === 'accepted').length;

    if(elements.appliedCount){
        elements.appliedCount.textContent = appliedCount;
    }
    if(elements.saveCount){
        elements.saveCount.textContent = interestedCount;
    }
    if(elements.acceptedCount){
        elements.acceptedCount.textContent = acceptedCount;
    }
}

async function updateProfile(event){
    event.preventDefault();

    if(!currentUser) return;

    const updateData = {};

    if(elements.gpaInput.value){
        updateData.gpa = parseFloat(elements.gpaInput.value);
    }
    if(elements.graduationInput.value){
        const date = new Date(elements.graduationInput.value);
        updateData.graduation_year = date.getFullYear();
    }
    if(elements.majorInput.value){
        updateData.major = elements.majorInput.value;
    }
    if(elements.interestsTextarea.value){
        const interests = elements.interestsTextarea.value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        updateData.interests = interests;
    }

    if(Object.keys(updateData).length === 0){
        showMessage('No changes to save', 'info');
        return;
    }

    try{
        const saveButton = elements.saveButton;
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;

        const response = await fetch(`${API_URL}/students/${currentUser.id}`,{
            method:'PUT',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('pathfinderr_token')}`
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();
        if(result.success){
            showMessage('Profile updated successfully!','success');
            const updatedUser = {...currentUser, ...updateData};
            localStorage.setItem('pathfinderr_user', JSON.stringify(updatedUser));
            currentUser = updatedUser;           
            
            updateProfileDisplay(updatedUser);
            setTimeout(()=>{
                const modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop'));
                if(modal) modal.hide();
            },1500);

        }else {
            showMessage(`Update failed: ${result.error}`,'error');
        }
        saveButton.textContent = originalText;
        saveButton.disabled = false;
    }
    catch(error){
        console.error(`Update error:`,error);
        showMessage('Failed to update profile','error');

        const saveButton =elements.saveButton;
        saveButton.textContent = 'Save';
        saveButton.disabled = false;
    }
}

function showMessage(text, type = 'info'){
    const existingMsg = document.getElementById('profile-message');
    if(existingMsg) existingMsg.remove();

    let alertClass;
    switch(type){
        case 'error': alertClass = 'alert-danger';
            break;
        case 'success': alertClass = 'alert-success';
            break;
        case 'info':
        default:
            alertClass = 'alert-info';
            break;
    }

    const messageDiv = document.createElement('div');
    messageDiv.id = 'profile-messsage';
    messageDiv.className = `alert ${alertClass} alert-dismissible fade show`;
    messageDiv.setAttribute('role','alert');
    messageDiv.style.cssText = 'position: fixed; top:20px; right: 20px; z-index: 9999; max-width: 300px;';

    messageDiv.innerHTML = `
    <div class = "d-flex justify-content-between align-items-start">
    <div class="me-3">${text}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" arial-label="Close"></button>
    </div>
    `
    document.body.appendChild(messageDiv);
    setTimeout(()=>{
        if(messageDiv.parentNode){
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';

            setTimeout(()=>{
                if(messageDiv.parentNode){
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            },500);
        }
    },type === 'success' ? 3000 : 5000);

    // const messageDiv = document.createElement('div');
    // messageDiv.id = 'profile-message';
    // messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info' } alert-dismissible fade show`;
    // messageDiv.innerHTML = `
    //     ${text}
    //     <button type = "button" class="btn-close" data-bs-dismiss="alert" arial-label="Close"></button>
    // `;
    // messageDiv.style.cssText = 'postion: fixed; top: 20px; right: 20px; z-index: 1060; max-width: 300px;';

    // document.body.appendChild(messageDiv);

    // if(type === 'success'){
    //     setTimeout(()=>{
    //         if(messageDiv.parentNode){
    //             messageDiv.parentNode.removeChild(messageDiv);
    //         }
    //     },3000);
    // }
}

document.addEventListener('DOMContentLoaded', function(){
    if(!checkAuth()) return;

    loadUserProfile();
    loadUserApplications();

    if(elements.saveButton){
        elements.saveButton.addEventListener('click',updateProfile);
    }

    const form = document.querySelector('#staticBackdrop form') || document.querySelector('#staticBackdrop .modal-body');
    if(form){
        form.addEventListener('submit',function(event){
            event.preventDefault();
            updateProfile(event);
        });
    }
    const exploreBtn = document.querySelector('.explore-btn');
    if(exploreBtn){
        exploreBtn.addEventListener('click',function(){
            window.location.href = 'OpportunityPage.html';
        });
    }
    // const applicationLinks = document.querySelectorAll('.saved-list a');
    // applicationLinks.forEach(link=> {
    //     link.addEventListener('click',function(event){
    //         event.preventDefault();
    //         showMessage('Application lists feature coming soon','info');
    //     });
    // });
});