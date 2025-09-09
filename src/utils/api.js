// API utilities for communicating with the Express server
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:6112';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async loadInbox() {
    try {
      const response = await fetch(`${this.baseURL}/api/inbox`);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fetchMetadata(url) {
    try {
      const response = await fetch(`${this.baseURL}/api/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async processItem(action, item, context = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/process-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, item, context })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }


  async createNote(url, category, userContext) {
    try {
      const response = await fetch(`${this.baseURL}/api/create-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, category, userContext })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async previewNote(url, category, userContext) {
    try {
      const response = await fetch(`${this.baseURL}/api/preview-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, category, userContext })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNoteCategories() {
    try {
      const response = await fetch(`${this.baseURL}/api/note-categories`);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async openExternal(url) {
    // For web version, just open in new tab
    window.open(url, '_blank');
  }

  onInboxFileChanged(callback) {
    // Set up Server-Sent Events for real-time updates  
    const eventSource = new EventSource(`${this.baseURL}/events`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'inbox-changed') {
        callback();
      }
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }
}

// Create API client instance
const apiClient = new APIClient();

// Expose API similar to Electron's API
window.electronAPI = {
  loadInbox: () => apiClient.loadInbox(),
  fetchMetadata: (url) => apiClient.fetchMetadata(url),
  processItem: (action, item, context) => apiClient.processItem(action, item, context),
  createNote: (url, category, userContext) => apiClient.createNote(url, category, userContext),
  previewNote: (url, category, userContext) => apiClient.previewNote(url, category, userContext),
  getNoteCategories: () => apiClient.getNoteCategories(),
  openExternal: (url) => apiClient.openExternal(url),
  onInboxFileChanged: (callback) => apiClient.onInboxFileChanged(callback)
};

export default apiClient;