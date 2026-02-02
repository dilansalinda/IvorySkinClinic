# EmailJS Setup Instructions

## Configuration Steps

1. **Sign up for EmailJS** (if you haven't already)
   - Go to https://www.emailjs.com/
   - Create a free account

2. **Get your Public Key**
   - Go to EmailJS Dashboard → Account → General
   - Copy your Public Key

3. **Create Email Service**
   - Go to EmailJS Dashboard → Email Services
   - Add a new service (Gmail, Outlook, etc.)
   - Copy the Service ID

4. **Create Email Templates**

   **Step 4a: Create Template 1 - Clinic Notification**
   
   1. Go to EmailJS Dashboard → **Email Templates** (left sidebar)
   2. Click **"Create New Template"** button
   3. Fill in the template details:
      - **Template Name**: `Ivory Appointment Clinic` (or any name you prefer)
      - **Template ID**: This will be auto-generated (e.g., `template_abc123`) - **COPY THIS ID** - this is your `TEMPLATE_ID_CLINIC`
      - **Subject**: `New Appointment Request - {{name}}`
      - **Content**: Copy and paste the HTML from `assets/email/templates/IvoryAppointment.html`
   4. Set the **To Email**: Your clinic email address (e.g., `ivoryskinclinicbydrsharmila@gmail.com`)
   5. Set the **From Name**: `Ivory Skin Clinic`
   6. Click **"Save"**
   
   **Step 4b: Create Template 2 - User Confirmation**
   
   1. Click **"Create New Template"** again
   2. Fill in the template details:
      - **Template Name**: `Ivory Appointment User` (or any name you prefer)
      - **Template ID**: This will be auto-generated (e.g., `template_xyz789`) - **COPY THIS ID** - this is your `TEMPLATE_ID_USER`
      - **Subject**: `Appointment Confirmation - Ivory Skin Clinic`
      - **Content**: Copy and paste the HTML from `assets/email/templates/IvoryAppointmentReply.html`
   3. Set the **To Email**: `{{email}}` (this will use the user's email from the form)
   4. Set the **From Name**: `Ivory Skin Clinic`
   5. Set the **Reply To**: Your clinic email address
   6. Click **"Save"**

   **Important Variables to Use:**
   
   Template 1 (Clinic) uses: `{{name}}`, `{{email}}`, `{{phone}}`, `{{service}}`, `{{date}}`, `{{time}}`, `{{message}}`
   
   Template 2 (User) uses: `{{name}}`, `{{email}}`, `{{service}}`, `{{date}}`, `{{time}}`

   **How to Find Template IDs:**
   - After creating each template, you'll see the Template ID displayed at the top of the template editor
   - It looks like: `template_abc123xyz` or `ivory_appointment_clinic`
   - You can also find it in the Templates list - it's shown under each template name
   - **Copy these IDs exactly** - they are case-sensitive!

5. **Update Configuration in script.js**
   - Open `script.js`
   - Find the `EMAILJS_CONFIG` object (around line 620)
   - Replace the placeholder values:
     ```javascript
     const EMAILJS_CONFIG = {
       PUBLIC_KEY: "your-actual-public-key-here",
       SERVICE_ID: "your-service-id-here",
       TEMPLATE_ID_CLINIC: "your-clinic-template-id",
       TEMPLATE_ID_USER: "your-user-template-id"
     };
     ```

## Testing

1. Fill out the appointment form on your website
2. Click "Submit Request"
3. Check:
   - Clinic email inbox (should receive notification)
   - User email inbox (should receive confirmation)
   - Browser console (check for any errors)

## Troubleshooting

- If emails don't send, check browser console for errors
- Verify all keys are correct in `EMAILJS_CONFIG`
- Ensure template IDs match exactly (case-sensitive)
- Check EmailJS dashboard for delivery status
- Verify email service is properly connected in EmailJS

## Notes

- The form will still show success message even if EmailJS is not configured (for development)
- Both emails are sent simultaneously (clinic notification + user confirmation)
- Form validation happens before email sending
- Submit button is disabled during email sending to prevent double submissions
