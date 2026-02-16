const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly'];
const ALBUMS_FILE = path.join(__dirname, '../data/albums.json');

// Check for required environment variables
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    console.error('Error: Missing required environment variables. Please check your .env file.');
    console.error('Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
    process.exit(1);
}

const auth = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
);

auth.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
});

async function main() {
    try {
        console.log('Authenticating with Google Photos API...');

        // Note: The googleapis library doesn't have a specific 'photoslibrary' endpoint in the same way 
        // as other APIs because it's newer/different. 
        // We often have to make direct requests or use a specific discovery URL, 
        // but for simplicity with the 'googleapis' library, we can use the 'request' method
        // once authenticated.

        // Alternatively, we can just use the access token provided by the auth client
        // to make fetching requests to the REST API endpoints.

        const accessTokenResponse = await auth.getAccessToken();
        const accessToken = accessTokenResponse.token;

        if (!accessToken) {
            throw new Error('Failed to generate access token');
        }

        console.log('Fetching albums...');

        const albums = await fetchAlbums(accessToken);

        console.log(`Found ${albums.length} albums.`);

        // Ensure data directory exists
        const dataDir = path.dirname(ALBUMS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albums, null, 2));
        console.log(`Successfully saved albums to ${ALBUMS_FILE}`);

    } catch (error) {
        console.error('Error fetching albums:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        process.exit(1);
    }
}

async function fetchAlbums(accessToken, pageToken = null, existingAlbums = []) {
    const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
    url.searchParams.append('pageSize', '50');

    if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
    }

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let albums = existingAlbums;

    if (data.albums) {
        // Filter out empty albums if desired, or transform data
        const processedAlbums = data.albums.map(album => ({
            id: album.id,
            title: album.title,
            productUrl: album.productUrl,
            coverPhotoBaseUrl: album.coverPhotoBaseUrl,
            mediaItemsCount: album.mediaItemsCount
        }));

        albums = albums.concat(processedAlbums);
    }

    if (data.nextPageToken) {
        return fetchAlbums(accessToken, data.nextPageToken, albums);
    }

    return albums;
}

main();
