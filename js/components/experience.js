const section = document.querySelector("#experience");

const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach(mutation => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            if (section.classList.contains("highlight")) {
                miFuncion();
            }
        }
    });
});

observer.observe(section, { attributes: true });

function miFuncion() {
    const devExperience = document.querySelector("#experiencie-years-dev .number-section");
    const apisIntegrated = document.querySelector("#total-apis .number-section");
    const totalExperience = document.querySelector("#experienci-years-total .number-section");

    animateNumber(devExperience, 2, 500);
    animateNumber(apisIntegrated, 10, 500);
    animateNumber(totalExperience, 10, 500);
}

function animateNumber(element, targetNumber, duration = 1000) {
    const span = element.querySelector(".number");
    if (!span) return;

    const totalFrames = Math.round(duration / 16);
    const increment = targetNumber / totalFrames;
    let currentNumber = 0;
    let frame = 0;

    const animate = () => {
        if (frame < totalFrames) {
            currentNumber += increment;
            span.textContent = Math.floor(currentNumber);
            frame++;
            requestAnimationFrame(animate);
        } else {
            span.textContent = targetNumber;
        }
    };

    animate();
}
