const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const output = path.resolve(__dirname, '../dist');
const read = file => fs.readFileSync(path.join(output, file), 'utf8');
const pages = fs.readdirSync(output).filter(file => file.endsWith('.html'));
pages.push(...fs.readdirSync(path.join(output, 'resources')).filter(file => file.endsWith('.html')).map(file => `resources/${file}`));
const regularPages = pages.filter(file => !['calendar.html', 'gallery.html'].includes(file));

test('shared navigation and footer render on every regular page with correct current section', () => {
    for (const file of regularPages) {
        const html = read(file);
        assert.equal((html.match(/<header\b/g) || []).length, 1, file);
        assert.equal((html.match(/<footer\b/g) || []).length, 1, file);
        assert.ok(!html.includes('<!-- site-'), file);
        assert.ok(!html.includes('{{'), file);
        assert.ok(!html.includes('href="#"'), file);
        assert.match(html, /aria-controls="site-navigation"/);
        assert.match(html, /aria-expanded="false"/);
        const section = file.startsWith('resources/') ? 'resources.html' : file;
        const currentLinks = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
        assert.equal(currentLinks.length, file === 'page.html' ? 0 : 1, file);
        if (currentLinks.length) assert.ok(currentLinks[0][0].includes(section), file);
        const footer = html.split('<footer>')[1];
        assert.match(footer, /facebook\.com/);
        assert.match(footer, /instagram\.com/);
    }
});

test('all published local links, assets, and fragment targets resolve', () => {
    for (const file of pages) {
        const html = read(file);
        for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
            const url = match[1];
            if (/^(?:[a-z]+:|\/\/)/i.test(url)) continue;
            const [pathname, fragment] = url.split('#');
            const target = pathname ? path.resolve(output, path.dirname(file), pathname.split('?')[0]) : path.join(output, file);
            assert.ok(target.startsWith(output + path.sep), `${file}: ${url}`);
            assert.ok(fs.existsSync(target), `${file}: missing ${url}`);
            if (fragment) {
                const linked = fs.readFileSync(target, 'utf8');
                assert.ok(linked.includes(`id="${fragment}"`), `${file}: missing fragment ${url}`);
            }
        }
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
    }
});

test('retired gallery and calendar redirect without exposing their data', () => {
    for (const file of ['gallery.html', 'calendar.html']) {
        assert.match(read(file), /http-equiv="refresh" content="0; url=index\.html#activities"/);
        assert.doesNotMatch(read(file), /<iframe|gallery\.js|albums\.json/);
    }
    for (const file of ['data/albums.json', 'assets/images/albums', 'js/gallery.js',
        'assets/Eagle Roll Call 202621192030.CSV', 'scripts', 'templates', 'requirements.md', '.env']) {
        assert.ok(!fs.existsSync(path.join(output, file)), `${file} should not be published`);
    }
    for (const file of regularPages) {
        assert.doesNotMatch(read(file), /gallery\.html|iCalendar\.aspx|calendar\.google\.com|mailto:/);
    }
});

test('visit instructions work without email or a contact form', () => {
    assert.match(read('index.html'), />Plan your visit<\/a>/);
    assert.match(read('contact.html'), /output=embed/);
    assert.doesNotMatch(read('contact.html'), /email|<form/i);
    for (const file of ['index.html', 'join.html']) {
        assert.doesNotMatch(read(file), /arrange a visit|contact us first/i);
    }
});

test('small green text and button text have sufficient contrast', () => {
    const css = read('css/style.css');
    function color(name) {
        const value = css.match(new RegExp(`--${name}: (#[a-f0-9]{6});`, 'i'))?.[1];
        assert.ok(value, name);
        return value;
    }
    function luminance(hex) {
        const linear = hex.slice(1).match(/../g).map(value => {
            const channel = parseInt(value, 16) / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }
    function contrast(first, second) {
        const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
        return (values[0] + 0.05) / (values[1] + 0.05);
    }
    for (const foreground of ['primary', 'moss', 'moss-dark']) {
        for (const background of ['white', 'background-light', 'primary-light', 'khaki']) {
            assert.ok(contrast(color(foreground), color(background)) >= 4.5, `${foreground} on ${background}`);
        }
    }
    assert.ok(contrast(color('forest'), color('accent')) >= 4.5, 'button text');
    assert.ok(contrast(color('accent'), color('forest')) >= 4.5, 'dark panel accents');
});
