console.log("about.js loaded");

const carouselContainer = document.getElementById("skills-carousel");
const skillsFile = "data/skills/skills.json";

let currentIndex = 1;
let totalTranslateX = 0;
const slideInterval = 1000;
let totalSkills = 0;
let interval;
const cardWidth = 80;

async function loadSkills() {
    try {
        const response = await fetch(skillsFile);
        if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");

        const skills = await response.json();
        totalSkills = skills.length;

        renderSkillsCarousel(skills);
        startCarousel();
    } catch (error) {
        console.error("Error al cargar las habilidades:", error);
    }
}

function renderSkillsCarousel(skills) {
    carouselContainer.innerHTML = "";
    const duplicatedSkills = [
        skills[skills.length - 1],
        ...skills,
        skills[0],
        skills[1],
        skills[2],
        skills[3],
        skills[4],
        skills[5],
        skills[6],
    ]

    duplicatedSkills.forEach(skill => {
        const skillCard = document.createElement("div");
        skillCard.classList.add("card-skill-icon");
        skillCard.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}" title="${skill.name}" />
        `;
        carouselContainer.appendChild(skillCard);
    });

    const cardWidth = 80;
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

function moveToNextSlide() {
    const cardWidth = 80;
    const cardMargin = 25;
    const slideWidth = cardWidth + cardMargin;

    currentIndex++;
    totalTranslateX = currentIndex * slideWidth;

    carouselContainer.style.transition = "transform 0.3s ease";
    carouselContainer.style.transform = `translateX(-${totalTranslateX}px)`;

    if (currentIndex === totalSkills + 3) {
        setTimeout(() => {
            carouselContainer.style.transition = "none";
            currentIndex = 1;
            totalTranslateX = slideWidth;
            carouselContainer.style.transform = `translateX(-${totalTranslateX}px)`;
        }, 300);
    }
}

loadSkills();