# 📧 Lead Email Notifications Setup

## ✅ What I Added:

**Automatic email notifications to:** `cybercheckinc@gmail.com`

Every form submission now:
1. ✅ Saves to dashboard (Leads tab)
2. ✅ Sends email notification to cybercheckinc@gmail.com

---

## 🔧 Setup Required (Backend):

You need to add an email endpoint to your backend at `localhost:3002`.

### Option 1: Add to Your Backend (Recommended)

**File:** `backend/routes/leads.js` (or similar)

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-gmail@gmail.com', // Your sending email
    pass: 'your-app-password'      // Gmail app password
  }
});

// POST /api/leads/notify
router.post('/notify', async (req, res) => {
  try {
    const { to, subject, body, leadData } = req.body;

    const mailOptions = {
      from: 'your-gmail@gmail.com',
      to: to || 'cybercheckinc@gmail.com',
      subject: subject,
      text: body,
      html: `<pre>${body}</pre>`
    };

    await transporter.sendMail(mailOptions);

    console.log(`Lead email sent to ${to}`);
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**Install nodemailer:**
```bash
cd your-backend-folder
npm install nodemailer
```

**Add to your main server file:**
```javascript
const leadsRouter = require('./routes/leads');
app.use('/api/leads', leadsRouter);
```

---

### Option 2: Use Free EmailJS (No Backend Changes)

**Easier alternative - no backend coding needed!**

1. **Sign up:** https://www.emailjs.com/ (FREE)
2. **Get credentials:**
   - Service ID
   - Template ID
   - Public Key

3. **Update forms to use EmailJS:**

Add to your HTML pages with forms:
```html
<script src="https://cdn.emailjs.com/dist/email.min.js"></script>
<script>
  emailjs.init('YOUR_PUBLIC_KEY');

  // When form submits
  function sendLeadEmail(leadData) {
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      to_email: 'cybercheckinc@gmail.com',
      from_name: leadData.name,
      from_email: leadData.email,
      from_phone: leadData.phone,
      message: leadData.message,
      business: leadData.businessName
    });
  }
</script>
```

---

## 📋 Current Status:

### ✅ Working Now:
- Leads save to dashboard (localStorage)
- Lead emailer script created (`js/lead-emailer.js`)
- Dashboard shows all leads

### ⚠️ Needs Setup:
- Backend email endpoint (Option 1) OR
- EmailJS account (Option 2)

---

## 🧪 Testing:

### Test Lead Submission:
1. Fill out any form on your site (loyalty signup, reservation, etc.)
2. Check admin dashboard → Leads tab
3. ✅ Lead should appear
4. ✅ Email should send to cybercheckinc@gmail.com (after setup)

---

## 🚀 Quick Start (Recommended):

**Use EmailJS (5 minutes):**

1. Go to: https://www.emailjs.com/
2. Sign up (free)
3. Create email service
4. Create email template
5. Get your keys
6. I'll integrate it for you!

**Just give me the keys and I'll add them!**

---

## 📞 Summary:

**What works:**
- ✅ Forms save leads to dashboard
- ✅ Lead emailer code ready

**What you need:**
- ⚠️ Choose Option 1 (backend) or Option 2 (EmailJS)
- ⚠️ Add email sending capability

**Email destination:** cybercheckinc@gmail.com ✅

---

Let me know which option you prefer and I'll help set it up! 🚀
