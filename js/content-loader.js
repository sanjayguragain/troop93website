/**
 * content-loader.js
 * Fetches Markdown/YAML content from the /content/ directory and updates the page.
 * Dependencies: js-yaml (loaded via CDN in the HTML)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Determine which content to load based on page elements or URL
    const path = window.location.pathname;
    let contentFile = null;

    // Check for specific containers first (more robust)
    if (document.getElementById('scoutmaster-list')) {
        loadLeadershipData();
    }
    if (document.getElementById('eagles-list')) {
        loadEaglesData();
    }

    // Check for generic page
    if (window.location.pathname.endsWith('page.html')) {
        loadCustomPage();
    }

    // Handle Page Content (Home/About)
    if (path.endsWith('/') || path.endsWith('index.html')) {
        contentFile = 'content/home.md';
    } else if (path.endsWith('about.html')) {
        contentFile = 'content/about.md';
    }

    if (!contentFile) return;

    try {
        // 2. Fetch the content file
        const response = await fetch(contentFile);
        if (!response.ok) throw new Error(`Failed to load content: ${response.statusText}`);

        const text = await response.text();

        // 3. Parse Frontmatter (YAML)
        // We assume the file starts with --- and ends the frontmatter with ---
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = text.match(frontmatterRegex);

        if (match && match[1]) {
            // Check if jsyaml is loaded
            if (typeof jsyaml !== 'undefined') {
                const data = jsyaml.load(match[1]);
                updatePageContent(data);
            } else {
                console.error('js-yaml library not found. Cannot parse content.');
            }
        }
    } catch (error) {
        console.warn('Content loader error:', error);
    }
});

/**
 * Updates DOM elements based on the parsed data.
 * Expects keys in data to match ID attributes in HTML (underscores converted to hyphens if needed).
 */
function updatePageContent(data) {
    for (const [key, value] of Object.entries(data)) {
        // Convert snake_case (CMS) to kebab-case (HTML IDs)
        // e.g. hero_title -> hero-title
        const elementId = key.replace(/_/g, '-');
        const element = document.getElementById(elementId);

        if (element) {
            // Handle different types of content
            if (key.includes('image')) {
                if (element.tagName === 'IMG') {
                    element.src = value;
                } else {
                    element.style.backgroundImage = `url('${value}')`;
                }
            } else {
                // If the value contains newlines, treat it as multiple paragraphs or HTML
                // For simple text, textContent is safer, but for "story_1" which might have markdown/paragraphs, we might need simple formatting.
                // For now, we'll assign to innerHTML if it looks like it needs formatting, or textContent otherwise.
                // Actually, let's just use a simple approach: treat newlines as <br> or <p> if it's a long block.

                if (typeof value === 'string' && value.includes('\n')) {
                    // Simple markdown-ish to HTML: split by double newline -> paragraphs
                    const paragraphs = value.split(/\n\s*\n/).filter(p => p.trim());
                    element.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
                } else {
                    element.textContent = value;
                }
            }
        }
    }
}

async function loadLeadershipData() {
    try {
        const response = await fetch(`data/leadership.json?t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load leadership data');
        const data = await response.json();

        // Render Scoutmasters
        if (data.scoutmasters) {
            const container = document.getElementById('scoutmaster-list');
            if (container) {
                container.innerHTML = data.scoutmasters.map(person => `
                    <div class="card" style="text-align: center; padding: 1.5rem;">
                        <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">${person.name}</h3>
                        <p style="color: var(--slate-500); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${person.role}</p>
                    </div>
                `).join('');
            }
        }

        // Render Committee Leadership
        if (data.committee_leadership) {
            const container = document.getElementById('committee-leadership-list');
            if (container) {
                container.innerHTML = data.committee_leadership.map(person => `
                    <div class="card" style="text-align: center; padding: 1.5rem;">
                        <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">${person.name}</h3>
                        <p style="color: var(--primary); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${person.role}</p>
                    </div>
                `).join('');
            }
        }

        // Render Committee Members
        if (data.committee_members) {
            const container = document.getElementById('committee-members-list');
            if (container) {
                container.innerHTML = data.committee_members.map(person => `
                    <div class="card" style="text-align: center; padding: 1.5rem;">
                        <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">${person.name}</h3>
                        <p style="color: var(--slate-500); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${person.role}</p>
                    </div>
                `).join('');
            }
        }

        // Render Youth Leadership
        if (data.youth) {
            const container = document.getElementById('youth-leadership-list');
            if (container) {
                container.innerHTML = data.youth.map(person => `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div style="width: 8rem; height: 8rem; margin: 0 auto 1.5rem; border-radius: 50%; padding: 0.25rem; border: 2px solid rgba(17,212,17,0.2); overflow: hidden;">
                            <img src="${person.image || 'assets/images/placeholder_user.png'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                        </div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem;">${person.name}</h3>
                        <p style="color: var(--primary); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${person.role}</p>
                        ${person.eagle_candidate ? '<div style="margin-top: 1rem; display: inline-block; background: rgba(17,212,17,0.1); color: var(--primary); font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 1rem;">EAGLE CANDIDATE</div>' : ''}
                    </div>
                `).join('');
            }
        }

    } catch (e) {
        console.error('Error loading leadership data:', e);
    }
}

async function loadCustomPage() {
    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('id');

    if (!pageId) {
        document.getElementById('page-title').textContent = 'Page Not Found';
        return;
    }

    try {
        const response = await fetch(`content/pages/${pageId}.md?t=${Date.now()}`);
        if (!response.ok) throw new Error('Page not found');

        const text = await response.text();
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = text.match(frontMatterRegex);

        let contentDisplay = text;
        if (match) {
            try {
                const frontMatter = jsyaml.load(match[1]);
                contentDisplay = match[2];

                if (frontMatter.title) {
                    document.getElementById('page-title').textContent = frontMatter.title;
                    document.title = `${frontMatter.title} | Troop 93 Fullerton`;
                }
                if (frontMatter.description && document.getElementById('page-description')) {
                    document.getElementById('page-description').textContent = frontMatter.description;
                }
            } catch (e) {
                console.error('Error parsing frontmatter:', e);
            }
        }

        if (window.marked) {
            document.getElementById('page-body').innerHTML = marked.parse(contentDisplay);
        } else {
            document.getElementById('page-body').innerHTML = contentDisplay.replace(/\n/g, '<br>');
        }

    } catch (e) {
        console.error('Error loading page:', e);
        document.getElementById('page-title').textContent = 'Page Not Found';
        document.getElementById('page-body').textContent = 'The page you are looking for does not exist.';
    }
}

async function loadEaglesData() {
    try {
        const response = await fetch(`data/eagles.json?t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load eagles data');
        const data = await response.json();

        // Group by Year for the existing layout? Or just a flat grid? 
        // The existing HTML groups purely by years visually, but inside a single grid.
        // Actually the existing HTML has ONE grid with headers inside cards? No.
        // It has ONE big grid `div class="grid md-grid-cols-2..."`.

        if (data.scouts) {
            const container = document.getElementById('eagles-list');
            if (container) {
                // Determine if we need to insert year separators or if distinct years are just text in the card.
                // The current design just shows date and name.

                container.innerHTML = data.scouts.map(scout => `
                    <div class="card"
                        style="padding: 2rem; border-top: 5px solid #eab308; transition: transform 0.3s ease;"
                        onmouseover="this.style.transform='translateY(-5px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                        <p style="font-size: 0.75rem; color: #ca8a04; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;">
                            ${scout.date_display}</p>
                        <h3 style="font-size: 1.125rem; font-weight: 800; margin-bottom: 0.25rem;">${scout.name}</h3>
                        <p style="font-size: 0.8125rem; color: var(--slate-500);">Eagle Class of ${scout.class_year}</p>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error('Error loading eagles data:', e);
    }
}
