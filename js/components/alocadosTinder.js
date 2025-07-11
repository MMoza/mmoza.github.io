const DECISION_THRESHOLD = 75
const MAX_IMAGES = 10;
const DEFAULT_LIKE_MESSAGE = '¿Que tal si follamos?';
const DEFAULT_UNLIKE_MESSAGE = 'Yo tampoco te toco ni con un palo'
const MODAL_TYPES = ['likeModal', 'dislikeModal'];
const RELOAD_TIME = 10 * 60 * 1000;

let isAnimating = false
let pullDeltaX = 0
let currentCard = null;
let currentProfiles = [];
let currentProfileIndex = MAX_IMAGES - 1 


const modal = document.getElementById('myModal');
const closeModal = document.getElementById('closeModal');
const cancelButton = document.querySelector('.cancelButton')
const aceptButton = document.querySelector('.aceptButton')

function startDrag (e) {
    if (isAnimating) return

    const actualCard = e.target.closest('article')

    if(!actualCard) return

    const profileIndex = Number(actualCard.dataset.index);
    const currentProfile = currentProfiles[profileIndex];
    currentCard = actualCard; // asignamos globalmente

    console.log("Perfil actual:", currentProfile);

    const startX = e.pageX ?? e.touches[0].pageX
    
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)

    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })

    function onMove(e) {
        // Current postion of mouse or finger
        const currentX = e.pageX ?? e.touches[0].pageX
        
        // Distance between the initial and current position
        pullDeltaX = currentX - startX

        // Si no hay distancia recorrida
        if (pullDeltaX === 0) return

        // Indicamos que estamos animando
        isAnimating = true

        // calculate de rotation of the card using the distance
        const deg = pullDeltaX / 14

        // apply transofrmation and styles to card
        actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`
        actualCard.style.cursor = 'grabbing'

        // currentCard
        currentCard = actualCard

        // Change opacity of the choice info
        const opacity = Math.abs(pullDeltaX) / 100
        const isRight = pullDeltaX > 0

        const choiceEl = isRight ? actualCard.querySelector('.choice.like') : actualCard.querySelector('.choice.nope')

        choiceEl.style.opacity = opacity
    }
    
    function onEnd(e) {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)

        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)

        const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD

        if (decisionMade) {
            const goRight = pullDeltaX >= 0
    
            actualCard.classList.add(goRight ? 'go-right' : 'go-left')
            actualCard.addEventListener('transitionend', () => {
                actualCard.remove()
            }, { once: true })

            const profile = currentProfiles[currentProfileIndex];
            saveDecision(profile.name, goRight ? 'like' : 'dislike');

            currentProfileIndex = currentProfileIndex - 1

        } else {
            actualCard.classList.add('reset')
            actualCard.classList.remove('go-right', 'go-left')
    
            actualCard.querySelectorAll('.choice').forEach(choice => {
              choice.style.opacity = 0
            })
        }

        // reset the variables
        actualCard.addEventListener('transitionend', () => {
            actualCard.removeAttribute('style')
            actualCard.classList.remove('reset')

            pullDeltaX = 0
            isAnimating = false
        })

        // reset the choice info opacity
        actualCard
            .querySelectorAll(".choice")
            .forEach((el) => (el.style.opacity = 0));

        checkEmptyCards()
    }
}

async function loadCards() {
    const cardsContainer = document.querySelector(".cards");
    const header = document.querySelector("header");

    cleanOldDecisions();
    const decisions = JSON.parse(localStorage.getItem('alocados-decisions')) || [];

    showLoading(cardsContainer, header);

    try {
        const profiles = await fetchProfiles("../../data/projects/alocadosTinder/alocadsoData.json");

        const decisionNames = new Set(decisions.map(d => d.name));
        const filteredProfiles = profiles.filter(profile => !decisionNames.has(profile.name));

        const shuffled = shuffleAndSliceProfiles(filteredProfiles, MAX_IMAGES);

        if (shuffled.length === 0) {
            const seconds = getSecondsUntilNextProfile(decisions);

            if (seconds !== null) {
                header.classList.add("visible");

                showCountdown(cardsContainer, seconds);
            } else {
                cardsContainer.innerHTML = "<p>No hay perfiles disponibles en este momento.</p>";
            }

            return;
        }

        currentProfiles = shuffled;
        currentProfileIndex = shuffled.length - 1;

        await delay(500);
        header.classList.add("visible");

        await delay(500);
        renderCards(cardsContainer, shuffled);
        animateCards(cardsContainer);

    } catch (err) {
        cardsContainer.innerHTML = "<p>Error cargando los perfiles.</p>";
        console.error(err);
    }
}

function showLoading(container, header) {
    container.innerHTML = `<div class="loading-spinner"></div>`;
    header.classList.remove("visible");
}

async function fetchProfiles(url) {
    const res = await fetch(url);
    return res.json();
}

function shuffleAndSliceProfiles(profiles, max) {
    return profiles.sort(() => 0.5 - Math.random()).slice(0, max);
}

function renderCards(container, profiles) {
    const cardsHTML = profiles.map((profile, index) => {
        return `
            <article data-index="${index}">
                <img src="../../data/projects/alocadosTinder/${profile.image}" alt="${profile.name}, ${profile.age} años">
                <h2>${profile.name} <span>${profile.age}</span></h2>
                <h3>${profile.description}</h3>
                <div class="choice nope">NOPE</div>
                <div class="choice like">LIKE</div>
            </article>
        `;
    }).join("");

    const endMessage = `
        <span class="end-message">
            No hay más Alocados cerca de ti... <br />
            Amplie el rango de búsqueda para ver más
        </span>
        <button class="reload" aria-label="Recargar">Ver más</button>
        <span class="footer-creedits">
            Desarrollado por 
            <a href="https://mmoza.github.io/" target="_blank" rel="noopener">
                <strong>Miguel Ángel Moza Barquilla</strong>
            </a>
            a partir del proyecto 
            <a href="https://www.javascript100.dev/01-tinder-swipe" target="_blank" rel="noopener">
                <strong>01-tinder-swipe</strong>
            </a> de 
            <a href="https://midu.dev/" target="_blank" rel="noopener">
                <strong>@midudev</strong>
            </a>
        </span>
    `;

    container.innerHTML = cardsHTML + endMessage;
}

function animateCards(container) {
    const articles = container.querySelectorAll("article");
    articles.forEach((article, index) => {
        setTimeout(() => {
            article.classList.add("visible");
        }, 100 * index);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function handleInstagramClick() {
    const instagramUrl = currentProfiles[currentProfileIndex]?.instagram;
    if (instagramUrl) {
        window.open(instagramUrl, '_blank');
    } else {
        alert('No tiene enlace de Instagram');
    }
}

function handleUndoClick() {
    location.reload();
    currentProfileIndex = MAX_IMAGES - 1;
}

function handleDislikeClick() {
    const message = currentProfiles[currentProfileIndex]?.unlike_message ?? DEFAULT_UNLIKE_MESSAGE;
    const name = currentProfiles[currentProfileIndex]?.name

    openModal('dislikeModal', name, message);
}

function handleLikeClick() {
    const message = currentProfiles[currentProfileIndex]?.like_message ?? DEFAULT_LIKE_MESSAGE;
    const name = currentProfiles[currentProfileIndex]?.name

    openModal('likeModal', name, message);
}

function closeModalFn() {
    modal.style.display = 'none';
    modal.classList.remove('likeModal', 'dislikeModal');
}

function closeModalFn() {
    modal.classList.remove('visible');

    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('likeModal', 'dislikeModal');
    }, 300);
}

function handleWindowClick(e) {
    if (e.target === modal) {
        closeModalFn();
    }
}

function openModal(typeModal, name, message) {
    if (MODAL_TYPES.includes(typeModal)) {
        modal.style.display = 'grid';
        modal.classList.add('visible');
        modal.classList.add(typeModal);

        const $title = modal.querySelector('#modalTitle');
        const $name  = modal.querySelector('#modalMessage .name')
        const $message = modal.querySelector('#modalMessage .message')

        $title.innerHTML = getModalTitle(typeModal);
        $name.innerHTML = name;
        $message.innerHTML = message;
    } else {
        console.warn(`Modal type "${typeModal}" no es válido.`);
    }
}

function getModalTitle(typeModal) {
    if (MODAL_TYPES.includes(typeModal)) {
        return typeModal === 'likeModal' ? 'Me pones 🔥' : 'Siguiente 🤡'
    } else {
        console.warn(`Modal type "${typeModal}" no es válido.`);
    }    
}

function removeCurrentCard(isLike = true) {
    if (isAnimating) return;

    const actualCard = document.querySelector('article[data-index="' + currentProfileIndex + '"]');
    if (!actualCard) return;

    const directionClass = isLike ? 'go-right' : 'go-left';
    const choiceSelector = isLike ? '.choice.like' : '.choice.nope';

    isAnimating = true;

    const choiceEl = actualCard.querySelector(choiceSelector);
    if (choiceEl) {
        choiceEl.style.opacity = 1;
    }

    actualCard.classList.add(directionClass);
    actualCard.addEventListener('transitionend', () => {
        actualCard.remove();
    }, { once: true });

    currentProfileIndex = currentProfileIndex - 1;

    // Resetear variables globales
    setTimeout(() => {
        isAnimating = false;
        pullDeltaX = 0;
    }, 400); // igual a tu duración de transición
}

function showCreditMessage() {
    const footer = document.querySelector('.footer-creedits')
    const button = document.querySelector('button.reload')
    const reloadButton = button;

    reloadButton?.addEventListener('click', handleUndoClick)

    if (!footer) return

    footer.classList.add('visible')

    setTimeout(() => {
        footer.classList.add('drop');
    }, 500);

    setTimeout(() => {
        footer.classList.add('finish')

        if (button) {
            button.classList.add('visible')
        }
    }, 5500)
}

function checkEmptyCards() {
    let container = document.querySelector('.cards')
    if (!container) return

    let cards = container.querySelectorAll('article')

    if (cards.length === 1) {  // <-- Cuando se ejecuta la función aún no ha deseparecido del todo la card
        showCreditMessage()
        //removeButtonActions()
    }
}

document.addEventListener('mousedown', startDrag)
document.addEventListener('touchstart', startDrag, { passive: true })
document.addEventListener("DOMContentLoaded", loadCards);

document.querySelector('.is-start')?.addEventListener('click', handleInstagramClick);
document.querySelector('.is-undo')?.addEventListener('click', handleUndoClick);
document.querySelector('.is-remove.is-big')?.addEventListener('click', handleDislikeClick);
document.querySelector('.is-fav.is-big')?.addEventListener('click', handleLikeClick);
closeModal?.addEventListener('click', closeModalFn);
window.addEventListener('click', handleWindowClick);

cancelButton?.addEventListener('click', () => {
    closeModalFn()
})

aceptButton?.addEventListener('click', () => {
    const isLike = modal.classList.contains('likeModal');

    closeModalFn()
    
    setTimeout(() => {
        removeCurrentCard(isLike);
    }, 300);
})

function saveDecision(name, action) {
    const decisions = JSON.parse(localStorage.getItem('alocados-decisions') || '[]');

    decisions.push({
        name,
        action,
        timestamp: Date.now()
    });

    localStorage.setItem('alocados-decisions', JSON.stringify(decisions));
}

function cleanOldDecisions() {
    const decisions = JSON.parse(localStorage.getItem('alocados-decisions')) || [];
    const now = Date.now();

    const filtered = decisions.filter(d => now - d.timestamp < RELOAD_TIME);
    localStorage.setItem('alocados-decisions', JSON.stringify(filtered));
}

function getSecondsUntilNextProfile(decisions) {
    const now = Date.now();

    const sorted = decisions
        .filter(d => now - d.timestamp < RELOAD_TIME)
        .sort((a, b) => a.timestamp - b.timestamp);

    if (sorted.length === 0) return null;

    const expiresAt = sorted[0].timestamp + RELOAD_TIME;
    const secondsRemaining = Math.ceil((expiresAt - now) / 1000);
    return secondsRemaining > 0 ? secondsRemaining : 0;
}

function showCountdown(container, seconds) {
    let remaining = seconds;

    container.innerHTML = `
        <span class="end-message">
            No hay más Alocados cerca de ti... <br />
            Vuelve a intentarlo dentro de <strong class="timmer-countdown" id="countdown-timer"></strong>
        </span>
        <span class="footer-creedits">
            Desarrollado por 
            <a href="https://mmoza.github.io/" target="_blank" rel="noopener">
                <strong>Miguel Ángel Moza Barquilla</strong>
            </a>
            a partir del proyecto 
            <a href="https://www.javascript100.dev/01-tinder-swipe" target="_blank" rel="noopener">
                <strong>01-tinder-swipe</strong>
            </a> de 
            <a href="https://midu.dev/" target="_blank" rel="noopener">
                <strong>@midudev</strong>
            </a>
        </span>
    `;

    const timerSpan = document.getElementById("countdown-timer");

    const formatTime = (totalSeconds) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const updateTimer = () => {
        timerSpan.textContent = formatTime(remaining);

        if (remaining <= 10) {
            timerSpan.classList.add("low-time");
        } else {
            timerSpan.classList.remove("low-time");
        }
    };

    updateTimer();

    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            handleUndoClick();
        } else {
            updateTimer();
        }
    }, 1000);
}