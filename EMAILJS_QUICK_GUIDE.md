# Quick Guide: How to Get EmailJS Template IDs

## Step-by-Step Visual Guide

### 1. Log in to EmailJS
- Go to https://www.emailjs.com/
- Sign in to your account

### 2. Navigate to Email Templates
- In the left sidebar, click **"Email Templates"**
- You'll see a list of your templates (empty if you haven't created any)

### 3. Create Your First Template (Clinic Notification)

**Click "Create New Template" button**

Fill in:
- **Template Name**: `Ivory Clinic Notification` (any name you want)
- **Template ID**: EmailJS will auto-generate this (e.g., `template_abc123`) 
  - ⚠️ **COPY THIS ID** - This is your `TEMPLATE_ID_CLINIC`
- **Subject**: `New Appointment Request - {{name}}`
- **Content**: 
  - Switch to HTML mode (if available)
  - Copy the entire content from `assets/email/templates/IvoryAppointment.html`
  - Paste it into the content area
- **To Email**: Your clinic email (e.g., `ivoryskinclinicbydrsharmila@gmail.com`)
- **From Name**: `Ivory Skin Clinic`
- **From Email**: Your connected email service address

**Click "Save"**

### 4. Create Your Second Template (User Confirmation)

**Click "Create New Template" again**

Fill in:
- **Template Name**: `Ivory User Confirmation` (any name you want)
- **Template ID**: EmailJS will auto-generate this (e.g., `template_xyz789`)
  - ⚠️ **COPY THIS ID** - This is your `TEMPLATE_ID_USER`
- **Subject**: `Appointment Confirmation - Ivory Skin Clinic`
- **Content**: 
  - Copy the entire content from `assets/email/templates/IvoryAppointmentReply.html`
  - Paste it into the content area
- **To Email**: `{{email}}` (this uses the user's email from the form)
- **From Name**: `Ivory Skin Clinic`
- **From Email**: Your connected email service address
- **Reply To**: Your clinic email address

**Click "Save"**

### 5. Where to Find Template IDs

**Option 1: In Template Editor**
- When you open a template, the Template ID is shown at the top
- It looks like: `template_abc123xyz` or `ivory_appointment_clinic`

**Option 2: In Templates List**
- Go to Email Templates page
- Each template shows its ID below the template name
- Click on the ID to copy it

**Option 3: Template Settings**
- Open a template
- Click on template settings/info
- Template ID will be displayed there

### 6. Update Your script.js

Open `script.js` and find this section (around line 621):

```javascript
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
  SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
  TEMPLATE_ID_CLINIC: "YOUR_TEMPLATE_ID_CLINIC",  // ← Paste clinic template ID here
  TEMPLATE_ID_USER: "YOUR_TEMPLATE_ID_USER"       // ← Paste user template ID here
};
```

Replace:
- `YOUR_TEMPLATE_ID_CLINIC` with the Template ID from Step 3
- `YOUR_TEMPLATE_ID_USER` with the Template ID from Step 4

**Example:**
```javascript
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "abc123xyz",
  SERVICE_ID: "service_gmail123",
  TEMPLATE_ID_CLINIC: "template_clinic456",  // Your clinic template ID
  TEMPLATE_ID_USER: "template_user789"       // Your user template ID
};
```

## Important Notes

- ✅ Template IDs are **case-sensitive** - copy them exactly
- ✅ Template IDs can be changed - you can edit them in EmailJS dashboard
- ✅ You can use custom IDs like `ivory_clinic` or `ivory_user` if you prefer
- ✅ Make sure the template variables match: `{{name}}`, `{{email}}`, etc.

## Testing

After updating the IDs:
1. Fill out the appointment form
2. Submit it
3. Check both email inboxes (clinic + user)
4. Check browser console for any errors

## Need Help?

- EmailJS Documentation: https://www.emailjs.com/docs/
- Template Variables: Make sure all `{{variable}}` names match between your template and code
- Check EmailJS dashboard → Logs to see if emails were sent successfully
