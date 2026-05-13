# CyberCheck Complete HTML & Booking Flow Architecture

## Overview
CyberCheck is a **multi-tenant SaaS platform** where each business type (restaurant, rental, photographer, salon, hotel) has a completely different dashboard and website, but they all share the same codebase and payment infrastructure.

---

## 1. SIGNUP FLOW

User signs up at `login.html`:
```
login.html
├─ Fields: email, password, business_name, business_type
├─ POST /api/auth/signup (via cc.js)
└─ Backend creates:
   ├─ Supabase Auth user
   ├─ businesses row
   ├─ users row (owner)
   └─ site_content row (empty)
│
└─ Response: { token, user, business: { site_id, name, type, subdomain } }
│
└─ Redirect via getDashboardUrl(business, type):
   ├─ If Circle Boats → beachside-circle-boats-dashboard.html
   └─ All others → app-dashboard.html
```

---

## 2. DASHBOARD INITIALIZATION (app-dashboard.html)

When dashboard loads:
```
app-dashboard.html initializes:

1. Session & Auth
   └─ CC.getSession() → { user, business }

2. Config Load
   └─ initConfig()
      ├─ USER_CONFIG.business_id
      ├─ USER_CONFIG.business_type (restaurant|rental|photographer|salon|hotel)
      ├─ USER_CONFIG.business_name
      └─ USER_CONFIG.plan

3. Nav Setup
   └─ setupNavForType(business_type)
      └─ Shows/hides nav items based on data-biz-type attributes
         ├─ Restaurant sees: Menu, QR Codes, Specials, Events
         ├─ Rental sees: Fleet, Availability, Bookings, Waivers
         ├─ Photographer sees: Portfolio, Bookings
         └─ Salon sees: Services, Appointments

4. Page Router
   └─ initRouter()
      └─ Enables page switching via navigateTo(pageName)

5. Module Loading (async)
   ├─ loadProfile()           [all types]
   ├─ loadMedia()             [all types]
   ├─ loadPages()             [all types]
   ├─ loadWebsiteContent()    [all types] ← TYPE-AWARE SECTIONS
   ├─ loadBookings()          [all types] ← INITIALIZES PAYMENT
   ├─ loadInventory()         [rental only]
   ├─ loadPortfolio()         [photographer only]
   ├─ loadServices()          [salon only]
   ├─ loadRooms()             [hotel only]
   ├─ loadMenu()              [restaurant only]
   ├─ loadSpecials()          [restaurant only]
   ├─ loadEvents()            [restaurant only]
   ├─ loadAvailability()      [rental/hotel]
   └─ ... 20+ other modules
```

---

## 3. WEBSITE BUILDER (website-content.js)

The business owner builds their public website in the dashboard:

### Section Selection (Type-Aware)
```javascript
// website-content.js → updateWebsiteSectionsForType()

Restaurant gets:
  ├─ Hero Section
  ├─ About
  ├─ Menu 🍽️
  ├─ Specials 🔥
  ├─ Events 🎉
  ├─ Booking & Payment 💳
  ├─ Gallery
  ├─ Reviews
  ├─ FAQ
  ├─ Contact
  └─ Footer

Rental gets:
  ├─ Hero
  ├─ About
  ├─ Fleet & Pricing 🚤
  ├─ Group Rates 👥
  ├─ Launch Docks 🛟
  ├─ Add-ons 🎁
  ├─ What's Included ✅
  ├─ Booking & Payment 💳
  ├─ Gallery
  ├─ Reviews
  ├─ FAQ
  ├─ Contact
  └─ Footer

Photographer gets:
  ├─ Hero
  ├─ About
  ├─ Portfolio 📸
  ├─ Services & Packages 💼
  ├─ Booking & Payment 💳
  ├─ Gallery
  ├─ Reviews
  ├─ FAQ
  ├─ Contact
  └─ Footer
```

### Section Editor
```
For each section:
├─ wcEdit(sectionId) → shows form
│  └─ Text fields, image uploads, feature lists
├─ wcSave(sectionId, data) → POST /api/site-data
│  └─ Database stores section data
└─ Real-time preview
   └─ wcRender(sectionId) shows what customer will see
```

### Generated HTML Example

**Restaurant Menu Section:**
```html
<div class="menu-section">
  <h2>Menu</h2>
  <div class="menu-categories">
    <div class="category">
      <h3>Appetizers</h3>
      <div class="menu-items">
        <div class="menu-item">
          <h4>Fish Tacos</h4>
          <p>Fresh caught daily</p>
          <span class="price">$12.99</span>
        </div>
        <div class="menu-item">
          <h4>Ceviche</h4>
          <p>Shrimp, lime, cilantro</p>
          <span class="price">$14.99</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Rental Fleet Section:**
```html
<div class="products-section">
  <h2>Our Fleet</h2>
  <div class="fleet-grid">
    <div class="boat-card">
      <img src="/boats/single-seater.jpg">
      <h3>Single Seater Circle Boat</h3>
      <p>Perfect for 1 rider. Max speed 25mph</p>
      <span class="price">$50/day</span>
      <button onclick="bookNow({item_id: 'boat-1'})">Book Now</button>
    </div>
    <div class="boat-card">
      <img src="/boats/dual-seater.jpg">
      <h3>Dual Seater Circle Boat</h3>
      <p>Perfect for 2 riders. Max speed 20mph</p>
      <span class="price">$80/day</span>
      <button onclick="bookNow({item_id: 'boat-2'})">Book Now</button>
    </div>
  </div>
</div>
```

**Photographer Portfolio Section:**
```html
<div class="portfolio-section">
  <h2>Portfolio</h2>
  <div class="portfolio-grid">
    <div class="portfolio-item">
      <img src="/portfolio/wedding-1.jpg">
      <p>Beach Wedding - Gulf Shores</p>
    </div>
    <div class="portfolio-item">
      <img src="/portfolio/engagement-1.jpg">
      <p>Engagement Session - Orange Beach</p>
    </div>
  </div>
</div>
```

---

## 4. PUBLIC WEBSITE GENERATION

When site editor publishes, the website sections are compiled into a static/dynamic page:

### URL Structure
```
https://{subdomain}.cybercheck.com/           ← Home (all sections)
https://{subdomain}.cybercheck.com/menu        ← Menu [restaurant]
https://{subdomain}.cybercheck.com/specials    ← Specials [restaurant]
https://{subdomain}.cybercheck.com/fleet       ← Fleet [rental]
https://{subdomain}.cybercheck.com/portfolio   ← Portfolio [photographer]
https://{subdomain}.cybercheck.com/booking     ← Booking Form [all]
https://{subdomain}.cybercheck.com/checkout    ← Payment [all]
```

---

## 5. BOOKING FLOW (Critical)

### Step 1: Customer Clicks "Book Now"
```
Public website displays button: "Book Now"
└─ onclick="navigateTo('/booking')"
```

### Step 2: Booking Form Page
```
/booking page (type-specific form)

Restaurant:
├─ Date selector
├─ Time selector
├─ Party size
└─ Special requests

Rental:
├─ Start date
├─ End date
├─ Item selection (boat, jet ski, etc.)
├─ Add-ons selection
└─ Special requests

Photographer:
├─ Event date
├─ Package selection (engagement, wedding, etc.)
├─ Hours
└─ Custom requests

Salon:
├─ Service selection
├─ Staff selection (optional)
├─ Preferred date/time
└─ Notes

Validation:
├─ Check dates are available
├─ Check inventory exists
├─ Calculate total price
└─ If valid → "Continue to Payment"
└─ If invalid → Show error
```

### Step 3: Booking Form Submission
```javascript
// booking-form.html onSubmit
const booking = {
  business_id: site_id,
  business_type: type,
  customer_email: form.email.value,
  customer_phone: form.phone.value,
  booking_date: form.date.value,
  items: form.items.value,  // varies by type
  addons: form.addons.value,
  special_requests: form.notes.value,
  subtotal: calculateSubtotal(),
  tax: calculateTax(),
  total: calculateTotal(),
  status: 'pending_payment'
}

// Store in session
sessionStorage.setItem('current_booking', JSON.stringify(booking))

// Redirect to checkout
window.location.href = '/checkout'
```

### Step 4: Payment/Checkout Page
```
/checkout page (payment-processor.js)

Display:
├─ Booking summary
│  ├─ Items
│  ├─ Add-ons
│  ├─ Subtotal
│  ├─ Tax
│  └─ Total
│
├─ Contact info section
│  ├─ Email
│  └─ Phone
│
└─ Payment form (initialized per business config)
   ├─ Get payment provider: USER_CONFIG.payment_provider
   │  ├─ 'stripe' → Initialize StripeProcessor
   │  ├─ 'square' → Initialize SquareProcessor
   │  └─ 'paypal' → Initialize PayPalProcessor
   │
   └─ Render payment UI
      ├─ Stripe: Stripe Elements card form
      ├─ Square: Square Web Payments SDK form
      └─ PayPal: PayPal buttons
```

### Step 5: Payment Processing (THE KEY MODULAR PART)
```javascript
// checkout.html onSubmit

async function submitPayment() {
  const amount = booking.total * 100  // cents
  const token = await PaymentProcessor.createToken(cardElement)
  
  const result = await PaymentProcessor.charge(amount, token, {
    booking_id: booking.id,
    customer_email: booking.customer_email,
    items: booking.items,
    business_type: booking.business_type,
    business_id: booking.business_id
  })
  
  if (result.success) {
    // Success flow
    window.location.href = `/booking-confirmation?id=${result.booking_id}`
  } else {
    // Error flow
    showError(result.error)
  }
}
```

### Payment Processor Abstraction
```javascript
// js/payment-processor.js

PaymentProcessor.register('stripe', StripeProcessor)
PaymentProcessor.register('square', SquareProcessor)
PaymentProcessor.register('paypal', PayPalProcessor)

// Business owner selects in dashboard connections:
// "Use Stripe" → PaymentProcessor.setProcessor('stripe')
// "Use Square" → PaymentProcessor.setProcessor('square')

// Same checkout.html code works for all!
```

### Step 6: Backend Payment Processing
```
POST /api/payment/charge
Body: {
  amount: 9999,
  token: "tok_stripe_...",
  provider: "stripe",
  booking_id: "uuid",
  customer_email: "customer@email.com",
  items: [...],
  business_type: "restaurant"
}

Backend:
├─ Switch on provider:
│  ├─ 'stripe': Use Stripe SDK to charge token
│  ├─ 'square': Use Square SDK to charge nonce
│  └─ 'paypal': Use PayPal SDK
│
├─ If charge successful:
│  ├─ Create booking record in database
│  ├─ Update inventory/availability if needed
│  ├─ Send confirmation email to customer
│  ├─ Send alert to business owner (SMS/email/dashboard)
│  └─ Return { success: true, booking_id, charge_id }
│
└─ If charge fails:
   └─ Return { success: false, error: "Declined" }
```

### Step 7: Confirmation Page
```
/booking-confirmation?id={booking_id}

Display:
├─ "Thank you for your booking!"
├─ Booking details
│  ├─ Confirmation #
│  ├─ Date/time
│  ├─ Items
│  └─ Total paid
├─ Next steps
│  ├─ Confirmation email sent to: {customer_email}
│  ├─ Business will contact you at: {customer_phone}
│  └─ Check your email for details
└─ Button: "Return to website"
```

---

## 6. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    app-dashboard.html                       │
│  (Shows type-specific modules based on business_type)       │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─→ loadProfile()       ──→ POST /api/profile
         ├─→ loadWebsiteContent() ──→ POST /api/site-data  ←───┐
         ├─→ loadBookings()      ──→ POST /api/bookings        │
         ├─→ loadInventory()     ──→ POST /api/inventory       │
         ├─→ loadMenu()          ──→ POST /api/menu            │
         ├─→ loadPortfolio()     ──→ POST /api/portfolio       │
         └─→ loadServices()      ──→ POST /api/services        │
                                                                 │
         Data saved in Supabase ────────────────────────────────┤
                                                                 │
         Used to render public website ←──────────────────────┘
         ├─ https://{subdomain}/
         ├─ https://{subdomain}/menu
         ├─ https://{subdomain}/booking    ← Links to /checkout
         └─ https://{subdomain}/checkout   ← Calls PaymentProcessor

    PaymentProcessor
    ├─ StripeProcessor   → /api/payment/charge (stripe SDK)
    ├─ SquareProcessor   → /api/payment/charge (square SDK)
    └─ PayPalProcessor   → /api/payment/charge (paypal SDK)
            │
            ├─→ Create booking record
            ├─→ Send confirmation email
            └─→ Alert business owner
```

---

## 7. FILE MANIFEST

### Core Pages
- `login.html` — Signup/login form
- `app-dashboard.html` — Main dashboard (all types except Circle Boats)
- `beachside-circle-boats-dashboard.html` — Circle Boats specific dashboard
- `booking.html` — Type-specific booking form (public)
- `checkout.html` — Type-agnostic payment form (public)
- `booking-confirmation.html` — Confirmation page (public)

### JavaScript Modules
- `js/router.js` — Page navigation, setupNavForType()
- `js/cc.js` — Core auth, session management
- `js/config.js` — USER_CONFIG loading, initConfig()
- `js/payment-processor.js` — Payment abstraction (Stripe/Square/PayPal)
- `js/website-content.js` — Website builder (type-aware sections)
- `js/bookings.js` — Booking dashboard
- `js/profile.js` — Business profile editor
- `js/inventory.js` — Fleet management [rental]
- `js/portfolio.js` — Portfolio [photographer]
- `js/services.js` — Services [salon]
- `js/rooms.js` — Rooms [hotel]
- `js/menu.js` — Menu management [restaurant]
- `js/specials.js` — Specials [restaurant]
- `js/events.js` — Events [restaurant]
- `js/qr-codes.js` — QR generation [all]
- `js/availability.js` — Calendar [rental/hotel]
- And 20+ more...

---

## 8. KEY ARCHITECTURAL DECISIONS

### 1. Type-Based Navigation
- Each business type sees different nav items
- Controlled by `data-biz-type` attributes
- Applied via `setupNavForType(type)`

### 2. Type-Aware Website Builder
- `website-content.js` generates different sections per type
- Restaurant gets menu/specials/events
- Rental gets fleet/addons/docks
- Photographer gets portfolio/services
- All can have booking/payment

### 3. Modular Payment Processing
- `PaymentProcessor` abstracts payment provider
- Stripe, Square, PayPal plugins
- Same checkout.html for all businesses
- Easy to add more processors

### 4. Shared Database Tables
- `businesses` — One per signup
- `site_content` — Website builder data
- `bookings` — All types use same table (type field identifies)
- `payments` — All types use same table (provider field identifies)

### 5. Booking as Type-Agnostic Core
- Form changes per type (restaurant date/time vs rental start/end)
- Payment always uses same PaymentProcessor
- Confirmation always same template
- Backend routes by business_type for specifics

---

## 9. WHAT'S MISSING / FUTURE

- [ ] Type-specific booking form generation (currently static)
- [ ] Automated website page generation (publish.js integration)
- [ ] Webhook handlers for payment processor events
- [ ] Notification system (email/SMS on booking)
- [ ] Analytics dashboard per business type
- [ ] Inventory sync for rentals (real-time availability)
- [ ] Staff scheduling for salons
- [ ] Recurring bookings
- [ ] Multi-location support
