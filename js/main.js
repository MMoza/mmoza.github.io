const $ = (el) => document.querySelector(el);
let currentSection = getInitialSection();
const configButton = document.getElementById('config-button');

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
        loadAssociatedScript(currentSection);
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
            loadAssociatedScript(focusedSection)
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

    // Cargar el script asociado, si existe
    loadAssociatedScript(section);
}

function loadAssociatedScript(sectionId) {
    const link = document.querySelector(`nav a[data-section="${sectionId}.html"]`);
    if (link && link.hasAttribute('data-js')) {
        const scriptPath = link.getAttribute('data-js');

        if (!document.querySelector(`script[src="${scriptPath}"]`)) {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.type = 'text/javascript';
            script.defer = true;

            document.head.appendChild(script);
            console.log(`Script cargado para la sección: ${sectionId}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', 'components/header.html', false);
    loadComponent('footer', 'components/footer.html', false);

    const sections = [
        'components/home.html',
        'components/experience.html',
        'components/projects.html',
        'components/about.html',
        'components/contact.html',
    ];

    const mainContent = document.getElementById('main-content');

    const loadSectionPromises = sections.map((path, index) => {
        const id = `section-${index}`;
        
        mainContent.insertAdjacentHTML('beforeend', `<div id="${id}" class="section"></div>`);

        return new Promise((resolve) => {
            loadComponent(id, path, false, () => resolve());
        });
    });

    Promise.all(loadSectionPromises).then(() => {
        observeSections();
        updateStylesForSection(currentSection);

        const homeLink = document.querySelector('[data-section="home.html"]');
        if (homeLink) {
            homeLink.click();
        }
        
        loadAssociatedScript('projects');
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

if (configButton) {
    document.getElementById('config-button').addEventListener('click', function (event) {
        event.preventDefault();
        const dropdown = this.nextElementSibling;
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
}

document.addEventListener('click', function (event) {
    const config = document.querySelector('.config');
    if (!config.contains(event.target)) {
        const dropdown = config.querySelector('.dropdown');
        dropdown.style.display = 'none';
    }
});

document.getElementById('language-switch').addEventListener('change', function () {
    alert(this.checked ? 'Language switched to English' : 'Language switched to Español');
});

document.getElementById('theme-switch').addEventListener('change', function () {
    alert(this.checked ? 'Dark Mode enabled' : 'Light Mode enabled');
});