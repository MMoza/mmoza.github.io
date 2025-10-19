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
/**
 * Busca una plantilla por ID, carga la vista de detalles y actualiza el modal.
 * Esta función asume que window.appTemplates está disponible y que fetchTemplate existe.
 * @param {string} templateId - El ID de la plantilla de torneo seleccionada.
 */
// Asume que generateBlindsTableHTML() existe y está definida en el scope.

async function loadTemplateDetails(templateId) {
    if (!window.appTemplates) {
        console.error("No se encontraron plantillas de torneo globales (window.appTemplates).");
        return;
    }

    const template = window.appTemplates.find(t => t.id.toString() === templateId);

    if (!template) {
        console.error(`Plantilla con ID ${templateId} no encontrada.`);
        return;
    }

    const detailsTemplateHTML = await fetchTemplate('./templates/tournament-details.html');
    
    let html = detailsTemplateHTML;
    
    // --- 1. PREPARACIÓN DE DATOS BASE ---
    
    const entryCost = template.mainEntry ? (template.mainEntry.costCents / 100).toFixed(2) : '0.00';
    const rake = template.mainEntry ? (template.mainEntry.rakeCents / 100).toFixed(2) : '0.00';
    
    const stackInBB = template.getInitialStackInBB ? template.getInitialStackInBB() : null; 
    const displayBB = stackInBB !== null ? stackInBB.toFixed(0) : 'N/A';
    
    const earlyBirdStack = template.earlyBirdStack !== undefined ? template.earlyBirdStack : 0;
    
    const lateBuyInLimit = template.lateBuyInLimitLevel || template['lateBuyInLimitLevel:'] || 0;


    // --- 2. PREPARACIÓN DE DATOS DE BOUNTY ---
    const bounty = template.bounty;
    const isBountyEnabled = !!bounty;
    const bountyType = bounty ? bounty.type.toUpperCase() : 'REGULAR';
    
    let bountyConfigFields = '';
    
    if (bountyType === 'PROGRESIVE' && bounty) {
        bountyConfigFields = `
            <ul>
                <li>
                    <label for="splitPercentage">División al Matar (%):</label>
                    <input type="number" id="splitPercentage" name="bounty.splitPercentage" value="${bounty.splitPercentage || 0}" min="0" max="100">
                </li>
                <li>
                    <label for="bountyIncreasePercentage">Incremento del Bounty (%):</label>
                    <input type="number" id="bountyIncreasePercentage" name="bounty.bountyIncreasePercentage" value="${bounty.bountyIncreasePercentage || 0}" min="0" max="100">
                </li>
            </ul>
        `;
    } 


    // --- 3. PREPARACIÓN DE DATOS DE RECOMPRAS/REENTRADAS ---
    const reEntry = template.reEntry;
    const reBuyIn = template.reBuyIn;
    
    let typeChecked = {
        'NONE': !(reEntry || reBuyIn) ? 'checked' : '',
        'REENTRY': reEntry ? 'checked' : '',
        'REBUY': reBuyIn ? 'checked' : ''
    };
    
    const reEntryMax = reEntry ? reEntry.maxEntries : 0;
    const reEntryLimit = reEntry ? reEntry.levelLimit : lateBuyInLimit;

    const reBuyUnlimitedChecked = (reBuyIn && reBuyIn.isUnlimited) ? 'checked' : '';
    const reBuyMax = (reBuyIn && reBuyIn.maxReBuys) ? reBuyIn.maxReBuys : 0;
    const reBuyLimit = (reBuyIn && reBuyIn.levelLimit) ? reBuyIn.levelLimit : lateBuyInLimit;


    // --- 4. PREPARACIÓN DE DATOS DE ADD-ON ---
    const addOn = template.addOn;
    const isAddOnChecked = !!addOn ? 'checked' : '';
    
    const addOnLevel = addOn ? addOn.level : (lateBuyInLimit + 1);
    const addOnStack = addOn ? addOn.entryDetails.stack : 0;
    const addOnCost = addOn ? (addOn.entryDetails.costCents / 100).toFixed(2) : '0.00';


    // --- 5. RELLENAR PLACEHOLDERS ---

    // Generales
    html = html.replace(/{{ID}}/g, template.id);
    html = html.replace(/{{NAME}}/g, template.name);
    html = html.replace(/{{DESCRIPTION}}/g, template.description || '');
    html = html.replace(/{{ENTRY_COST}}/g, entryCost);
    html = html.replace(/{{RAKE}}/g, rake);
    html = html.replace(/{{STACK}}/g, template.mainEntry.stack);
    html = html.replace(/{{EARLY_BIRD}}/g, earlyBirdStack);
    html = html.replace(/{{STACK_IN_BB}}/g, displayBB);
    html = html.replace(/{{TABLE_SIZE}}/g, template.tableSize);
    html = html.replace(/{{FINAL_TABLE_SIZE}}/g, template.finalTableSize);
    
    // Bounties
    html = html.replace(/{{BOUNTY_CHECKED}}/g, isBountyEnabled ? 'checked' : '');
    html = html.replace(/{{BOUNTY_REGULAR_SELECTED}}/g, bountyType === 'REGULAR' ? 'selected' : '');
    html = html.replace(/{{BOUNTY_PROGRESSIVE_SELECTED}}/g, bountyType === 'PROGRESIVE' ? 'selected' : '');
    html = html.replace(/{{BOUNTY_MYSTERY_SELECTED}}/g, bountyType === 'MYSTERY' ? 'selected' : '');
    html = html.replace(/{{BOUNTY_CONFIG_FIELDS}}/g, bountyConfigFields);

    // Recompras/Reentradas
    html = html.replace(/{{NONE_CHECKED}}/g, typeChecked.NONE);
    html = html.replace(/{{REENTRY_CHECKED}}/g, typeChecked.REENTRY);
    html = html.replace(/{{REBUY_CHECKED}}/g, typeChecked.REBUY);
    html = html.replace(/{{REENTRY_MAX}}/g, reEntryMax);
    html = html.replace(/{{REENTRY_LIMIT}}/g, reEntryLimit);
    html = html.replace(/{{REBUY_UNLIMITED_CHECKED}}/g, reBuyUnlimitedChecked);
    html = html.replace(/{{REBUY_MAX}}/g, reBuyMax);
    html = html.replace(/{{REBUY_LIMIT}}/g, reBuyLimit);

    // Add-On
    html = html.replace(/{{ADDON_CHECKED}}/g, isAddOnChecked);
    html = html.replace(/{{ADDON_LEVEL}}/g, addOnLevel);
    html = html.replace(/{{ADDON_STACK}}/g, addOnStack);
    html = html.replace(/{{ADDON_COST}}/g, addOnCost);

    // ESTRUCTURA DE CIEGAS:
    const blindsTableHTML = generateBlindsTableHTML(template.blindStructure.levels);
    html = html.replace('{{BLIND_LEVELS}}', blindsTableHTML);
    
    // --- 6. ACTUALIZAR MODAL Y CONFIGURAR LISTENERS ---
    
    const modalBodyElement = document.querySelector('.modal-overlay .modal-body');

    if (modalBodyElement) {
        modalBodyElement.innerHTML = html;
        
        // --- Listener para Plegar/Desplegar Secciones (Acordeón) ---
        const toggleElements = modalBodyElement.querySelectorAll('.section-toggle');
        
        toggleElements.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const section = toggle.closest('.details-section');
                
                if (section) {
                    section.classList.toggle('expanded'); 
                    
                    const content = section.querySelector('.section-content');
                    const icon = toggle.querySelector('.icon');

                    if (section.classList.contains('expanded')) {
                        content.classList.remove('hidden-content');
                        if (icon) icon.textContent = '▼';
                    } else {
                        content.classList.add('hidden-content');
                        if (icon) icon.textContent = '►';
                    }
                }
            });
        });
        
        initBlindStructureEvents('#blinds-table-body', template.blindStructure.levels);
        initDragAndDrop(document.querySelector('#blinds-table-body'), template.blindStructure.levels);
        initAddButtons('#blinds-table-body', template.blindStructure.levels);

    } else {
        console.error("El cuerpo del modal no fue encontrado.");
    }
}

/**
 * Genera el HTML de las filas para la tabla de estructura de ciegas.
 * @param {Array<Object>} blindLevels - Array de objetos de niveles de ciegas.
 * @returns {string} HTML de las filas de la tabla.
 */
function generateBlindsTableHTML(blindLevels) {
    let html = '';

    blindLevels.forEach((levelData, index) => {
        
        // Manejar el caso de 'break'
        if (levelData.type === 'break') {
            html += `
                <tr class="break-row" data-index="${index}">
                    <td colspan="4">DESCANSO</td> <td>
                        <input type="number" name="blindLevels[${index}].durationMinutes" value="${levelData.durationMinutes}" min="1">
                    </td>
                    <td>
                        <button type="button" class="delete-level-button" data-index="${index}">
                            <i class="fas fa-trash"></i> 
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        // Usamos el índice como clave del array para el formulario: blindLevels[i].campo
        html += `
            <tr data-level="${levelData.level}" data-index="${index}" draggable="true">
                <td>${levelData.level}</td>
                <td>
                    <input type="number" name="blindLevels[${index}].small_blind" value="${levelData.smallBlind}" step="1" min="1">
                </td>
                <td>
                    <input type="number" name="blindLevels[${index}].big_blind" value="${levelData.bigBlind}" step="1" min="0">
                </td>
                <td>
                    <input type="number" name="blindLevels[${index}].ante" value="${levelData.ante}" step="1" min="0">
                </td>
                <td>
                    <input type="number" name="blindLevels[${index}].durationMinutes" value="${levelData.durationMinutes}" min="1">
                </td>
                <td>
                    <button type="button" class="delete-level-button" data-index="${index}">
                        <i class="fas fa-trash"></i> 
                    </button>
                </td>
            </tr>
        `;
    });

    return html;
}

function initBlindStructureEvents(containerSelector, blindLevels) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.delete-level-button');
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const index = parseInt(deleteBtn.dataset.index, 10);

            if (!isNaN(index)) blindLevels.splice(index, 1);
            row.remove();
            reindexBlindInputs(container);
        }
    });

    container.addEventListener('click', function (e) {
        const addBtn = e.target.closest('.add-level-button');
        if (addBtn) {
            const newLevel = {
                level: blindLevels.length + 1,
                smallBlind: 100,
                bigBlind: 200,
                ante: 0,
                durationMinutes: 15,
                type: 'level'
            };

            blindLevels.push(newLevel);

            // Añadir la nueva fila al final
            const tableBody = container.querySelector('tbody');
            tableBody.insertAdjacentHTML('beforeend', generateBlindsTableHTML([newLevel]));

            reindexBlindInputs(container);
        }
    });
}

/**
 * Reindexa los inputs, data-index y la numeración de niveles,
 * respetando los descansos (breaks).
 * @param {HTMLElement} container - El tbody o tabla donde están las filas.
 */
function reindexBlindInputs(container) {
    const rows = container.querySelectorAll('tr[data-index]');
    let levelCounter = 1;

    rows.forEach((row, i) => {
        const isBreak = row.classList.contains('break-row');
        row.dataset.index = i;

        // Actualizar los atributos de inputs y botones
        row.querySelectorAll('input, button').forEach((el) => {
            if (el.name) el.name = el.name.replace(/\[.*?\]/, `[${i}]`);
            if (el.dataset.index !== undefined) el.dataset.index = i;
        });

        // 🧮 Actualizar numeración visible solo para niveles normales
        if (!isBreak) {
            const levelCell = row.querySelector('td:first-child');
            if (levelCell) levelCell.textContent = levelCounter;
            levelCounter++;
        } else {
            const firstCell = row.querySelector('td:first-child');
            if (firstCell) firstCell.textContent = 'DESCANSO';
        }
    });
}


function initDragAndDrop(tbody, blindLevels) {
    let draggedRow = null;

    tbody.addEventListener('dragstart', (e) => {
        const row = e.target.closest('tr:not(.break-row)');
        if (!row) return;

        draggedRow = row;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.dataset.index);
        row.classList.add('dragging');
    });

    tbody.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr:not(.break-row)');
        if (!targetRow || targetRow === draggedRow) return;

        const bounding = targetRow.getBoundingClientRect();
        const offset = e.clientY - bounding.top;

        if (offset > bounding.height / 2) {
            targetRow.after(draggedRow);
        } else {
            targetRow.before(draggedRow);
        }
    });

    tbody.addEventListener('drop', (e) => {
        e.preventDefault();
        draggedRow?.classList.remove('dragging');
        draggedRow = null;

        // Actualizar el array y reindexar
        reorderBlindLevelsFromDOM(tbody, blindLevels);
        reindexBlindInputs(tbody);
    });

    tbody.addEventListener('dragend', () => {
        draggedRow?.classList.remove('dragging');
        draggedRow = null;
    });
}

/**
 * Reconstruye el array blindLevels según el orden del DOM,
 * respetando los descansos (type = 'break').
 */
function reorderBlindLevelsFromDOM(tbody, blindLevels) {
    const newOrder = [];
    const rows = tbody.querySelectorAll('tr[data-index]');

    rows.forEach((row) => {
        const oldIndex = parseInt(row.dataset.index, 10);
        if (isNaN(oldIndex)) return;

        const original = blindLevels[oldIndex];
        if (original) {
            newOrder.push({ ...original }); // copiamos el objeto
        }
    });

    // Sustituimos el array original sin perder referencia
    blindLevels.length = 0;
    blindLevels.push(...newOrder);

    // 🔁 Reasignar niveles numéricos secuenciales solo para los que no son break
    let levelCounter = 1;
    blindLevels.forEach((level) => {
        if (level.type !== 'break') {
            level.level = levelCounter++;
        }
    });
}

function initAddButtons(tbodySelector, blindLevels) {
    const tbody = document.querySelector(tbodySelector);

    // ➕ Añadir nivel normal
    const addLevelBtn = document.querySelector('.add-level-button');
    addLevelBtn?.addEventListener('click', () => {
        const newLevel = {
            level: blindLevels.filter(l => l.type !== 'break').length + 1,
            smallBlind: 100,
            bigBlind: 200,
            ante: 0,
            durationMinutes: 15,
            type: 'level'
        };

        blindLevels.push(newLevel);
        tbody.insertAdjacentHTML('beforeend', generateBlindsTableHTML([newLevel]));
        reindexBlindInputs(tbody);
    });

    // ☕ Añadir break
    const addBreakBtn = document.querySelector('.add-break-button');
    addBreakBtn?.addEventListener('click', () => {
        const newBreak = {
            durationMinutes: 15,
            type: 'break'
        };

        blindLevels.push(newBreak);
        tbody.insertAdjacentHTML('beforeend', generateBlindsTableHTML([newBreak]));
        reindexBlindInputs(tbody);
    });
}
