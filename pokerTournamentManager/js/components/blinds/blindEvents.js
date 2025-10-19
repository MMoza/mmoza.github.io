import { reindexBlindInputs, reorderBlindLevelsFromDOM } from '../../utils/domHelpers.js';
import { generateBlindsTableHTML } from './generateBlindsTableHTML.js';

export function initBlinds(blindLevels) {
    const tbody = document.querySelector('#blinds-table-body');
    if (!tbody) return;

    initDeleteButtons(tbody, blindLevels);
    initAddButtons(tbody, blindLevels);
    initDragAndDrop(tbody, blindLevels);
}

function initDeleteButtons(tbody, blindLevels) {
    tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-level-button');
        if (!btn) return;
        const index = parseInt(btn.dataset.index, 10);
        if (!isNaN(index)) blindLevels.splice(index, 1);
        btn.closest('tr')?.remove();
        reindexBlindInputs(tbody);
    });
}

function initAddButtons(tbody, blindLevels) {
    const addLevelBtn = document.querySelector('.add-level-button');
    const addBreakBtn = document.querySelector('.add-break-button');

    addLevelBtn?.addEventListener('click', () => {
        const newLevel = { level: blindLevels.length + 1, smallBlind: 100, bigBlind: 200, ante: 0, durationMinutes: 15, type: 'level' };
        blindLevels.push(newLevel);
        tbody.insertAdjacentHTML('beforeend', generateBlindsTableHTML([newLevel]));
        reindexBlindInputs(tbody);
    });

    addBreakBtn?.addEventListener('click', () => {
        const newBreak = { durationMinutes: 15, type: 'break' };
        blindLevels.push(newBreak);
        tbody.insertAdjacentHTML('beforeend', generateBlindsTableHTML([newBreak]));
        reindexBlindInputs(tbody);
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
        const target = e.target.closest('tr:not(.break-row)');
        if (!target || target === draggedRow) return;
        const { top, height } = target.getBoundingClientRect();
        const offset = e.clientY - top;
        offset > height / 2 ? target.after(draggedRow) : target.before(draggedRow);
    });

    tbody.addEventListener('drop', (e) => {
        e.preventDefault();
        draggedRow?.classList.remove('dragging');
        draggedRow = null;
        reorderBlindLevelsFromDOM(tbody, blindLevels);
        reindexBlindInputs(tbody);
    });

    tbody.addEventListener('dragend', () => {
        draggedRow?.classList.remove('dragging');
        draggedRow = null;
    });
}