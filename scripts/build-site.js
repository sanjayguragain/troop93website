const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const templates = Object.fromEntries(['header', 'footer'].map(name => [
    name, fs.readFileSync(path.join(root, 'templates', `${name}.html`), 'utf8').trim()
]));

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function renderPage(file) {
    let html = fs.readFileSync(path.join(root, file), 'utf8');
    const prefix = '../'.repeat(file.split('/').length - 1);
    const active = file.startsWith('resources/') ? 'resources'
        : path.basename(file, '.html') === 'index' ? 'home' : path.basename(file, '.html');
    if (html.includes('<!-- site-header -->')) {
        const main = html.match(/<main\b[^>]*>/);
        if (!main) throw new Error(`Missing main landmark: ${file}`);
        const mainId = main[0].match(/\bid="([^"]+)"/)?.[1] || 'main-content';
        if (!main[0].includes('id="')) html = html.replace(main[0], main[0].replace('<main', '<main id="main-content"'));
        for (const name of ['header', 'footer']) {
            const marker = `<!-- site-${name} -->`;
            if (html.split(marker).length !== 2) throw new Error(`Expected one ${marker} in ${file}`);
            const partial = templates[name]
                .replaceAll('{{root}}', prefix)
                .replaceAll('{{main-id}}', mainId)
                .replaceAll('{{year}}', String(new Date().getUTCFullYear()))
                .replace(/\{\{active:([a-z]+)\}\}/g, (_, item) => active === item ? ' aria-current="page"' : '');
            html = html.replace(marker, partial);
        }
    }
    if (/\{\{|<!-- site-(?:header|footer) -->/.test(html)) throw new Error(`Unresolved template: ${file}`);
    const target = path.join(output, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
}

const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
pages.push(...fs.readdirSync(path.join(root, 'resources')).filter(file => file.endsWith('.html')).map(file => `resources/${file}`));
pages.forEach(renderPage);

// Publish website content only. Gallery archives and original name exports stay out of the artifact.
for (const directory of ['css', 'js', 'content', 'admin']) {
    fs.cpSync(path.join(root, directory), path.join(output, directory), {
        recursive: true, filter: source => path.basename(source) !== '.DS_Store'
    });
}
fs.mkdirSync(path.join(output, 'data'));
for (const file of ['eagles.json', 'leadership.json']) {
    fs.copyFileSync(path.join(root, 'data', file), path.join(output, 'data', file));
}
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {
    recursive: true,
    filter: source => {
        if (fs.statSync(source).isDirectory()) return path.basename(source) !== 'albums';
        return /\.(?:pdf|png|jpe?g|webp|svg|gif|ico)$/i.test(source);
    }
});
fs.copyFileSync(path.join(root, 'CNAME'), path.join(output, 'CNAME'));
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Built ${pages.length} pages in dist/ using shared header and footer templates.`);
