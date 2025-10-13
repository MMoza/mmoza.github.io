// --- 1. SELECTORES DE BOTONES ---
const startTournamentButton = document.getElementById('startTournament');
const tournamentsHistoryButton = document.getElementById('tournamentsHistory');
const tournamentSettingsButton = document.getElementById('tournamentSettings');

// Variable que contendrá el elemento DOM del modal (el .modal-overlay) una vez cargado.
let modalElement = null; 

// Variable que contendrá el texto HTML de la plantilla.
let modalTemplateContent = null; 

// ==========================================================
// 2. FUNCIÓN DE INICIALIZACIÓN Y CARGA DE LA PLANTILLA
// ==========================================================

/**
 * Carga la plantilla HTML del modal y la inserta en el DOM de forma oculta.
 */
async function loadModalTemplate() {
    try {
        const response = await fetch('templates/modal-template.html');
        if (!response.ok) {
            throw new Error('Error al cargar la plantilla modal: templates/modal-template.html');
        }
        
        modalTemplateContent = await response.text();

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalTemplateContent;
        
        const loadedModal = tempContainer.querySelector('.modal-overlay');
        if (!loadedModal) {
            throw new Error('La plantilla modal no contiene el selector .modal-overlay');
        }

        loadedModal.classList.add('hidden');
        document.body.appendChild(loadedModal);
        
        modalElement = loadedModal;

        console.log('Plantilla de modal cargada y añadida al DOM.');
        setupModalListeners();

    } catch (error) {
        console.error('Fallo en la carga inicial del modal:', error);
        alert('Fallo crítico al cargar la interfaz. Por favor, recargue.');
    }
}

// ==========================================================
// 3. LÓGICA DEL MODAL Y MANEJO DE CONTENIDO
// ==========================================================

/**
 * Loads and displays the modal with the specified content and title.
 * @param {string} contentFileName - The path to the HTML file containing the modal body content and scripts.
 * @param {string} modalTitle - The title to display in the modal header.
 */
async function openModalWithContent(contentFileName, modalTitle) {
    if (!modalElement) {
        await loadModalTemplate();
        if (!modalElement) return;
    }

    try {
        const response = await fetch(contentFileName);
        const specificHtmlContent = await response.text();
        
        const modalTitleElement = modalElement.querySelector('.modal-header h2');
        const modalBodyElement = modalElement.querySelector('.modal-body');

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = specificHtmlContent;
        
        // El contenido HTML inyectado NO incluye el <script>
        const contentHTML = tempContainer.innerHTML;
        const scripts = tempContainer.querySelectorAll('script');

        if (modalTitleElement) {
            modalTitleElement.textContent = modalTitle;
        }
        if (modalBodyElement) {
            // Limpia el contenido HTML (sin los scripts todavía)
            modalBodyElement.innerHTML = contentHTML; 
        }
        
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // Copia todos los atributos, incluyendo 'type="module"'
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Si el script tiene 'src', manipulamos la URL para forzar la recarga
            if (oldScript.src) {
                // Añade un timestamp como parámetro de consulta para evitar el caching del módulo
                const uniqueSrc = `${oldScript.src}?v=${Date.now()}`; 
                newScript.src = uniqueSrc;
            } else {
                // Si es un script inline, simplemente copia el texto
                newScript.textContent = oldScript.textContent;
            }
            
            // Inyectar el nuevo script en el modalBody.
            if (modalBodyElement) {
                modalBodyElement.appendChild(newScript);
            }
        });
        
        modalElement.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error(`Error loading module ${contentFileName}:`, error);
        alert('Could not load the required module.');
    }
}

/**
 * Configura los eventos para cerrar el modal. Se llama solo una vez.
 */
function setupModalListeners() {
    
    modalElement.addEventListener('click', (e) => {
        
        if (e.target === modalElement) {
            closeModal();
        }
    
        if (e.target.closest('.close-modal')) {
             closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalElement && !modalElement.classList.contains('hidden')) {
            closeModal();
        }
    });
}

/**
 * Oculta el modal.
 */
function closeModal() {
    if (!modalElement) return;
    modalElement.classList.add('hidden');
    document.body.style.overflow = '';

    const modalBodyElement = modalElement.querySelector('.modal-body');
    if (modalBodyElement) {
        modalBodyElement.innerHTML = ''; 
    }
}

// ==========================================================
// 4. EVENTOS DE LOS BOTONES Y EJECUCIÓN INICIAL
// ==========================================================

// Ejecutar la carga de la plantilla al inicio del script.
loadModalTemplate(); 

// Eventos de los botones
if (startTournamentButton) {
    startTournamentButton.addEventListener('click', () => {
        openModalWithContent('templates/init-tournament.html', 'Nuevo Torneo');
    });
}

if (tournamentsHistoryButton) {
    tournamentsHistoryButton.addEventListener('click', () => {
        openModalWithContent('templates/history-content.html', 'Historial de Torneos');
    });
}

if (tournamentSettingsButton) {
    tournamentSettingsButton.addEventListener('click', () => {
        openModalWithContent('templates/settings-content.html', 'Configuración de Estructuras');
    });
}