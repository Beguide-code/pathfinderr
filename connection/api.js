const API_BASED_URL = 'htt://localhost:5000/api';

class APIService{

    static async request(endpoints, options={}){
        const url = `${API_BASE_URL}${endpoints}`;

        const defaultOptions = {
            headers:{
                'Content-Type': 'application/json',
            },
        };

        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers:{
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try{
            const reponse = await fetch(url,requestOptions);
            const data = await reponse.json();

            if(!reponse.ok){
                throw new Error(data.error || `HTTP ${reponse.status}`);
            }
            return data;
        }
        catch(error){
            console.error(`API Request failed:`,error);
            throw error;
        }

    }

    static async register(studentData){
        return this.request('/students/register',{
            method:'POST',
            body: JSON.stringify(studentData),
        });
    }

    static async login(email,password){
        return this.request('/auth/login',{
            method:'POST',
            body:JSON.stringify({email,password}),
        });
    }

    static async getCurrentUser(token){
        return this.request('/auth/me',{
            headers:{'Authorization':`Bearer ${token}`},
        });
    }

    static async getStudentProfile(id,token){
        return this.request(`/students/${id}`,{
             headers:{'Authorization':`Bearer ${token}`},
        });
    }
 
    static updateStudentProfile(id,data,token){
        return this.request(`/students/${id}`,{
            method:'PUT',
            headers:{'Authorization':`Bearer ${token}`},
            body:JSON.stringify(data),
        });
    }


    static async getOpportunities(filters = {}){
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/opportunities?${params}` : '/opportunities';
        return this.request(endpoint);
    }

    static async getOpportunityById(id){
        return this.request(`/opportunities/${id}`);
    }

    static async searchOpportunities(filters){
        const params = new URLSearchParams(filters).toString();
        return this.request(`/opportunities/search?${params}`);
    }

    static async createApplication(data,token){
        return this.request('/applications',{
            method:'POST',
            headers: {'Authorization':`Bearer ${token}`},
            body: JSON.stringify(data),
        });
    }

    static async getApplications(token){
        return this.request(`/applications/${id}`,{
            headers: {'Authorization':`Bearer ${token}`},
        });
    }

    static async updateApplication(id,data,token){
        return this.request(`/applications/${id}`,{
            method:'PUT',
            headers: {'Authorization':`Bearer ${token}`},
            body: JSON.stringify(data),
        });
    }

    static async deleteApplication(id,token){
        return this.request(`/applications/${id}`,{
            method:'DELETE',
            headers: {'Authorization':`Bearer ${token}`},
        });
    }

}