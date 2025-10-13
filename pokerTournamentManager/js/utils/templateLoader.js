/**
 * Carga el contenido de una plantilla HTML desde un archivo de forma asíncrona.
 * @param {string} path - Ruta al archivo de plantilla (ej: './templates/my-card.html').
 * @returns {Promise<string>} Promesa que resuelve con el contenido HTML de la plantilla.
 */
export async function fetchTemplate(path) {
    try {
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} al cargar la plantilla: ${path}`);
        }
        
        return response.text();
        
    } catch (error) {
        console.error(`Error al intentar cargar la plantilla '${path}':`, error.message);
        
        throw error;
    }
}