const projects = document.querySelector('#projects');
const loadMoreButton = document.querySelector('#load-more-btn');
const projectsGrid = document.querySelector('#projects-grid');

fetch('data/projects/projects.json')
    .then((response) => response.json())
    .then((projects) => {
        const projectCards = projects.map((project) => {
            return `
                <div class="project-card">
                    <img src="${project.image_path}" alt="${project.name}">
                    <h3>${project.name}</h3>
                    <p>${project.short_description}</p>
                    ${project.show_tags ? `
                        <div class="tags">
                            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="technologies">
                        ${project.tecnoligies.join('')}
                    </div>
                    <div class="project-links">
                        ${project.url ? `
                            <a onclick="window.open('${project.url}', '_blank')">
                                <i class="fas fa-eye"></i>
                            </a>
                        ` : ''}
                        ${project.github_link ? `
                            <a onclick="window.open('${project.github_link}', '_blank')">
                                <i class="fab fa-github"></i>
                            </a>
                        ` : ''}
                        ${project.documentation_link ? `
                            <a onclick="window.location.href='${project.documentation_link}'">
                                <i class="fas fa-download"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        projectsGrid.innerHTML = projectCards;
    })
    .catch((error) => {
        console.error('Error al cargar los proyectos:', error);
        projects.innerHTML = '<p>No se pudieron cargar los proyectos. Int�ntalo m�s tarde.</p>';
    });

    loadMoreButton.addEventListener('click', () => {
        projectsGrid.classList.toggle('expanded');
        
        if (projectsGrid.classList.contains('expanded')) {
            loadMoreButton.textContent = 'Ver menos';
            projectsGrid.style.maxHeight = '625px';
            void projectsGrid.offsetHeight;

            projectsGrid.style.maxHeight = `${projectsGrid.scrollHeight}px`;
        } else {
            loadMoreButton.textContent = 'Ver más';
            projectsGrid.style.maxHeight = '625px';
            
            const yOffset = -80;
            const yPosition = projects.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({
            top: yPosition,
            behavior: 'smooth'
        });

        }
    });
    