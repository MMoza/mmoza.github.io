const carouselContainer = document.getElementById("skills-carousel");
const skillsFile = "data/skills/skills.json";

let currentIndex = 1;
let totalTranslateX = 0;
const slideInterval = 1500;
let totalSkills = 0;
let interval;
const cardWidth = 50;
const host = window.location.host === '127.0.0.1:3000' ? window.location.origin + '/portfolio_web' : window.location.origin;

async function loadSkills() {
    try {
        const response = await fetch(skillsFile);
        if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");

        const skills = await response.json();
        totalSkills = skills.length;

        renderSkillsCarousel(skills);
        startCarousel();
        addPauseOnHover();
    } catch (error) {
        console.error("Error al cargar las habilidades:", error);
    }
}

function renderSkillsCarousel(skills) {
    carouselContainer.innerHTML = "";
    const duplicatedSkills = [
        skills[skills.length - 4],
        skills[skills.length - 3],
        skills[skills.length - 2],
        skills[skills.length - 1],
        ...skills,
        skills[0],
        skills[1],
        skills[2],
        skills[3],
        skills[4],
        skills[5],
        skills[6],
        skills[7],
        skills[8],
    ]

    duplicatedSkills.forEach(skill => {
        const skillCard = document.createElement("div");
        const iconUrl = `${host}/${skill.icon}`;

        skillCard.classList.add("card-skill-icon");
        skillCard.innerHTML = `
            <img src="${iconUrl}" alt="${skill.name}" title="${skill.name}" />
        `;
        carouselContainer.appendChild(skillCard);
    });

    const cardWidth = 50;
    const cardMargin = 25;
    const totalWidth = (duplicatedSkills.length * (cardWidth + cardMargin * 2));
    carouselContainer.style.width = `${totalWidth}px`;
    
    carouselContainer.style.transform = `translateX(-${cardWidth + cardMargin}px)`;
}

function startCarousel() {
    interval = setInterval(() => {
        moveToNextSlide();
    }, slideInterval);
}

function stopCarousel() {
    clearInterval(interval);
}

function moveToNextSlide() {
    const cardWidth = 50;
    const cardMargin = 25;
    const slideWidth = cardWidth + cardMargin;

    currentIndex++;
    totalTranslateX = currentIndex * slideWidth;

    carouselContainer.style.transition = "transform 0.3s ease";
    carouselContainer.style.transform = `translateX(-${totalTranslateX}px)`;

    if (currentIndex === totalSkills + 5) {
        setTimeout(() => {
            carouselContainer.style.transition = "none";
            currentIndex = 1;
            totalTranslateX = slideWidth;
            carouselContainer.style.transform = `translateX(-${slideWidth - cardMargin}px)`;
        }, 300);
    }
}

function addPauseOnHover() {
    carouselContainer.addEventListener("mouseenter", stopCarousel);
    carouselContainer.addEventListener("mouseleave", startCarousel);
}

loadSkills();