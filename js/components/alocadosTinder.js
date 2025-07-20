const DECISION_THRESHOLD = 75
const MAX_IMAGES = 10;
const DEFAULT_LIKE_MESSAGE = '¿Que tal si follamos?';
const DEFAULT_UNLIKE_MESSAGE = 'Yo tampoco te toco ni con un palo'
const MODAL_TYPES = ['likeModal', 'dislikeModal'];
const RELOAD_TIME = 10 * 60 * 1000;
const URL2 = "https://script.google.com/macros/s/AKfycbxRJrKUk97lWLLRKSAlm6OSGZVkAYH_AlKUnzYTZMM_ndfNQ0XVNyl-evZ8S5RLp01f/exec"


let isAnimating = false
let pullDeltaX = 0
let currentCard = null;
let currentProfiles = [];
let currentProfileIndex = MAX_IMAGES - 1 


const modal = document.getElementById('myModal');
const closeModal = document.getElementById('closeModal');
const cancelButton = document.querySelector('.cancelButton')
const aceptButton = document.querySelector('.aceptButton')
const statsButton = document.querySelector('.is-zap')

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
        $name.innerHTML = name + ':';
        $message.innerHTML = message;
    } else {
        console.warn(`Modal type "${typeModal}" no es válido.`);
    }
}

async function openModalSendMessage(name, likes) {
    modal.style.display = 'grid';
    modal.classList.add('visible');

    const $title = modal.querySelector('#modalTitle');
    const $message = modal.querySelector('#modalMessage .message')
    const $name  = modal.querySelector('#modalMessage .name')
    
    const messages = await fetchProfiles("../../data/projects/alocadosTinder/messages.json");

    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomMessage = messages[randomIndex].message.replace(/\$\{name\}/g, name);

    $title.innerHTML = `¿Te gusta <strong>${name}</strong>?`;
    $name.innerHTML = '';
    $message.innerHTML = `
        <p>Ya le has dado <strong>${likes} likes</strong> a <strong id="user-name">${name}</strong>.</p>
        <p>¿Quieres enviarle el siguiente mensaje?</p><br>
    
        <blockquote>
            ${randomMessage}
        </blockquote>

        <p id="countdown">El mensaje se enviará en <strong>5</strong> segundos...</p>
    `;

    initCountDownSendMessage(() => {
        const blocker = document.getElementById('page-blocker');

        setTimeout(() => {
            blocker.style.display = 'none';
            closeModalFn()
        }, 1500)
    })

    saveMessage(name, randomMessage, true)
}

function saveMessage(name, message, send = true) {
    const messagesRaw = localStorage.getItem('alocados-messages');
    let messagesData = messagesRaw ? JSON.parse(messagesRaw) : {};

    if (!messagesData[name]) {
        messagesData[name] = [];
    }

    messagesData[name].push({
        text: message,
        sent: send,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('alocados-messages', JSON.stringify(messagesData));
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

    setTimeout(() => {
        isAnimating = false;
        pullDeltaX = 0;
    }, 400);
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
        const button = document.querySelector('button.reload')

        button?.addEventListener('click', handleUndoClick)

        setTimeout(() => {    
            if (button) {
                button.classList.add('visible')
            }
        }, 1500)
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
statsButton?.addEventListener('click', handleInterface)

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
    // Guardar historial de decisiones
    const decisions = JSON.parse(localStorage.getItem('alocados-decisions') || '[]');

    decisions.push({
        name,
        action,
        timestamp: Date.now()
    });

    localStorage.setItem('alocados-decisions', JSON.stringify(decisions));

    const summary = JSON.parse(localStorage.getItem('alocados-summary') || '[]');
    const entry = summary.find(item => item.name === name);

    if (entry) {
        if (action === 'like') {
            entry.likes += 1;
    
            if (entry.likes % 5 === 0) {
                showMessageLike(name, entry.likes);
            }
        } else if (action === 'dislike') {
            entry.dislikes += 1;
        }
    } else {
        const newEntry = {
            name,
            likes: action === 'like' ? 1 : 0,
            dislikes: action === 'dislike' ? 1 : 0
        };
    
        // Si es el primer like y es múltiplo de 5
        if (newEntry.likes > 0 && newEntry.likes % 5 === 0) {
            showMessageLike(name, newEntry.likes);
        }
    
        summary.push(newEntry);
    }

    localStorage.setItem('alocados-summary', JSON.stringify(summary));

    saveData(name, action);
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

function showMessageLike(name, likes) {

    openModalSendMessage(name, likes)
}

function initCountDownSendMessage(callback) {
    const blocker = document.getElementById('page-blocker');
    const countdownEl = document.getElementById('countdown');
    let seconds = 5;
    blocker.style.display = 'block';

    const intervalo = setInterval(() => {
        seconds--;
        countdownEl.innerHTML = `El mensaje se enviará en <strong>${seconds}</strong> segundos...`;

        if (seconds <= 0) {
            clearInterval(intervalo);
            countdownEl.innerHTML = `<strong>Mensaje enviado ✅</strong>`;

            // Desactivar el bloqueo
            blocker.style.display = 'none';

            callback();
        }
    }, 1000);
}

function handleInterface(evnt, tinderGame = false) {
    if(tinderGame) {
        handleUndoClick
    }

    if(!tinderGame) {
        showStats()
    }
}

function showStats() {
    const cards = document.querySelector('.cards');
    const buttons = document.querySelector('.action-buttons');

    if (cards) cards.remove();
    if (buttons) buttons.remove();

    showStatsInterface()

    /* showTopLikes()
    showTopDislike()
    showYourCrush()
    showfindAnAloado()
    showFooterApp() */
}

function saveData(name, action) {
    fetch(URL2, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ name: name, action: action }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(console.log);
}

function getData(name, action) {
    const params = new URLSearchParams({ name, action });

    fetch(`${URL2}?${params.toString()}`)
        .then(res => res.json())
        .then(data => console.log(data.count))
        .catch(console.error);
}

function getTopNames(action) {
    const params = new URLSearchParams({ top: 'true', action });

    fetch(`${URL2}?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            console.log("Top 5:", data.top);
        })
        .catch(console.error);
}

function showStatsInterface() {
    const section = document.querySelector('section');
    if (!section) return;

    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats-interface';

    statsDiv.innerHTML = `
        <header class="visible">
            <img src="../data/projects/alocadosTinder/assets/image/tinder-logo.webp" alt="Tinder Logo">
            <span><span class="first-letter">J</span>ÓVENES</span>
            <span> 🍸 </span>
            <span><span class="first-letter">A</span>LOCADOS</span>
        </header>

        <button class="back-button" aria-label="Atrás"><i class="fa-solid fa-arrow-left"></i></button>
        
        <div class="stats-content">
            <div class="stats-card messages">
                <i class="fa-solid fa-message"></i> Mensajes
            </div>
            <div class="stats-card top-likes">
                <i class="fas fa-heart"></i> Los más buscado
            </div>
            <div class="stats-card top-dislike">
                <i class="fas fa-thumbs-down"></i> Los menos agraciados
            </div>
            <div class="stats-card find-an-alocado">
                <i class="fas fa-search"></i> Encuentra un Alocado
            </div>
            <div class="stats-card your-crush">
                <i class="fa-solid fa-user-secret"></i> Descubre tu Crush
            </div>
        </div>

        <footer class="stats-footer">
        <p>
            Web desarrollada por <a href="https://github.com/midudev" target="_blank">@mmoza</a> a partir del proyecto <a href="https://github.com/midudev" target="_blank">01-tinder-swipe</a> de <a href="https://github.com/midudev" target="_blank">@midudev</a>.<br>
        </p>
        <p>
            Jóvenes 🍸 Álocados - Madroñera 2025
        </p>
        </footer>
    `;

    section.innerHTML = '';
    section.appendChild(statsDiv);

    const backButton = document.querySelector('.back-button');

    backButton?.addEventListener('click', handleUndoClick)
}