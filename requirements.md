Create a production ready static website for a Boy Scouts of America troop hosted on GitHub Pages with a custom domain.

Architecture requirements:

1. Pure static site. No server runtime.
2. Hosted on GitHub Pages.
3. Custom domain with HTTPS.
4. Use Decap CMS for browser based content editing.
5. Content stored as Markdown files inside a content folder.
6. Layout separated from content.
7. No heavy frameworks. Use semantic HTML5, modern CSS, and minimal JavaScript.

Design requirements:

I will provide a design image and base HTML (See Design folder). Follow layout, spacing, typography, and colors exactly.
Use a clean, modern, mobile first layout.
Strong accessibility with proper heading structure and color contrast.
Simple navigation bar with sticky header.
Professional but youth friendly tone.

Pages:

Home
About
Leadership
Calendar (Get is from https://www.TroopWebHost.org/iCalendar.aspx?a=2967&u=881458&z=28)
Events (Get is from https://www.TroopWebHost.org/iCalendar.aspx?a=2967&u=881458&z=28)
Gallery
Join Us
Contact

Editing requirements:

1. Secure login using GitHub OAuth.
2. Visual editing for text sections.
3. Add, edit, delete events.
4. Upload and manage images.
5. Edit leadership list.
6. Edit calendar content.
7. Manage homepage hero section.
8. No coding required for editors.

CMS requirements:

1. Admin panel at /admin
2. Config file for Decap CMS
3. Collections for:

   * Pages
   * Events
   * Leadership
   * Gallery
4. Media stored in /assets/images
5. Clean editorial workflow optional but supported

Contact form:

Use a GitHub Pages compatible form solution such as Formspree.
Include spam protection.

Repository structure example:

/
index.html
about.html
events.html
leadership.html
gallery.html
join.html
contact.html
/css
/js
/assets/images
/content
/admin
index.html
config.yml

Deployment instructions:

1. How to enable GitHub Pages from main branch.
2. How to connect custom domain.
3. How to configure DNS A record or CNAME.
4. How to enable HTTPS.
5. How to configure GitHub OAuth for Decap CMS.
6. How to add scout editors safely.

Deliverables:

1. Full folder structure.
2. All HTML files.
3. CSS file.
4. Minimal JavaScript.
5. Decap CMS config file.
6. Step by step deployment guide.
7. Editor guide written for a 13 to 17 year old.

Optimization goals:

Fast load time under 2 seconds.
Lighthouse performance above 90.
Simple maintainable code.
Future proof structure.

If you want to go one level better, tell Antigravity:

Add automatic image compression on upload.
Add event sorting by date.
Add SEO meta tags for each page.
Add structured data for organization schema.

Strong opinion: do not build a custom editing system. Use Decap CMS. It keeps everything clean, secure, and scalable for a troop.

