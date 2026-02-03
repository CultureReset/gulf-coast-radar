/**
 * CyberCheck - Shared API Helper
 * Handles all API requests with authentication
 */

import { getToken, clearSession } from './auth.js';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Make an authenticated API request
 * @param {string} path - API endpoint path (e.g., '/contacts')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response data
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    // Handle 401 - redirect to login
    if (res.status === 401) {
      clearSession();
      window.location.href = '/frontend/login.html';
      throw new Error('Unauthorized');
    }

    // Parse JSON response
    const data = await res.json().catch(() => ({}));

    // Handle errors
    if (!res.ok) {
      const message = data?.error || data?.message || `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data;

  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */

export async function apiGet(path, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${path}?${queryString}` : path;
  return apiFetch(url, { method: 'GET' });
}

export async function apiPost(path, body = {}) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function apiPut(path, body = {}) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

export async function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}

/**
 * Upload file with progress tracking
 * @param {string} path - API endpoint
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<any>} API response
 */
export async function apiUpload(path, file, onProgress = null) {
  const token = getToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 401) {
        clearSession();
        window.location.href = '/frontend/login.html';
        reject(new Error('Unauthorized'));
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || data.message || 'Upload failed'));
        }
      } catch (err) {
        reject(err);
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    xhr.open('POST', url);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}
