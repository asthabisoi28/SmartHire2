# Google OAuth Setup Guide for InterviewAI

## 🔧 Setting Up Real Google Authentication

To enable real Google OAuth authentication, follow these steps:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "InterviewAI" 
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the consent screen first if prompted:
   - Application name: "InterviewAI"
   - User support email: your email
   - Developer contact: your email
4. Choose "Web application" as application type
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:3000/`
   - Add your production domain when ready

### 4. Update the Client ID

1. Copy your Client ID from Google Cloud Console
2. Open `login.html`
3. Replace this line:
   ```javascript
   const googleClientId = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
   ```
   With your actual Client ID:
   ```javascript
   const googleClientId = 'YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```

### 5. Test the Integration

1. Save the file and refresh your browser
2. Click "Continue with Google"
3. You should be redirected to Google's sign-in page
4. After authentication, you'll return to your app

## 🔒 Security Notes

- **Client ID**: Safe to expose in frontend code
- **Client Secret**: NEVER expose in frontend - only use on backend
- **State Parameter**: Used for CSRF protection (already implemented)
- **HTTPS**: Required for production (Google requires HTTPS for OAuth)

## 🚀 Production Deployment

For production deployment:

1. **Add production domain** to authorized redirect URIs
2. **Use HTTPS** (required by Google)
3. **Implement backend token exchange** for better security
4. **Store user data securely** (database instead of localStorage)

## 📝 Current Implementation

The current setup:
- ✅ Redirects to real Google OAuth
- ✅ Handles authentication flow
- ✅ Includes security state parameter
- ✅ Processes callback with error handling
- ⚠️ Uses demo Client ID (needs replacement)
- ⚠️ Simulates token exchange (needs backend implementation)

## 🔧 Backend Integration (Optional)

For full production setup, create a backend endpoint:

```javascript
// Example Node.js backend endpoint
app.post('/auth/google/callback', async (req, res) => {
  const { code } = req.body;
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/auth/google/callback'
    })
  });
  
  const tokens = await tokenResponse.json();
  
  // Get user info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  
  const userInfo = await userResponse.json();
  
  // Return user data to frontend
  res.json({ user: userInfo, token: tokens.access_token });
});
```

## 📞 Support

If you need help setting up Google OAuth:
1. Check Google Cloud Console documentation
2. Verify redirect URIs match exactly
3. Ensure APIs are enabled
4. Check browser console for errors

The system is ready for real Google authentication once you add your Client ID!