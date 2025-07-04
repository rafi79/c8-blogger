// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.vercel.app' 
  : 'http://localhost:3000';

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Auth APIs
  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password
    });
    return response.data;
  }

  async register(name: string, email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name,
      email,
      password
    });
    return response.data;
  }

  // Content APIs
  async generateContent(topic: string, tone: string, length: string, platforms: string[]) {
    const response = await axios.post(`${API_BASE_URL}/api/content/generate`, {
      topic,
      tone,
      length,
      platforms
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Credentials APIs
  async storeCredentials(platform: string, username: string, email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/api/credentials/store`, {
      platform,
      username,
      email,
      password
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async listCredentials() {
    const response = await axios.get(`${API_BASE_URL}/api/credentials/list`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async testCredentials(credentialId: string, platform: string) {
    const response = await axios.post(`${API_BASE_URL}/api/credentials/test`, {
      credentialId,
      platform
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async removeCredentials(credentialId: string) {
    const response = await axios.delete(`${API_BASE_URL}/api/credentials/remove`, {
      data: { credentialId },
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Posts APIs
  async createPost(content: string, platforms: string[], image?: string) {
    const response = await axios.post(`${API_BASE_URL}/api/posts/create`, {
      content,
      platforms,
      image
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getPostHistory() {
    const response = await axios.get(`${API_BASE_URL}/api/posts/history`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Automation APIs
  async postToTwitter(content: string, image?: string) {
    const response = await axios.post(`${API_BASE_URL}/api/automation/twitter`, {
      content,
      image
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async postToFacebook(content: string, image?: string) {
    const response = await axios.post(`${API_BASE_URL}/api/automation/facebook`, {
      content,
      image
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async postToInstagram(content: string, image?: string) {
    const response = await axios.post(`${API_BASE_URL}/api/automation/instagram`, {
      content,
      image
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
