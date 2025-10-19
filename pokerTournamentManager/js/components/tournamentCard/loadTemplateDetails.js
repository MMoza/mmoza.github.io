import { fetchTemplate } from '../../utils/templateLoader.js';
import { generateBlindsTableHTML, initBlinds } from '../blinds/index.js';

export async function loadTemplateDetails(templateId) {
    const template = window.appTemplates?.find(t => t.id.toString() === templateId);
    if (!template) return console.error(`Plantilla ${templateId} no encontrada.`);

    const detailsHTML = await fetchTemplate('./templates/tournament-details.html');
    let html = fillTemplateDetails(detailsHTML, template);

    const modalBody = document.querySelector('.modal-overlay .modal-body');
    if (!modalBody) return console.error("Modal no encontrado.");
    modalBody.innerHTML = html;

    modalBody.querySelectorAll('.section-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const section = toggle.closest('.details-section');
            if (!section) return;
            section.classList.toggle('expanded');
            const content = section.querySelector('.section-content');
            const icon = toggle.querySelector('.icon');
            const expanded = section.classList.contains('expanded');
            content.classList.toggle('hidden-content', !expanded);
            if (icon) icon.textContent = expanded ? '?' : '?';
        });
    });

    initBlinds(template.blindStructure.levels);
}

function fillTemplateDetails(detailsHTML, template) {
    const entryCost = template.mainEntry ? (template.mainEntry.costCents / 100).toFixed(2) : '0.00';
    const rake = template.mainEntry ? (template.mainEntry.rakeCents / 100).toFixed(2) : '0.00';
    const stackInBB = template.getInitialStackInBB?.();
    const displayBB = stackInBB ? stackInBB.toFixed(0) : 'N/A';

    let html = detailsHTML
        .replace(/{{ID}}/g, template.id)
        .replace(/{{NAME}}/g, template.name)
        .replace(/{{DESCRIPTION}}/g, template.description || '')
        .replace(/{{ENTRY_COST}}/g, entryCost)
        .replace(/{{RAKE}}/g, rake)
        .replace(/{{STACK}}/g, template.mainEntry.stack)
        .replace(/{{STACK_IN_BB}}/g, displayBB)
        .replace('{{BLIND_LEVELS}}', generateBlindsTableHTML(template.blindStructure.levels));

    return html;
}
