/**
 * Reindexa los inputs de los niveles de ciegas en el DOM.
 */
export function reindexBlindInputs(container) {
    const rows = container.querySelectorAll('tr[data-index]');
    let levelCounter = 1;

    rows.forEach((row, i) => {
        const isBreak = row.classList.contains('break-row');
        row.dataset.index = i;

        row.querySelectorAll('input, button').forEach(el => {
            if (el.name) el.name = el.name.replace(/\[.*?\]/, `[${i}]`);
            if (el.dataset.index !== undefined) el.dataset.index = i;
        });

        if (!isBreak) {
            const levelCell = row.querySelector('td:first-child');
            if (levelCell) levelCell.textContent = levelCounter++;
        }
    });
}

/**
 * Reordena el array de niveles de ciegas según el DOM.
 */
export function reorderBlindLevelsFromDOM(tbody, blindLevels) {
    const newOrder = Array.from(tbody.querySelectorAll('tr[data-index]')).map(row => {
        const oldIndex = parseInt(row.dataset.index, 10);
        return blindLevels[oldIndex];
    }).filter(Boolean);

    blindLevels.length = 0;
    blindLevels.push(...newOrder);

    let levelCounter = 1;
    blindLevels.forEach(level => {
        if (level.type !== 'break') level.level = levelCounter++;
    });
}
