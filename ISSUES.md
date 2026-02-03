# Known Issues & Cleanup Tasks

This document tracks bugs, cleanup tasks, and improvements needed before production deployment.

## Critical Issues

### 1. Hardcoded Localhost URLs
**Status:** ⚠️ Needs Fix
**Priority:** HIGH
**Description:** Many files have hardcoded `http://localhost` URLs that need to be replaced with environment-aware configuration.

**Files Affected:**
- `js/business-loader.js` - Line with `http://localhost:3002`
- `js/things-to-do.js` - `API_URL` constant
- `js/social-feed-api.js` - `API_BASE_URL` constant
- `js/auth.js` - `API_BASE_URL` constant
- `js/ai-backend.js` - Backend URL
- `admin-dashboard.html` - `GCR_API_URL` constant

**Solution:**
Replace all hardcoded URLs with `CONFIG.getApiUrl()` from `js/config.js`:
```javascript
// Before:
const API_URL = 'http://localhost:3002/api';

// After:
const API_URL = CONFIG.getApiUrl('gcr');
```

### 2. Missing API Keys Configuration
**Status:** ⚠️ Needs Setup
**Priority:** HIGH
**Description:** API keys need to be configured for production.

**Required Keys:**
- Google Maps API key (in `js/config.js`)
- AI service keys (in `js/ai-config.js`)
- Google Sheets API (in `js/google-sheets-config.js`)

**Action:** Update configuration files with production keys before deployment.

### 3. Backend API Not Included
**Status:** 📋 Documentation
**Priority:** MEDIUM
**Description:** The repository includes frontend code but backend API code may need to be added.

**Action:**
- Add backend code to `/backend` folder, OR
- Document external backend deployment separately

## Security Issues

### 4. Client-Side Password Hashing
**Status:** ⚠️ Security Risk
**Priority:** HIGH
**Description:** Admin authentication uses simple client-side password hashing which is not secure for production.

**File:** `js/admin-auth.js`

**Current Implementation:**
- Simple character-code-based hash
- Stored in localStorage
- No salt, no proper hashing algorithm

**Recommended Fix:**
Replace with proper authentication:
- Server-side authentication with JWT tokens
- Use bcrypt or similar for password hashing
- Move authentication logic to backend
- Implement rate limiting for login attempts

### 5. No HTTPS Enforcement
**Status:** ⚠️ Needs Implementation
**Priority:** HIGH
**Description:** No HTTPS redirect or enforcement.

**Action:** Add HTTPS redirect in production:
```javascript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## Data Issues

### 6. Missing Data Validation
**Status:** ⚠️ Needs Implementation
**Priority:** MEDIUM
**Description:** Form inputs in admin dashboard lack proper validation.

**Areas Needing Validation:**
- Email addresses
- Phone numbers (format)
- URLs (image URLs, website URLs)
- Date/time inputs
- Price formatting

**Example Fix:**
```javascript
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 7. Happy Hour Data Inconsistency
**Status:** ✅ Template Created
**Priority:** LOW
**Description:** Some restaurants may still use old happy hour format.

**Action:**
- Review all restaurant happy hour data
- Ensure compliance with `backend/HAPPY_HOUR_TEMPLATE.md`
- Run migration script if needed

## UI/UX Issues

### 8. Mobile Responsiveness
**Status:** ⚠️ Needs Testing
**Priority:** MEDIUM
**Description:** Some pages may need mobile optimization testing.

**Pages to Test:**
- Admin dashboard (complex layout)
- Profile pages
- Search results
- Events calendar

**Action:** Test on various mobile devices and adjust CSS breakpoints.

### 9. Loading States
**Status:** ⚠️ Inconsistent
**Priority:** LOW
**Description:** Some pages lack loading indicators when fetching data.

**Files to Update:**
- `js/business-loader.js` - Add skeleton loaders
- `js/feed.js` - Improve loading animation
- All pages fetching from API

### 10. Error Messages
**Status:** ⚠️ User-Facing
**Priority:** MEDIUM
**Description:** Some error messages show technical details to users.

**Example:**
```javascript
// Bad:
alert('Error: ' + error.message);

// Good:
alert('Unable to load businesses. Please try again later.');
console.error('Business load error:', error);
```

## Performance Issues

### 11. Image Optimization
**Status:** ⚠️ Needs Implementation
**Priority:** MEDIUM
**Description:** Business images are not optimized or lazy-loaded.

**Actions:**
- Implement lazy loading for images
- Add image size recommendations in admin dashboard
- Consider CDN for image hosting
- Use responsive images with srcset

### 12. Large Bundle Size
**Status:** ⚠️ Needs Optimization
**Priority:** LOW
**Description:** Multiple JavaScript files loaded on each page.

**Actions:**
- Implement module bundling (webpack/rollup)
- Code splitting for admin dashboard
- Minify JavaScript and CSS for production
- Remove unused code

### 13. API Rate Limiting
**Status:** ❓ Unknown
**Priority:** MEDIUM
**Description:** No client-side rate limiting or request caching.

**Actions:**
- Implement request caching
- Add rate limiting for API calls
- Use localStorage for caching business data

## Code Quality Issues

### 14. Console Errors and Warnings
**Status:** ⚠️ Cleanup Needed
**Priority:** LOW
**Description:** Some console errors may appear during development.

**Action:** Review browser console on all pages and fix errors.

### 15. TODO Comments
**Status:** ℹ️ Documentation
**Priority:** LOW
**Description:** Code contains TODO comments that need attention.

**Action:** Search for `TODO`, `FIXME`, `HACK` comments and address them.

### 16. Duplicate Code
**Status:** ⚠️ Refactor Needed
**Priority:** LOW
**Description:** Some utility functions are duplicated across files.

**Examples:**
- Date formatting
- Price formatting
- Distance calculations

**Action:** Create shared utilities file (`js/utils.js`).

## Missing Features

### 17. Analytics Integration
**Status:** 📋 Not Implemented
**Priority:** MEDIUM
**Description:** No analytics tracking for user behavior.

**Recommended:**
- Google Analytics 4
- Event tracking for key actions
- Conversion tracking

### 18. SEO Optimization
**Status:** ⚠️ Needs Implementation
**Priority:** MEDIUM
**Description:** Meta tags and SEO optimization incomplete.

**Actions:**
- Add proper meta descriptions
- Implement Open Graph tags
- Add structured data (Schema.org)
- Create sitemap.xml
- Add robots.txt

### 19. Accessibility (A11y)
**Status:** ⚠️ Needs Audit
**Priority:** MEDIUM
**Description:** Accessibility features need review.

**Actions:**
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Check color contrast ratios

### 20. Error Logging
**Status:** 📋 Not Implemented
**Priority:** LOW
**Description:** No centralized error logging for production.

**Recommended Services:**
- Sentry
- LogRocket
- Rollbar

## Testing Needed

### 21. Browser Compatibility
**Status:** ❓ Needs Testing
**Priority:** MEDIUM
**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### 22. Admin Dashboard Testing
**Status:** ⚠️ Needs Testing
**Priority:** HIGH
**Test Cases:**
- Login/logout flow
- Business CRUD operations
- Menu editing (add/edit/delete items)
- Happy hour editing
- Specials editing
- Events editing
- Live feed posts editing
- CSV bulk upload
- Image URL validation

### 23. API Error Handling
**Status:** ❓ Needs Testing
**Priority:** HIGH
**Scenarios:**
- API server down
- Network timeout
- Invalid responses
- Rate limiting
- Authentication failures

## Documentation Needed

### 24. API Documentation
**Status:** 📋 Incomplete
**Priority:** MEDIUM
**Action:** Document all API endpoints with request/response examples.

### 25. Deployment Guide
**Status:** 📋 Incomplete
**Priority:** HIGH
**Action:** Create step-by-step deployment guide for production.

### 26. Database Schema
**Status:** 📋 Incomplete
**Priority:** MEDIUM
**Action:** Document complete database schema with relationships.

## Pre-Launch Checklist

Before deploying to production, complete these tasks:

- [ ] Replace all localhost URLs with production URLs
- [ ] Configure all API keys
- [ ] Implement proper server-side authentication
- [ ] Enable HTTPS and enforce it
- [ ] Add form validation throughout admin dashboard
- [ ] Test mobile responsiveness on all pages
- [ ] Optimize and lazy-load images
- [ ] Minify JavaScript and CSS
- [ ] Add analytics tracking
- [ ] Implement SEO optimization
- [ ] Test in all major browsers
- [ ] Add error logging service
- [ ] Review and fix all console errors
- [ ] Test admin dashboard thoroughly
- [ ] Set up CDN for static assets
- [ ] Configure CORS properly on backend
- [ ] Add rate limiting to API
- [ ] Create backup strategy for database
- [ ] Set up monitoring and alerts
- [ ] Document deployment process
- [ ] Test disaster recovery

## Summary

**Total Issues:** 26
- 🔴 Critical: 3
- 🟡 High Priority: 8
- 🟢 Medium Priority: 10
- ⚪ Low Priority: 5

**Status Overview:**
- ✅ Completed: 1
- ⚠️ Needs Action: 17
- 📋 Not Started: 5
- ❓ Needs Testing: 3
