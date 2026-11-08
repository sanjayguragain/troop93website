# Editing and previewing the site

Run `npm install`, then `npm run dev`. This builds the site and serves `dist/` locally.
Run `npm run build` again after editing a source file; refresh the browser to see the change.

Page content lives in the root HTML files and `resources/`. CMS-managed content stays in
`content/` and `data/`. Edit `templates/header.html` or `templates/footer.html` to update
navigation or footer links across every page. Keep the `<!-- site-header -->` and
`<!-- site-footer -->` markers in each page. The build adds the correct relative links,
active navigation state, and main-content target for the skip link.

`npm test` rebuilds and checks the generated output. GitHub Pages runs the same build
and checks before deploying `dist/`; the generated directory is not committed.
Navigation is generated as ordinary HTML and does not require a browser fetch.

The retired calendar and gallery URLs redirect to the activity showcase. Gallery data,
album images, original CSV exports, scripts, templates, and project documentation are
not included in the deployment. Keep event details and subscription URLs out of public content.
