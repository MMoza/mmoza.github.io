import { loadTemplateDetails } from './loadTemplateDetails.js';

export function renderTemplates(templates, templateHTML, tagTemplates) {
    const container = document.getElementById('template-list');
    if (!container) return console.error("No se encontró #template-list");

    if (!templates?.length) {
        container.innerHTML = '<p>No se encontraron plantillas de torneo.</p>';
        return;
    }

    container.innerHTML = '';

    templates.forEach(template => {
        const html = buildCardHTML(template, templateHTML, tagTemplates);
        container.insertAdjacentHTML('beforeend', html);
    });

    container.querySelectorAll('.select-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.templateId;
            if (id) loadTemplateDetails(id);
        });
    });

    console.log(`Renderizadas ${templates.length} plantillas.`);
}

function buildCardHTML(template, baseHTML, tagTemplates) {
    const entryCost = template.mainEntry
        ? (template.mainEntry.costCents / 100).toFixed(2)
        : 'N/A';
    const stackInBB = template.getInitialStackInBB?.() ?? null;
    const displayBB = stackInBB ? stackInBB.toFixed(0) : 'N/A';

    let html = baseHTML
        .replace(/{{ID}}/g, template.id)
        .replace(/{{NAME}}/g, template.name)
        .replace(/{{TYPE}}/g, template.description || 'Torneo Estándar')
        .replace(/{{ENTRY_COST}}/g, entryCost)
        .replace(/{{STACK}}/g, template.mainEntry.stack)
        .replace(/{{STACK_IN_BB}}/g, displayBB);

    const tags = [];

    if (template.tableSize)
        tags.push(`<span class="tag tag-table-size">${template.tableSize}-MAX</span>`);

    const bounty = template.bounty;
    if (bounty) {
        const type = bounty.type?.toUpperCase();
        if (type === 'REGULAR') tags.push(tagTemplates.regularBounty);
        else if (type === 'PROGRESIVE')
            tags.push(tagTemplates.progressiveBounty.replace(/{{SPLIT}}/g, bounty.splitPercentage));
        else if (type === 'MYSTERY') tags.push(tagTemplates.mysteryBounty);
    }

    if (template.reEntry)
        tags.push(tagTemplates.reEntry.replace(/{{MAX_ENTRIES}}/g, template.reEntry.maxEntries));
    if (template.reBuyIn) tags.push(tagTemplates.reBuyIn);
    if (template.addOn) tags.push(tagTemplates.addOn);

    html = html.replace(/{{TAGS}}/g, tags.join(''));
    return html.replace(/{{[A-Z_]+}}/g, '');
}
