import { TournamentTemplateService } from './services/TournamentTemplateService.js';
import { fetchTemplate } from './utils/templateLoader.js';

console.log('init-tournament')

/**
 * Funcin principal para inicializar la aplicacin y cargar los datos maestros.
 */
async function initApp() {
    // 1. Instanciar el servicio
    const tournamentService = new TournamentTemplateService();

    console.log("Iniciando aplicacin y cargando plantillas de torneo...");

    try {
        // 2. Llamar al mtodo asncrono para cargar todas las plantillas
        const allTemplates = await tournamentService.loadAllTemplates();

        if (allTemplates && allTemplates.length > 0) {
            console.log(`Carga exitosa. Total de plantillas encontradas: ${allTemplates.length}`);

            return allTemplates;
        } else {
            console.warn("No se encontraron plantillas de torneo.");
            return [];
        }

    } catch (error) {
        console.error("Fallo crtico al cargar las plantillas de torneo:", error);

        return [];
    }
}

// ----------------------------------------------------------------------
// MODIFICACIÓN MÍNIMA
// ----------------------------------------------------------------------

/**
 * Renderiza una lista de plantillas de torneo en el contenedor #template-list.
 * @param {Array<TournamentTemplate>} templates - Lista de objetos de plantilla de torneo.
 * @param {string} templateHTML - El contenido HTML de la tarjeta principal.
 * @param {Object} tagTemplates - Objeto que contiene los strings HTML de las píldoras.
 */
function renderTemplates(templates, templateHTML, tagTemplates) {
    const templateListContainer = document.getElementById('template-list');

    if (!templateListContainer) {
        console.error("Error de Renderizado: No se encontró el contenedor #template-list en el DOM.");
        return;
    }

    if (!templates || templates.length === 0) {
        templateListContainer.innerHTML = '<p>No se encontraron plantillas de torneo cargadas.</p>';
        return;
    }

    templateListContainer.innerHTML = '';

    templates.forEach(template => {

        // --- Acceso a datos ---
        const entryCost = template.mainEntry
            ? (template.mainEntry.costCents / 100).toFixed(2)
            : 'N/A';
        const stackInBB = template.getInitialStackInBB();
        const displayBB = stackInBB !== null ? stackInBB.toFixed(0) : 'N/A';

        const tableSize = template.tableSize;
        const bounty = template.bounty;
        const reEntry = template.reEntry;
        const reBuyIn = template.reBuyIn;
        const addOn = template.addOn;

        // --- Inicializar variables de TAGs ---
        let bountyTagHTML = '';
        let reEntryTagHTML = '';
        let reBuyInTagHTML = '';
        let addOnTagHTML = '';

        // --- Lógica Condicional: Construir el HTML de las Píldoras ---

        // 1. BOUNTY (Regular, Progressive, Mystery)
        if (bounty) {
            const type = bounty.type.toUpperCase();

            if (type === 'REGULAR') {
                bountyTagHTML = tagTemplates.regularBounty;
            } else if (type === 'PROGRESIVE') {
                bountyTagHTML = tagTemplates.progressiveBounty.replace(/{{SPLIT}}/g, bounty.splitPercentage);
            } else if (type === 'MYSTERY') {
                bountyTagHTML = tagTemplates.mysteryBounty;
            }
        }

        // 2. RE-ENTRY
        if (reEntry) {
            reEntryTagHTML = tagTemplates.reEntry.replace(/{{MAX_ENTRIES}}/g, reEntry.maxEntries);
        }

        // 3. RE-BUY IN
        if (reBuyIn) {
            reBuyInTagHTML = tagTemplates.reBuyIn;
        }

        // 4. ADD ON
        if (addOn) {
            addOnTagHTML = tagTemplates.addOn;
        }

        let html = templateHTML;

        html = html.replace(/{{ID}}/g, template.id);
        html = html.replace(/{{NAME}}/g, template.name);
        html = html.replace(/{{TYPE}}/g, template.description || 'Torneo Estándar');
        html = html.replace(/{{ENTRY_COST}}/g, entryCost);
        html = html.replace(/{{STACK}}/g, template.mainEntry.stack);
        html = html.replace(/{{STACK_IN_BB}}/g, displayBB);

        const tableTagHTML = tableSize ? `<span class="tag tag-table-size">${tableSize}-MAX</span>` : '';
        html = html.replace(/{{TABLE_TAG}}/g, tableTagHTML);

        html = html.replace(/{{BOUNTY_TAG}}/g, bountyTagHTML);
        html = html.replace(/{{REENTRY_TAG}}/g, reEntryTagHTML);
        html = html.replace(/{{REBUYN_TAG}}/g, reBuyInTagHTML);
        html = html.replace(/{{ADDON_TAG}}/g, addOnTagHTML);

        html = html.replace(/{{[A-Z_]+}}/g, '');

        templateListContainer.insertAdjacentHTML('beforeend', html);

        templateListContainer.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.currentTarget.dataset.templateId;
                
                if (templateId) {
                    loadTemplateDetails(templateId);
                }
            });
        });

        console.log(`Lista de ${templates.length} plantillas renderizada en el DOM.`);

    });

    console.log(`Lista de ${templates.length} plantillas renderizada en el DOM.`);
}

try {
    initApp()
        .then(async (templates) => {
            window.appTemplates = templates;

            try {
                const cardTemplate = await fetchTemplate('./templates/tournament-card.html');

                const tagTemplates = {
                    regularBounty: await fetchTemplate('./templates/tags/tag-bounty-regular.html'),
                    progressiveBounty: await fetchTemplate('./templates/tags/tag-bounty-progressive.html'),
                    mysteryBounty: await fetchTemplate('./templates/tags/tag-bounty-mystery.html'),
                    reEntry: await fetchTemplate('./templates/tags/tag-reentry.html'),
                    reBuyIn: await fetchTemplate('./templates/tags/tag-rebuyin.html'),
                    addOn: await fetchTemplate('./templates/tags/tag-addon.html')
                };

                renderTemplates(templates, cardTemplate, tagTemplates);

                console.log("Plantillas cargadas y listas para usar.");

            } catch (loadError) {
                console.error("Fallo al renderizar: no se pudo obtener la plantilla HTML.", loadError);
            }
        })
        .catch(error => {
            console.error("Error en la inicialización asíncrona (promesa):", error);
        });
} catch (e) {
    console.error("? ERROR SÍNCRONO AL INICIAR LA APP:", e);
}

/**
 * Busca una plantilla por ID, carga la vista de detalles y actualiza el modal.
 * Esta función asume que window.appTemplates está disponible y que fetchTemplate existe.
 * * @param {string} templateId - El ID de la plantilla de torneo seleccionada.
 */
async function loadTemplateDetails(templateId) {
    if (!window.appTemplates) {
        console.error("No se encontraron plantillas de torneo globales (window.appTemplates).");
        return;
    }

    // 1. Encontrar el objeto de plantilla
    const template = window.appTemplates.find(t => t.id.toString() === templateId);

    if (!template) {
        console.error(`Plantilla con ID ${templateId} no encontrada.`);
        return;
    }

    // 2. Cargar la plantilla HTML de detalles
    const detailsTemplateHTML = await fetchTemplate('./templates/tournament-details.html');
    
    // 3. Renderizar los detalles del torneo
    let html = detailsTemplateHTML;

    // --- Lógica de renderizado de detalles ---
    
    const entryCost = template.mainEntry 
        ? (template.mainEntry.costCents / 100).toFixed(2)
        : 'N/A';
        
    const stackInBB = template.getInitialStackInBB();
    const displayBB = stackInBB !== null ? stackInBB.toFixed(0) : 'N/A';
    
    // Reemplazar placeholders en la plantilla de detalles
    html = html.replace(/{{ID}}/g, template.id);
    html = html.replace(/{{NAME}}/g, template.name);
    html = html.replace(/{{DESCRIPTION}}/g, template.description || 'N/A');
    html = html.replace(/{{ENTRY_COST}}/g, entryCost);
    html = html.replace(/{{STACK}}/g, template.mainEntry.stack);
    html = html.replace(/{{STACK_IN_BB}}/g, displayBB);
    html = html.replace(/{{TABLE_SIZE}}/g, template.tableSize);
    
    // Aquí puedes añadir más reemplazos para REBUY, ADDON, etc.

    // 4. Actualizar el contenido del modal
    const modalBodyElement = document.querySelector('.modal-overlay .modal-body');
    if (modalBodyElement) {
        modalBodyElement.innerHTML = html;
    } else {
        console.error("El cuerpo del modal no fue encontrado.");
    }
}