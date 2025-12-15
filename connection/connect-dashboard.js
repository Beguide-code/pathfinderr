const API_URL = 'http://localhost:5000/api';
let currentUser = null;

let userStats ={
    saved:0,
    applied:0,
    accepted:0,
    total:0
};

function checkAuth(){
    const token = localStorage.getItem('pathfinderr_token');
    const userStr = localStorage.getItem('pathfinderr_user');

    if(!token || !userStr){
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `LogIn.html?return=${returnUrl}`;
        return false;
    }
    currentUser = JSON.parse(userStr);
    return true;
}

async function loadUserData(){
    try{
        const token = localStorage.getItem('pathfinderr_token');
        const profileResponse = await fetch(`${API_URL}/students/${currentUser.id}`,{
            headers:{'Authorization': `Bearer ${token}`}
        });
        if(profileResponse.ok){
            const profileData = await profileResponse.json();
            if(profileData.success){
                updateProfileDisplay(profileData.data)
            }
        }
        const appResponse = await fetch(`${API_URL}/applications`,{
            headers:{'Authorization': `Bearer ${token}`}
        });
        if(appResponse.ok){
            const appsData = await appResponse.json();
            if(appsData.success){
                calculateStatistics(appsData.data);
                updateStatsDisplay();
            }
        }
    }
    catch(error){
        console.error('Error loading dashboard data:',error);
        showMessage('Failed to load dashboard data',true);
    }
}

function updateProfileDisplay(userData){
    const welcomeElement = document.getElementById('user-name');
    if(welcomeElement){
        const firstName = userData.first_name || userData.email.split('@')[0];
        welcomeElement.textContent = `Welcome to your dashboard, ${firstName}!`;
    }
}

function calculateStatistics(applications){
    userStats = {
        saved: applications.filter(app=> app.status_application === 'interested').length,
        applied: applications.filter(app=> app.status_application === 'applied').length,
        accepted: applications.filter(app=> app.status_application === 'accepted').length,
        total: applications.length
    };
}

function updateStatsDisplay(){
    updateSidebarCounts();
    addStatsCards();
}

function updateSidebarCounts(){
    const navItems = {
        'DashboardSave.html': userStats.saved,
        'DashboardApplied.html': userStats.applied,
        'DashboardAccepted.html': userStats.accepted
    };

    Object.keys(navItems).forEach(page=>{
        const link = document.querySelector(`a[href="${page}"]`);
        if(link){
            const count = navItems[page];
            if(count > 0){
                let badge = link.querySelector('.badge');
                if(!badge){
                    badge = document.createElement('span');
                    badge.className = 'bagde bg-primary rounded-pill ms-2';
                    link.appendChild(badge);
                }
                badge.textContent = count;
            }else{
                const badge = link.querySelector('.badge');
                if(badge) badge.remove();
            }
        }
    });
}

function addStatsCards(){
    const mainContent = document.querySelector('main .summary');
    if(!mainContent) return;

    if(document.getElementById('stats-cards')) return;
    const statsHTML =`
    <div id="stats-cards" class="row mt-4">
        <div class="col-md-4 mb-3">
        <div class="card border-primary">
            <div class="card-body text-center">
                <h5 class="card-title text-primary">
                    <i class="bi bi-bookmark-fill me-2"></i>Saved
                </h5>
                <h2 class="display-4">${userStats.saved}</h2>
                <p class="card-text">Opportunities you're interested in</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="card border-warning">
            <div class="card-body text-center">
                <h5 class="card-title text-warning">
                    <i class="bi bi-blank me-2"></i>Applied
                </h5>
                <h2 class="display-4">${userStats.applied}</h2>
                <p class="card-text">Applications submitted</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="card border-success">
            <div class="card-body text-center">
                <h5 class="card-title text-success">
                    <i class="fa fa-check me-2"></i>Accepted
                </h5>
                <h2 class="display-4">${userStats.accepted}</h2>
                <p class="card-text">Successful applications</p>
            </div>
        </div>
    </div> 
</div>        
    `;
mainContent.insertAdjacentHTML('afterend',statsHTML);
}

function setupSearch(){
    const searchInput = document.getElementById('searchInputField');
    const searchButton = document.querySelector('#navbarSearch button.btn-primary');
    const closeButton = document.querySelector('#navbarSearch button.btn-outline-secondary');

    if(searchInput && searchButton){
        searchButton.addEventListener('click',()=>{
            performSearch(searchInput.value);
        });

        searchInput.addEventListener('keypress',(e)=>{
            if(e.key === 'Enter'){
                performSearch(searchInput.value)
            }
        });
    }
    if(closeButton){
        closeButton.addEventListener('click',()=>{
            if(searchInput) searchInput.value = '';
        });
    }
}

function performSearch(searchTerm){
    if(!searchTerm.trim()){
        showMessage('Please enter a search term',false);
        return;
    }
    window.location.href = `OpportunityPage.html?search=${encodeURIComponent(searchTerm)}`;
}

function setupLogout(){
    const logoutLink = document.querySelector('a[href="#"].text-danger');
    if(logoutLink){
                    logoutLink.addEventListener('click',(e) =>{
                    e.preventDefault();
                    localStorage.removeItem('pathfinderr_token');
                    localStorage.removeItem('pathfinderr_user');
                    window.location.href = 'LogIn.html';
                });
        }
}

function setupSidebarNavigation(){
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link =>{
        link.classList.remove('active');
        if(link.getAttribute('href')=== currentPage){
            link.classList.add('active');
        }
    });

    const homepageLink = document.querySelector('a[href="index.html"]');
        if(homepageLink){
            homepageLink.addEventListener('click',(e)=>{
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
}

function showMessage(message, isError = false){
    const existingMsg = document.getElementById('dashboard-message');
    if (existingMsg) existingMsg.remove();

    const messageDiv = document.createElement('div');
    messageDiv.id = 'dashboard-message';
    messageDiv.className= `alert alert-${isError ? 'danger':'success'}alert-dismissible fade show`
    messageDiv.style.cssText = `
     position: fixed; top: 20px; right: 20px; z-index:9999; max-width: 300px;
    `;
    messageDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(messageDiv);

    setTimeout(()=>{
        if(messageDiv.parentNode) messageDiv.remove();
    },3000);
}

function initDashboard(){
    if(!checkAuth()) return;

    setupSidebarNavigation();
    loadUserData();
    setupSearch();
    setupLogout();

    document.getElementById('user-name').textContent = 'Loading your dashboard...';
}

document.addEventListener('DOMContentLoaded',initDashboard);