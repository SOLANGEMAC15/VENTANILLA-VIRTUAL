document.addEventListener('DOMContentLoaded', () => {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselGrid = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const btnViewAll = document.getElementById('btn-view-all');
    const allAreasSection = document.getElementById('all-areas-section');

    // Lógica del Carrusel (Movimiento)
    const moveCarousel = (direction) => {
        const cardWidth = carouselGrid.querySelector('.card').offsetWidth + 32; // Ancho + gap
        carouselGrid.scrollBy({
            left: direction * cardWidth,
            behavior: 'smooth'
        });
    };

    prevBtn.addEventListener('click', () => moveCarousel(-1));
    nextBtn.addEventListener('click', () => moveCarousel(1));

    // Lógica de Mostrar más / Mostrar menos con ocultamiento de carrusel
    btnViewAll.addEventListener('click', () => {
        const isHidden = allAreasSection.style.display === 'none';

        if (isHidden) {
            // Mostrar la rejilla completa
            allAreasSection.style.display = 'grid';
            // Ocultar el carrusel
            carouselWrapper.style.display = 'none';
            // Cambiar texto del botón
            btnViewAll.textContent = 'Mostrar menos locales';
            btnViewAll.classList.add('active');
            
            // Desplazamiento suave al inicio de la sección de todos los locales
            window.scrollTo({ top: allAreasSection.offsetTop - 100, behavior: 'smooth' });
        } else {
            // Ocultar la rejilla completa
            allAreasSection.style.display = 'none';
            // Volver a mostrar el carrusel
            carouselWrapper.style.display = 'flex';
            // Cambiar texto del botón
            btnViewAll.textContent = 'Ver todos los locales';
            btnViewAll.classList.remove('active');

            // Volver la vista al carrusel
            window.scrollTo({ top: carouselWrapper.offsetTop - 100, behavior: 'smooth' });
        }
    });
});