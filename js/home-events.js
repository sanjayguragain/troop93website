document.addEventListener('DOMContentLoaded', () => {
    const eventsContainer = document.getElementById('upcoming-events-container');
    if (!eventsContainer) return;

    // Check if API key is configured
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        eventsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-slate-500 mb-4">Please configure the Google Calendar API Key in js/config.js to see upcoming events.</p>
                <a href="calendar.html" class="btn-primary inline-flex items-center gap-2">
                    View Full Calendar <span class="material-symbols-outlined">arrow_forward</span>
                </a>
            </div>
        `;
        return;
    }

    fetchUpcomingEvents();
});

async function fetchUpcomingEvents() {
    const container = document.getElementById('upcoming-events-container');

    // Show loading state
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-4">refresh</span>
            <p class="text-slate-500">Loading upcoming adventures...</p>
        </div>
    `;

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CONFIG.CALENDAR_ID)}/events?` + new URLSearchParams({
            key: CONFIG.API_KEY,
            timeMin: startOfMonth,
            timeMax: endOfMonth,
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: 6 // Limit to 6 events for the home page
        });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            renderEvents(data.items);
        } else {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-slate-500 mb-4">No events scheduled for the rest of this month.</p>
                    <a href="calendar.html" class="btn-secondary inline-flex items-center gap-2">
                        View Full Calendar
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-slate-500 mb-4">Could not load events at this time.</p>
                <a href="calendar.html" class="btn-primary inline-flex items-center gap-2">
                    View Full Calendar <span class="material-symbols-outlined">arrow_forward</span>
                </a>
            </div>
        `;
    }
}

function renderEvents(events) {
    const container = document.getElementById('upcoming-events-container');
    container.innerHTML = ''; // Clear loading state

    // Create a grid container if it doesn't exist inside the main container
    // or just append cards directly if the CSS grid is on the parent

    events.forEach(event => {
        const start = new Date(event.start.dateTime || event.start.date);
        const isAllDay = !event.start.dateTime;

        const card = document.createElement('div');
        card.className = 'card flex flex-col gap-4';

        // Determine icon/image based on event summary
        const iconInfo = getEventIcon(event.summary);

        card.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-center justify-center w-12 h-12 rounded-full ${iconInfo.bgClass} text-white">
                    <span class="material-symbols-outlined">${iconInfo.icon}</span>
                </div>
                <div class="text-right">
                    <span class="block text-sm font-bold text-moss uppercase tracking-wider">
                        ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span class="block text-xs text-slate-500">
                        ${isAllDay ? 'All Day' : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-bold mb-2 leading-tight">${event.summary}</h3>
                ${event.location ? `
                    <div class="flex items-start gap-1 text-xs text-slate-500 mb-2">
                        <span class="material-symbols-outlined text-sm">location_on</span>
                        <span class="truncate">${event.location}</span>
                    </div>
                ` : ''}
                ${event.description ? `
                    <p class="text-sm text-slate-600 line-clamp-2">${event.description}</p>
                ` : ''}
            </div>
        `;

        container.appendChild(card);
    });
}

function getEventIcon(summary) {
    const lowerSummary = summary.toLowerCase();

    if (lowerSummary.includes('hike') || lowerSummary.includes('backpack')) {
        return { icon: 'hiking', bgClass: 'bg-orange-500' };
    } else if (lowerSummary.includes('camp')) {
        return { icon: 'camping', bgClass: 'bg-green-600' };
    } else if (lowerSummary.includes('meeting') || lowerSummary.includes('troop')) {
        return { icon: 'groups', bgClass: 'bg-blue-500' };
    } else if (lowerSummary.includes('service') || lowerSummary.includes('project')) {
        return { icon: 'handshake', bgClass: 'bg-purple-500' };
    } else if (lowerSummary.includes('court') || lowerSummary.includes('honor')) {
        return { icon: 'military_tech', bgClass: 'bg-yellow-500' };
    } else {
        return { icon: 'event', bgClass: 'bg-slate-500' };
    }
}
