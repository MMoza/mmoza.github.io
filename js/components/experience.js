const section = document.querySelector("#experience");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            miFuncion();
        }
    });
}, { threshold: 0.5 });

observer.observe(section);

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
