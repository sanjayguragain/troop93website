document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.mobile-menu-btn');
    const navigation = document.getElementById('site-navigation');
    const desktop = window.matchMedia('(min-width: 1200px)');

    if (menuButton && navigation) {
        function setMenuOpen(open, restoreFocus = false) {
            navigation.classList.toggle('nav-open', open);
            menuButton.setAttribute('aria-expanded', String(open));
            menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
            menuButton.querySelector('span').textContent = open ? 'close' : 'menu';
            if (restoreFocus) menuButton.focus();
        }

        menuButton.addEventListener('click', () => {
            setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false, true);
            }
        });
        navigation.addEventListener('click', event => {
            if (event.target.closest('a')) setMenuOpen(false);
        });
        document.addEventListener('click', event => {
            if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenuOpen(false);
        });
        desktop.addEventListener('change', () => {
            // A hidden mobile link must not retain keyboard focus when the viewport changes.
            const focusWasInNavigation = navigation.contains(document.activeElement);
            setMenuOpen(false, !desktop.matches && focusWasInNavigation);
        });
    }

    const header = document.getElementById('main-header');
    if (header) {
        const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }
});
