document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav'); // Updated to target generic nav or add class

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('nav-open');
            // Basic mobile menu toggle logic
            if (nav.style.display === 'flex') {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '5rem';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'var(--white)';
                nav.style.padding = '2rem';
                nav.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
            }
        });
    }

    // Sticky Header Scroll Effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

});
