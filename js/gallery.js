document.addEventListener('DOMContentLoaded', () => {
    fetchAlbums();
});

async function fetchAlbums() {
    try {
        const response = await fetch('data/albums.json');
        if (!response.ok) {
            throw new Error('Failed to load albums data');
        }

        const albums = await response.json();
        renderAlbums(albums);

    } catch (error) {
        console.error('Error loading albums:', error);
        // Fallback or error state could be handled here
        // For now, if it fails, the existing static placeholders (if any) might just stay, 
        // or we could show an error message.
    }
}

function renderAlbums(albums) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    // Clear existing content (placeholders)
    grid.innerHTML = '';

    albums.forEach(album => {
        const item = document.createElement('div');
        item.className = 'masonry-item';

        // Use the cover photo URL. 
        // Note: Google Photos Base URLs often need parameters to work well.
        // w=width, h=height, c=crop. 
        // Example: url=...=w500-h500-c
        // For masonry, we usually want width constrained but height flexible or fixed.
        // Let's just use a reasonable width.
        const coverUrl = album.coverPhotoBaseUrl ? `${album.coverPhotoBaseUrl}=w600` : 'assets/images/placeholder.jpg';

        item.innerHTML = `
            <a href="${album.productUrl}" target="_blank" class="photo-card block text-white group" title="${album.title}">
                <img src="${coverUrl}" alt="${album.title}" loading="lazy">
                <div class="photo-overlay">
                    <span style="font-size: 0.65rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem;">
                        ${album.mediaItemsCount} Items
                    </span>
                    <h3 style="font-size: 1.25rem; font-weight: 800;">${album.title}</h3>
                    <p style="font-size: 0.875rem; opacity: 0.7;">Click to view album</p>
                </div>
            </a>
        `;

        grid.appendChild(item);
    });
}
