# Gulf Coast Radar (GCR)

A comprehensive directory and social platform for businesses across Orange Beach, Gulf Shores, and Perdido Key.

## Features

- **Business Directory** - Browse restaurants, activities, coffee shops, and more
- **Happy Hours** - Find daily happy hour deals across the Gulf Coast
- **Specials & Events** - Stay updated on daily specials and live events
- **Live Feed** - Real-time social media posts from local businesses
- **AI Assistant** - Get personalized recommendations and answers
- **Admin Dashboard** - Manage businesses, menus, specials, events, and more

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js API (Supabase integration)
- **Database**: Supabase (PostgreSQL)
- **Social Integration**: CyberCheck API for Instagram/Facebook feeds
- **Authentication**: Client-side session-based auth

## Getting Started

### Prerequisites

- Node.js 16+ (for backend API)
- Modern web browser
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gcr-new
   ```

2. **Set up configuration**
   - Copy `js/ai-config.example.js` to `js/ai-config.js` and add your API keys
   - Update `js/config.js` with your production API URLs

3. **Set up backend API**
   - Follow instructions in `/backend` folder (if included)
   - Or deploy your own Supabase backend

4. **Run locally**
   ```bash
   # Simple HTTP server
   python3 -m http.server 8000
   # Or use any static file server
   ```

5. **Access the app**
   - Frontend: `http://localhost:8000`
   - Admin Dashboard: `http://localhost:8000/admin-login.html`

### Admin Dashboard Access

First time setup:
1. Visit `http://localhost:8000/admin-login.html`
2. Create your admin password (minimum 6 characters)
3. Login to access the dashboard

Features:
- Manage business listings
- Edit menus, drinks, happy hours
- Add/edit specials and events
- Manage live feed posts
- Bulk upload via CSV

## Project Structure

```
gcr-new/
├── index.html              # Homepage
├── restaurants.html        # Restaurant listings
├── happy-hours.html        # Happy hour deals
├── specials.html          # Daily specials
├── events.html            # Events calendar
├── feed.html              # Live social feed
├── profile.html           # Business profile page
├── admin-login.html       # Admin login
├── admin-dashboard.html   # Admin dashboard
├── css/                   # Stylesheets
├── js/                    # JavaScript modules
│   ├── config.js         # Central configuration
│   ├── admin-auth.js     # Authentication system
│   ├── business-loader.js # Business data loading
│   ├── feed.js           # Social feed display
│   └── ...               # Other modules
├── data/                  # Static data files
└── assets/               # Images, icons, etc.
```

## Configuration

### API Endpoints

Update `js/config.js` with your production URLs:

```javascript
API: {
  GCR_BASE_URL: 'https://api.gulfcoastradar.com/api',
  CYBERCHECK_URL: 'https://cybercheckinc.com',
  SOCIAL_FEED_URL: 'https://api.gulfcoastradar.com/social',
}
```

### Environment Variables

For sensitive data, use environment-specific config files:
- `js/ai-config.js` - AI API keys (gitignored)
- `js/google-sheets-config.js` - Google API keys (gitignored)

## Development

### Running Backend API

```bash
cd backend
npm install
npm start
# API will run on http://localhost:3002
```

### Database Setup

The project uses Supabase with the following tables:
- `gcr_businesses` - Business listings
- Additional tables defined in `/backend/schema.sql`

### Happy Hour Data Format

Follow the standard format in `backend/HAPPY_HOUR_TEMPLATE.md`:

```json
{
  "title": "Happy Hour",
  "days": "Daily 3 PM–6 PM",
  "items": [
    {
      "name": "Item Name",
      "description": "Full description",
      "regular_price": "$X.XX",
      "happy_hour_price": "$Y.YY"
    }
  ]
}
```

## Deployment

### Frontend Deployment

Deploy to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend Deployment

Deploy Node.js API to:
- Heroku
- Railway
- Render
- AWS Elastic Beanstalk

### Environment Setup

1. Update production API URLs in `js/config.js`
2. Set up CORS on your backend API
3. Configure Supabase connection strings
4. Add API keys for Google Maps, AI services

## API Documentation

### Main Endpoints

```
GET  /api/businesses           - Get all businesses
GET  /api/businesses/:id       - Get single business
POST /api/businesses           - Create business (admin)
PATCH /api/businesses/:id      - Update business (admin)

GET  /api/admin/businesses     - Admin view with full data
POST /api/bulk-events          - Bulk event upload
```

### Business Data Structure

See admin dashboard for complete schema including:
- Basic info (name, category, address, phone)
- Menu items
- Drinks
- Happy hour items
- Specials
- Events
- Feed posts

## Features Roadmap

- [x] Business directory
- [x] Happy hours page
- [x] Specials & events
- [x] Admin dashboard
- [x] Live feed integration
- [x] AI assistant
- [ ] SMS loyalty program
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-location support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Support

For support, email: support@gulfcoastradar.com

## Acknowledgments

- Built with love for the Gulf Coast community
- Special thanks to all participating local businesses
- Powered by CyberCheck social media integration
# cybercheck-links-
