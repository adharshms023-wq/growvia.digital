# Google Sheets Inquiry Integration Setup

This guide walks you through connecting your website's **"Send Inquiry"** form directly to a **Google Sheet**. It takes about **2 minutes** and requires no paid services or servers.

---

## Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Title it something clear, for example: `Growvia Website Inquiries`.
3. *(Optional)* Rename the bottom tab to `Inquiries`.

---

## Step 2: Open Google Apps Script
1. In your Google Sheet, click **Extensions** in the top navigation bar.
2. Click **Apps Script**.
3. A new tab opens with an editor showing a `Code.gs` file.

---

## Step 3: Paste the Script Code
1. In the Apps Script editor, **delete all default code** inside `Code.gs`.
2. Open [`google-apps-script.js`](file:///c:/Users/aarsh/digital/growvia.digital/google-apps-script.js) from your project folder.
3. **Copy the entire contents** of `google-apps-script.js` and **paste it into the Apps Script editor**.
4. *(Optional)* If you'd like an email alert in Gmail whenever someone submits an inquiry:
   - Change `SEND_EMAIL_NOTIFICATION: false` to `true`.
   - Put your email in `NOTIFICATION_EMAIL: 'your-email@example.com'`.
5. Click the **Save** icon (floppy disk) or press `Ctrl + S`.

---

## Step 4: Deploy as a Web App
1. At the top right, click the blue **Deploy** button and choose **New deployment**.
2. Click the **gear icon** (⚙️) next to *Select type* and choose **Web app**.
3. Fill out the fields:
   - **Description**: `Growvia Form Handler`
   - **Execute as**: **`Me (your email address)`**
   - **Who has access**: **`Anyone`** ⚠️ *(CRITICAL: You must choose "Anyone", otherwise visitors cannot submit data without logging in)*
4. Click **Deploy**.

---

## Step 5: Authorize the Script
1. Google will display a popup: *"Authorization required"*.
2. Click **Authorize access** and choose your Google account.
3. Google may show a security screen: *"Google hasn't verified this app"*.
   - Click **Advanced** (small text at bottom left).
   - Click **Go to Growvia Form Handler (unsafe)**.
   - Click **Allow**.
4. Google will now display your **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).
5. Click **Copy** to copy the URL.

---

## Step 6: Paste the URL in `script.js`
1. Open [`script.js`](file:///c:/Users/aarsh/digital/growvia.digital/script.js) in your project.
2. Find line 15:
   ```javascript
   var GOOGLE_SHEET_URL = '';
   ```
3. Paste your Web App URL between the quotes:
   ```javascript
   var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Save the file.

---

## Step 7: Test Your Form
1. Open your website in a browser (`index.html`).
2. Scroll to the **"Let's Build Something Great"** inquiry form.
3. Fill in the fields:
   - Full name
   - Email address
   - Company name
   - Service required
   - Estimated budget
   - Project details
4. Click **Send Inquiry**.
5. You will see the button transition to **"Sending..."** with a loading spinner, then switch to the **"Inquiry Sent Successfully!"** confirmation card.
6. Check your Google Sheet: a new row will be created with the exact submission details, timestamp, and styled headers automatically!

---

## What Columns Are Saved?
The script automatically generates styled headers on the first submission:
1. **Timestamp**: Date and time of submission
2. **Full Name**: Customer's full name
3. **Email Address**: Customer's email
4. **Company**: Business name (or "—" if left empty)
5. **Service Required**: Selected service
6. **Estimated Budget**: Selected budget option
7. **Project Details**: Customer's project description
