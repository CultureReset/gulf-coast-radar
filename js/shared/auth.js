/**
 * CyberCheck - Shared Authentication Helper
 * Handles JWT token storage and session management
 */

export const TOKEN_KEY = 'cybercheck_token';
export const USER_KEY = 'cybercheck_user';
export const BUSINESS_KEY = 'cybercheck_business';

/**
 * Save session data to localStorage
 */
export function saveSession({ token, user, business }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
}

/**
 * Get JWT token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get user data from localStorage
 */
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get business data from localStorage
 */
export function getBusiness() {
  const businessStr = localStorage.getItem(BUSINESS_KEY);
  return businessStr ? JSON.parse(businessStr) : null;
}

/**
 * Clear session data from localStorage
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(BUSINESS_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth() {
  const token = getToken();
  if (!token) {
    // Save current URL to redirect back after login
    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    window.location.href = '/frontend/login.html';
    return false;
  }
  return true;
}

/**
 * Redirect to dashboard after login
 */
export function redirectAfterLogin() {
  const redirect = sessionStorage.getItem('redirect_after_login');
  sessionStorage.removeItem('redirect_after_login');
  window.location.href = redirect || '/pages/dashboard/overview.html';
}

/**
 * Logout user and redirect to login
 */
export function logout() {
  clearSession();
  window.location.href = '/frontend/login.html';
}
