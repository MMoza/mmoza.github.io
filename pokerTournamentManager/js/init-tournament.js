import { TournamentTemplateService } from './services/TournamentTemplateService.js';
import { fetchTemplate } from './utils/templateLoader.js';
import { renderTemplates } from './components/tournamentCard/index.js';
import { showLoadingSpinner, hideLoadingSpinner } from './components/loadingSpinner/index.js';

console.log('init-tournament');

/**
 * Función principal para inicializar la aplicación.
 */
async function initApp() {
    const service = new TournamentTemplateService();

    console.log("Iniciando aplicación y cargando plantillas...");

    try {
        const templates = await service.loadAllTemplates();

        if (templates?.length) {
            console.log(`Carga exitosa: ${templates.length} plantillas`);
            return templates;
        } else {
            console.warn("No se encontraron plantillas.");
            return [];
        }
    } catch (error) {
        console.error("Fallo crítico al cargar las plantillas:", error);
        return [];
    }
}

// Inicialización
try {
    showLoadingSpinner('#modal-overlay');
    initApp()
        .then(async (templates) => {
            window.appTemplates = templates;

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
            hideLoadingSpinner('#modal-overlay');
            console.log("Plantillas cargadas y renderizadas correctamente.");
        })
        .catch((err) => console.error("Error en inicialización:", err));
} catch (e) {
    console.error("Error síncrono al iniciar la app:", e);
}