import { fetchTemplate } from '../../utils/templateLoader.js';

let spinnerTemplate = null;

/**
 * Muestra el spinner como overlay centrado sobre `container`.
 * - `container` puede ser:
 *   - Element: se añade un overlay absoluto dentro del elemento (cubre el área del elemento).
 *   - selector string: se hace document.querySelector(selector) y se usa ese elemento.
 *   - undefined/null: se añade un overlay fijo (full-screen) al body con id="loading-spinner-component".
 */
export async function showLoadingSpinner(container) {
    // resolver target
    let target = null;
    if (typeof container === 'string') target = document.querySelector(container);
    else if (container instanceof Element) target = container;

    // cargar template (cache)
    if (!spinnerTemplate) {
        try {
            spinnerTemplate = await fetchTemplate('./templates/loading-spinner.html');
        } catch (err) {
            console.error('No se pudo cargar template de spinner:', err);
            spinnerTemplate = null;
        }
    }

    // Si target existe, colocar overlay absoluto dentro de él; si no, overlay fijo en body
    if (target) {
        // Evitar duplicados
        if (target.querySelector(':scope > .loading-spinner-overlay')) return;

        // Asegurar que target puede posicionar children absolutos
        const cs = window.getComputedStyle(target);
        if (cs.position === 'static') {
            // marcar para restaurar si es necesario
            target.dataset._lsOriginalPosition = 'static';
            target.style.position = 'relative';
        }

        const overlay = document.createElement('div');
        overlay.className = 'loading-spinner-overlay';
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'polite');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(255,255,255,0.6)'; // ligera máscara sobre el contenedor
        overlay.style.zIndex = '9999';

        if (spinnerTemplate) {
            overlay.innerHTML = spinnerTemplate;
        } else {
            overlay.innerHTML = `
              <div class="loading-spinner-fallback" style="display:flex;flex-direction:column;align-items:center;gap:8px">
                <div style="width:36px;height:36px;border:4px solid #e6e6e6;border-top-color:#3b82f6;border-radius:50%;animation:ls-spin 1s linear infinite"></div>
                <p style="margin:0;font-size:13px;color:#222">Cargando...</p>
              </div>
              <style>@keyframes ls-spin{ to { transform: rotate(360deg); } }</style>
            `;
        }

        target.appendChild(overlay);
        return;
    }

    // Sin target: overlay full-screen en body
    if (document.getElementById('loading-spinner-component')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'loading-spinner-component';
    wrapper.setAttribute('role', 'status');
    wrapper.setAttribute('aria-live', 'polite');
    wrapper.style.position = 'fixed';
    wrapper.style.inset = '0';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'rgba(0,0,0,0.35)';
    wrapper.style.zIndex = '9999';

    if (spinnerTemplate) {
        wrapper.innerHTML = spinnerTemplate;
    } else {
        wrapper.innerHTML = `
          <div class="loading-spinner-fallback" style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <div style="width:36px;height:36px;border:4px solid #e6e6e6;border-top-color:#3b82f6;border-radius:50%;animation:ls-spin 1s linear infinite"></div>
            <p style="margin:0;font-size:13px;color:#fff">Cargando...</p>
          </div>
          <style>@keyframes ls-spin{ to { transform: rotate(360deg); } }</style>
        `;
    }

    document.body.appendChild(wrapper);
}

/**
 * Oculta/elimina el spinner.
 * - `container` puede ser selector string / Element para eliminar el overlay dentro de ese contenedor.
 * - si no se pasa `container`, elimina el overlay global con id="loading-spinner-component".
 */
export function hideLoadingSpinner(container) {
    let el = null;
    if (typeof container === 'string') el = document.querySelector(container);
    else if (container instanceof Element) el = container;

    if (el) {
        // intentar quitar overlay dentro del elemento
        const overlay = el.querySelector(':scope > .loading-spinner-overlay');
        if (overlay) {
            overlay.remove();
        } else {
            // si el propio elemento es el wrapper global
            if (el.id === 'loading-spinner-component') el.remove();
            else {
                // limpiar contenido por compatibilidad
                el.innerHTML = '';
            }
        }

        // restaurar posición si se modificó
        if (el.dataset && el.dataset._lsOriginalPosition === 'static') {
            el.style.position = '';
            delete el.dataset._lsOriginalPosition;
        }
        return;
    }

    // eliminar overlay global
    const global = document.getElementById('loading-spinner-component');
    if (global) {
        global.remove();
        return;
    }

    // eliminar primer overlay localizado en DOM (fallback)
    const anyOverlay = document.querySelector('.loading-spinner-overlay, .loading-spinner-fallback, .loading-spinner-component');
    if (anyOverlay) anyOverlay.remove();
}