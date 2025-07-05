const DECISION_THRESHOLD = 75
const MAX_IMAGES = 10;
const DEFAULT_LIKE_MESSAGE = '¿Que tal si follamos?';
const DEFAULT_UNLIKE_MESSAGE = 'Yo tampoco te toco ni con un palo'
const MODAL_TYPES = ['likeModal', 'dislikeModal'];

let isAnimating = false
let pullDeltaX = 0
let currentCard = null;
let currentProfiles = [];
let currentProfileIndex = MAX_IMAGES - 1 


const modal = document.getElementById('myModal');
const closeModal = document.getElementById('closeModal');

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
        // Remove the envent listeners
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)

        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)

        // Saber si el usuario ha tomado una decisi�n
        const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD

        if (decisionMade) {
            const goRight = pullDeltaX >= 0

            // recalculate currentIndex
            currentProfileIndex = currentProfileIndex - 1
    
            // add class according to the decision
            actualCard.classList.add(goRight ? 'go-right' : 'go-left')
            actualCard.addEventListener('transitionend', () => {
                actualCard.remove()
            }, { once: true })
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

        console.log(currentCard)
    }
}

async function loadCards() {
    const cardsContainer = document.querySelector(".cards");

    try {
        const res = await fetch("../../data/projects/alocadosTinder/alocadsoData.json");
        const profiles = await res.json();
        const shuffled = profiles.sort(() => 0.5 - Math.random()).slice(0, MAX_IMAGES);
        currentProfiles = shuffled;

        const cardsHTML = shuffled.map((profile, index) => {
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
                Vuelve a intentarlo más tarde
            </span>
        `;

        cardsContainer.innerHTML = cardsHTML + endMessage;;

    } catch (err) {
        cardsContainer.innerHTML = "<p>Error cargando los perfiles.</p>";
        console.error(err);
    }
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

document.addEventListener('mousedown', startDrag)
document.addEventListener('touchstart', startDrag, { passive: true })
document.addEventListener("DOMContentLoaded", loadCards);

document.querySelector('.is-start')?.addEventListener('click', handleInstagramClick);
document.querySelector('.is-undo')?.addEventListener('click', handleUndoClick);
document.querySelector('.is-remove.is-big')?.addEventListener('click', handleDislikeClick);
document.querySelector('.is-fav.is-big')?.addEventListener('click', handleLikeClick);
closeModal?.addEventListener('click', closeModalFn);
window.addEventListener('click', handleWindowClick);