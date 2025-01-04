console.log("about.js loaded");

const carouselContainer = document.getElementById("skills-carousel");
const skillsFile = "data/skills/skills.json";

let currentIndex = 1;
const slideInterval = 3000;
let totalSkills = 0;
let interval;

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

    // Duplicar elementos (último al inicio y primero al final)
    const duplicatedSkills = [
        skills[skills.length - 1], // Último al principio
        ...skills,                 // Elementos originales
        skills[0]                  // Primero al final
    ];

    duplicatedSkills.forEach(skill => {
        const skillCard = document.createElement("div");
        skillCard.classList.add("card-skill-icon");
        skillCard.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}" title="${skill.name}" />
        `;
        carouselContainer.appendChild(skillCard);
    });

    // Establecer el ancho del contenedor para permitir el desplazamiento
    const cardWidth = 120; // Ancho fijo (ajusta según diseño)
    carouselContainer.style.width = `${duplicatedSkills.length * cardWidth}px`;

    // Desplazar al primer elemento real
    carouselContainer.style.transform = `translateX(-${cardWidth}px)`;
}

function startCarousel() {
    const cardWidth = 100; // Ancho fijo (ajusta según diseño)

    interval = setInterval(() => {
        currentIndex++;

        // Mover el carrusel
        carouselContainer.style.transition = "transform 0.5s ease";
        carouselContainer.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

        // Reiniciar sin pausa si llega al final
        if (currentIndex === totalSkills + 1) {
            setTimeout(() => {
                carouselContainer.style.transition = "none"; // Eliminar transición
                carouselContainer.style.transform = `translateX(-${cardWidth}px)`; // Volver al primer elemento real
                currentIndex = 1; // Reiniciar índice
            }, 500); // Igual al tiempo de transición
        }
    }, slideInterval);
}

loadSkills();