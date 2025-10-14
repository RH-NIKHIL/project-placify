// API base URL
const API_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Authentication APIs
export const authAPI = {
  // Login
  login: async (email, password) => {
    try {
      console.log('🔄 Attempting login to:', `${API_URL}/auth/login`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Login successful:', data);
        // Store token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        return { success: true, data };
      } else {
        console.log('❌ Login failed:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout. Please check if the backend server is running on port 5000.' };
      }
      
      return { 
        success: false, 
        error: `Network error. Please ensure:\n1. Backend server is running on http://localhost:5000\n2. MongoDB is connected\n3. Your internet connection is stable\n\nError: ${error.message}` 
      };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get Profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }
};

// User APIs
export const userAPI = {
  // Get user by ID
  getUser: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const response = await fetch(`${API_URL}/users/leaderboard/top`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.leaderboard };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.users };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
};

// Job APIs
export const jobAPI = {
  // Get all jobs
  getAllJobs: async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.jobs };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get job by ID
  getJob: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.job };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Apply for job
  applyForJob: async (jobId, applicationData) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(applicationData)
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.job };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Create job (Company only)
  createJob: async (jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData)
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.job };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Delete job (Company only)
  deleteJob: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
};

// Company APIs
export const companyAPI = {
  // Get all companies
  getAllCompanies: async () => {
    try {
      const response = await fetch(`${API_URL}/companies`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.companies };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
};

// Resume APIs
export const resumeAPI = {
  // Get all resumes
  getAllResumes: async () => {
    try {
      const response = await fetch(`${API_URL}/resumes`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.resumes };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get resume by ID
  getResume: async (resumeId) => {
    try {
      const response = await fetch(`${API_URL}/resumes/${resumeId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.resume };
      } else {
        return { success: false, error: data.message, details: data.details };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Create resume
  createResume: async (resumeData) => {
    try {
      const response = await fetch(`${API_URL}/resumes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(resumeData)
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.resume };
      } else {
        return { success: false, error: data.message, details: data.details };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Update resume
  updateResume: async (resumeId, resumeData) => {
    try {
      const response = await fetch(`${API_URL}/resumes/${resumeId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(resumeData)
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.resume };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    try {
      const response = await fetch(`${API_URL}/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Match resume with job
  matchResumeWithJob: async (resumeId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/resumes/${resumeId}/match-job/${jobId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get matches for a resume
  getResumeMatches: async (resumeId) => {
    try {
      const response = await fetch(`${API_URL}/resumes/${resumeId}/matches`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.matches };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
};

export default {
  authAPI,
  userAPI,
  jobAPI,
  companyAPI,
  resumeAPI
};
