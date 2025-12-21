/**
 * User Entity Class
 * Manages user authentication and profile data
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.full_name = data.full_name || '';
    this.user_type = data.user_type || 'candidate'; // 'candidate' or 'hr'
    this.phone = data.phone || '';
    this.company = data.company || '';
    this.position = data.position || '';
    this.experience_years = data.experience_years || 0;
    this.skills = data.skills || [];
    this.avatar_url = data.avatar_url || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.last_login = data.last_login || null;
  }

  // Static authentication methods
  static async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      return new User(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      return new User(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      localStorage.removeItem('auth_token');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('auth_token');
      return true;
    }
  }

  static async me() {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          throw new Error('Authentication expired');
        }
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const token = localStorage.getItem('auth_token');
      const method = this.id ? 'PUT' : 'POST';
      const url = this.id ? `/api/users/${this.id}` : '/api/users';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.toJSON()),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user');
      }
      
      const data = await response.json();
      Object.assign(this, data);
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/users/${this.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      Object.assign(this, data);
      return this;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/users/${this.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async uploadAvatar(file) {
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`/api/users/${this.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      const data = await response.json();
      this.avatar_url = data.avatar_url;
      return this;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // Utility methods
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      full_name: this.full_name,
      user_type: this.user_type,
      phone: this.phone,
      company: this.company,
      position: this.position,
      experience_years: this.experience_years,
      skills: this.skills,
      avatar_url: this.avatar_url,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_login: this.last_login,
    };
  }

  isValid() {
    return this.email && this.full_name && this.user_type;
  }

  isHR() {
    return this.user_type === 'hr';
  }

  isCandidate() {
    return this.user_type === 'candidate';
  }

  getInitials() {
    return this.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDisplayName() {
    return this.full_name || this.email;
  }

  addSkill(skill) {
    if (!this.skills.includes(skill)) {
      this.skills.push(skill);
      this.updated_at = new Date().toISOString();
    }
  }

  removeSkill(skill) {
    this.skills = this.skills.filter(s => s !== skill);
    this.updated_at = new Date().toISOString();
  }

  hasSkill(skill) {
    return this.skills.includes(skill);
  }

  static getUserTypeOptions() {
    return ['candidate', 'hr'];
  }

  static isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  static getAuthToken() {
    return localStorage.getItem('auth_token');
  }
}

export default User;