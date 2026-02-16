const { google } = require('googleapis');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const args = process.argv.slice(2);
const command = args[0];

if (command === 'get-url') {
    const scopes = [
        'https://www.googleapis.com/auth/photoslibrary.readonly'
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Important for refresh token
        scope: scopes,
        prompt: 'consent' // Force consent screen to ensure refresh token is returned
    });
    console.log('Authorize this app by visiting this url:');
    console.log(url);
} else if (command === 'get-token') {
    const code = args[1];
    if (!code) {
        console.error('Please provide the code in the argument: node scripts/auth-helper.js get-token <CODE>');
        process.exit(1);
    }
    // Handle the case where the user pastes the full URL or a string with "code="
    let cleanCode = code;
    if (code.includes('code=')) {
        cleanCode = code.split('code=')[1].split('&')[0];
    }

    oauth2Client.getToken(cleanCode).then(({ tokens }) => {
        console.log('\nSUCCESS! Here is your Refresh Token:\n');
        console.log(tokens.refresh_token);
        console.log('\nAdd this to your .env file as GOOGLE_REFRESH_TOKEN');
    }).catch(err => {
        console.error('Error retrieving access token:', err.response ? err.response.data : err.message);
    });
} else {
    console.log('Usage: node scripts/auth-helper.js [get-url | get-token <code>]');
}
