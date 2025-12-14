const API_URL = 'http://localhost:5000/api';
let opportunities = [];
let currentUser = null;

function checkAuth(){
    const token = localStorage.getItem('pathfinderr_token');
    const userStr = localStorage.getItem('pathfinderr_user');

    if(!token || !userStr){
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?return=${returnUrl}`;
        return false;
    }
    currentUser = JSON.parse(userStr);
    return true;
}

function showMessage(message, isError = false){
    const existingMsg = document.getElementById('global-message');
    if (existingMsg) existingMsg.remove();

    const messageDiv = document.createElement('div');
    messageDiv.id = 'global-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    background-color: ${isError ? '#f8d7da' : '#d4edda'};
    color: ${isError ? '#721c24' : '#155724'};
    border: 1px solid  ${isError ? '#f5c6cb' : '#c3e6cb'};
    z-index: 9999;
    max-width: 300px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(messageDiv);

    setTimeout(()=>{
        if(messageDiv.parentNode) messageDiv.remove();
    },3000);
}

async function loadOpportunities(filters ={}){
    try{

        console.log(filters);
        showMessage('Loading opportunities...',false);
        const token = localStorage.getItem('pathfinderr_token');
        const params = new URLSearchParams(filters).toString();
        const url = params ? `${API_URL}/opportunities/search?${params}` : `${API_URL}/opportunities`;

        const response = await fetch(url,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if(response.status === 401){
            showMessage('Session expired, Please login again.',true);
            setTimeout(()=>{
                localStorage.removeItem('pathfinderr_token');
                localStorage.removeItem('pathfinderr_user');
                window.location.href = 'login.html';
            },1500);
            return;
        }
        if(!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();

        if(result.success){
            opportunities = result.data
            renderOpportunities();
            showMessage(`Found ${opportunities.length} opportunities`,false)
        }else{
            throw new Error(result.error || 'Failed to load');
        }
    }
    catch(error){
        console.error('Error loading opportunities:',error);
        showMessage(error.message || 'Failed to load opportunities',true);      
    }
}

function renderOpportunities(){
    const container = document.querySelector('.opportunity-section .row');
    if(!container) return;

    container.innerHTML = '';
    if(opportunities.length === 0){
        container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-info text-center">
                <i class="fas fa-search me-2></i>
                No opportunities found. Try changing your filters.
            </div>
        </div>
        `;
        return;
    }
    opportunities.forEach(opp =>{
        const col = document.createElement('div');
        col.className = 'col';

        let deadlineText = ''
        if(opp.deadline){
            const deadline = new Date(opp.deadline);
            const now = new Date();
            const daysLeft = Math.ceil((deadline - now)/(1000*60*60*24));

            if(daysLeft > 0){
                deadlineText = `<small class="text-muted d-block"><i class="fas fa-clock me-1"></i> ${daysLeft} days left</small>`;
            }
        }
        col.innerHTML = `
        <div class="card h-100">
            <img src="${opp.image_url || "image1 (2).jpg"}"
                class="card-img-top"
                alt="${opp.title}"
                style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${opp.title}</h5>
                <div class="flex-grow-1">
                    <p class="card-text">${opp.description_opportunity?.substring(0,150) || 'No description available,'}...</p>
                </div>
                <div class="opportunity--meta mt-2">
                    <small class="text-muted d-block">
                        <i class="fas fa-map-marker-alt me-1"></i>${opp.country_opportunity || 'Various'}
                    </small>
                    <small class="text-muted d-block">
                        <i class="fas fa-graduation-cap me-1"></i>${opp.type_opportunity || 'Opportunity'}
                    </small>
                    ${deadlineText}
                    ${opp.min_gpa ? `<small class="text-muted d-block"><i class="fas fa-star me-1"></i> Min GPA: ${opp.min_gpa}</small>` : ''}
                </div>
                <a href="opportunity-detail.html?id=${opp.id}" class="btn btn-primary mt-3">See more</a>
            </div>
        </div>
        `;
        container.appendChild(col);
    });
}

function setupFilters(){
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    const searchButton = document.querySelector('.search-bar button');

    if(searchInput && searchButton){
        searchButton.addEventListener('click',(e)=>{
            e.preventDefault();
            applyFilters();
        });
        searchInput.addEventListener('keypress',(e)=>{
            if(e.key === 'Enter') applyFilters();
        });
    }
    const selects = document.querySelectorAll('.form-select');
    selects.forEach((select,index)=>{
        select.addEventListener('change',applyFilters);
    });

    const deleteBtn = document.querySelector('.btn-delete');
    const searchBtn = document.querySelector('.btn-search');

    if(deleteBtn){
        deleteBtn.addEventListener('click',resetFilters);
    }
    if(searchBtn){
        searchBtn.addEventListener('click',applyFilters);
    }

    const toggle = document.getElementById('additional-filters-toggle');
    if(toggle){
        toggle.addEventListener('change',(e)=>{
            const popup = document.querySelector('.additional-filters-popup');
            if(popup){
                popup.style.display = e.target.checked ? 'flex' : 'none';
                if(e.target.checked){
                    popup.style.gap = '10px';
                    popup.style.marginTop = '10px';
                }
            }
        });
    }
    }

    function applyFilters(){
        const filters ={};

        const searchInput = document.querySelector('.search-bar input[type="search"]');
        if(searchInput && searchInput.value.trim()){
            filters.q = searchInput.value.trim();
        }

        const dropdownConfig = [
            {name: 'type', placeholder:'Type'},
            {name: 'country', placeholder:'Country'},
            {name: 'major', placeholder:'Majors'},
            {name: 'minGpa', placeholder:'MinGPA'},
            {name: 'deaddline', placeholder:'Put something relative to a date'}
        ];

        const selects = document.querySelectorAll('.form-select');

        selects.forEach((select,index)=>{
            const config = dropdownConfig[index];
            if(!config) return;

            const selectedOption = select.options[select.selectedIndex];
            if(selectedOption.text !== config.placeholder){
                filters[config.name] = selectedOption.text.trim()
                if(config.name === 'minGpa'){
                    filters[config.name] = parseFloat(selectedOption.text) || selectedOption.text;
                }
            }
        });
        
        loadOpportunities(filters);
        
    }

    function resetFilters(){
        const searchInput = document.querySelector('.search-bar input[type="search"]');
        if(searchInput) searchInput.value = '';

        document.querySelectorAll('.form-select').forEach(select =>{
            select.selectedIndex = 0;
        });

        const toggle = document.getElementById('additional-filters-toggle');

        if(toggle){
            toggle.checked = false;
            const popup = document.querySelector('.additional-filters-popup');
            if(popup) popup.style.display = 'none';
        }
        loadOpportunities();
    }

    function initOpportunityPage(){
        if(!checkAuth()) return;
        const container = document.querySelector('.opportunity-selection .row');
        if(container){
            container.innerHTML =`
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">loading...</span>
                    </div>
                    <p class="mt-3">Loading opportunities...</p>
                </div>
            </div>
            `;
        }
        loadOpportunities();
        setupFilters();

        updateNavigation();
    }

    function updateNavigation(){
        const profileLink = document.querySelector('a[href="ProfilePage.html"]');
        if(profileLink && currentUser){
            profileLink.href = `ProfilePage.html?id${currentUser.id}`;
        }

        const DashboardLink = document.querySelector('a[href="DashboardSummary.html"]');
        if(DashboardLink && currentUser){
            DashboardLink.href = `DashboardSummary.html?id${currentUser.id}`;
        }

        const homepageLink = document.querySelector('a[href="index.html"]');
        if(homepageLink){
            homepageLink.addEventListener('click',(e)=>{
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
        const logoutLink = document.querySelector('a[href="#logout"]');
        if(!logoutLink){
            const nav = document.querySelector('.menu-container nav ul');
            if(nav){
                const logout = document.createElement('li');
                logout.innerHTML = `
                <a href="#" id="logout-link" style="color: #dc3545;">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </a>
                `;
                nav.appendChild(logout);
                document.getElementById('logout-link').addEventListener('click',(e) =>{
                    e.preventDefault();
                    localStorage.removeItem('pathfinderr_token');
                    localStorage.removeItem('pathfinderr_user');
                    window.location.href = 'LogIn.html';
                });
            }
        }
    }

    document.addEventListener('DOMContentLoaded',initOpportunityPage);
    window.addEventListener('pageshow',function(event){
        if(event.persisted){
            if(!checkAuth()) return;
        }
    });

