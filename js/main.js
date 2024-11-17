const $ = (el) => document.querySelector(el);
let currentSection = getInitialSection();

function getInitialSection() {
    const sections = document.querySelectorAll('section');
    let initialSection = 'home';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 3) {
            initialSection = section.id;
        }
    });

    return initialSection;
}

function updateCurrentSection() {
    const sections = document.querySelectorAll('section');
    let newCurrentSection = null;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isInTopThird = rect.top >= 0 && rect.top <= window.innerHeight / 3;

        if (isInTopThird) {
            newCurrentSection = section.id;
        }
    });

    if (newCurrentSection && newCurrentSection !== currentSection) {
        currentSection = newCurrentSection;
        console.log(`La sección actual es: ${currentSection}`);
        updateStylesForSection(currentSection);
    }
}

function updateStylesForSection(sectionId) {
    const allSections = document.querySelectorAll('section');
    allSections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('highlight');
        } else {
            section.classList.remove('highlight');
        }
    });

    const menuItems = document.querySelectorAll('nav ul li a');
    menuItems.forEach(item => {
        const targetSection = item.getAttribute('data-section')?.replace('.html', '');
        if (targetSection === sectionId) {
            item.parentElement.classList.add('active');
        } else {
            item.parentElement.classList.remove('active');
        }
    });
}

function loadComponent(containerId, componentPath, isContainer = true, callback = null) {
    const container = $(`#${containerId}`);
    if (!container) return;

    fetch(componentPath)
        .then(response => {
            if (!response.ok) return null;
            return response.text();
        })
        .then(html => {
            if (html) {
                if (isContainer) {
                    const componentContainer = document.createElement('div');
                    componentContainer.innerHTML = html;
                    container.appendChild(componentContainer);
                } else {
                    container.innerHTML = html;
                }

                if (callback) callback();
            }
        })
        .catch(() => {});
}

function observeSections() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        let focusedSection = null;
        entries.forEach(entry => {
            const rect = entry.target.getBoundingClientRect();
            const isCenter = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;

            if (entry.isIntersecting && isCenter) {
                focusedSection = entry.target.id;
            }
        });

        if (focusedSection) {
            console.log(`La sección en foco es: ${focusedSection}`);
        }
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

function navigateToComponent(section) {
    const component = document.querySelector(`#${section}`);
    if (component) {
        const offset = 100;
        const topPosition = component.offsetTop - offset;

        window.scrollTo({
            top: topPosition,
            behavior: 'smooth'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    loadComponent('header', 'components/header.html', false);
    loadComponent('footer', 'components/footer.html', false);

    const sections = [
        'components/home.html',
        'components/experience.html',
        'components/projects.html',
        'components/skills.html',
        'components/about.html',
        'components/contact.html',
    ];

    let loadedSections = 0;

    sections.forEach((path, index) => {
        const id = `section-${index}`;
        loadComponent('main-content', path, true, () => {
            loadedSections++;

            if (loadedSections === sections.length) {
                observeSections();
                updateStylesForSection(currentSection);

                const homeLink = document.querySelector('[data-section="home.html"]');
                if (homeLink) {
                    homeLink.click();
                }
            }
        });
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'A' && target.hasAttribute('data-section')) {
            event.preventDefault();
            let section = target.getAttribute('data-section');
            section = section.replace('.html', '');
            navigateToComponent(section);
        }
    });
});

document.addEventListener('scroll', updateCurrentSection);
