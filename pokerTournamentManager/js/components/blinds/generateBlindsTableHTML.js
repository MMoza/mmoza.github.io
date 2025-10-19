export function generateBlindsTableHTML(blindLevels) {
    return blindLevels.map((level, index) => {
        if (level.type === 'break') {
            return `
                <tr class="break-row" data-index="${index}">
                    <td colspan="1"></td>
                    <td colspan="3">DESCANSO</td>
                    <td>
                        <input type="number" name="blindLevels[${index}].durationMinutes" 
                               value="${level.durationMinutes}" min="1">
                    </td>
                    <td><button class="delete-level-button" data-index="${index}">??</button></td>
                </tr>`;
        }

        return `
            <tr data-index="${index}" draggable="true">
                <td>${level.level}</td>
                <td><input type="number" name="blindLevels[${index}].small_blind" value="${level.smallBlind}"></td>
                <td><input type="number" name="blindLevels[${index}].big_blind" value="${level.bigBlind}"></td>
                <td><input type="number" name="blindLevels[${index}].ante" value="${level.ante}"></td>
                <td><input type="number" name="blindLevels[${index}].durationMinutes" value="${level.durationMinutes}"></td>
                <td><button class="delete-level-button" data-index="${index}">??</button></td>
            </tr>`;
    }).join('');
}
