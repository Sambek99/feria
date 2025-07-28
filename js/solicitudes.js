'use strict';

import { fetchFakerData } from '/js/functions.js';

let allCarpoolData = []; // Variable para almacenar todos los datos cargados

const loadData = async () => {
    const num = Math.floor(Math.random() * 10);
    const url = `https://fakerapi.it/api/v2/users?_quantity=${num}&_gender=male,female`;

    try {
        const result = await fetchFakerData(url);

        if (result.success) {
            allCarpoolData = result.body.data.map(user => {
                const departureHour = Math.floor(Math.random() * 11) + 7; // Genera hora entre 7 y 17 (7 AM a 5 PM)
                return {
                    ...user,
                    cupos: Math.floor(Math.random() * 5), // Asigna cupos
                    departureHour: departureHour, // Guarda solo la hora para fácil filtrado
                    departureTime: `${departureHour.toString().padStart(2, '0')}:00` // Guarda formato de string "HH:MM" para visualización (ej. "07:00")
                };
            });
            console.log('Datos obtenidos y procesados con éxito:', allCarpoolData);
            renderCards(allCarpoolData); // Renderiza todas las tarjetas inicialmente
        } else {
            console.error('Error al obtener los datos:', result.error);
        }
    } catch (error) {
        console.error('Ocurrió un error inesperado:', error);
    }
};

const renderCards = (usersToRender) => {
    const container = document.getElementById("skeleton-container");
    if (!container) return;
    container.innerHTML = ""; // Limpia el contenedor

    if (usersToRender.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                <p>No se encontraron resultados para los criterios de filtro.</p>
            </div>
        `;
        return;
    }

    usersToRender.forEach(({ firstname, lastname, ip, cupos, departureTime }) => {
        const card = document.createElement("a");
        card.href = "/html/carrera.html";
        card.className = "block space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow mb-4 max-w-md mx-full transition hover:shadow-lg";

        // Guardar los datos como atributos data-*
        card.dataset.nombre = `${firstname} ${lastname}`;
        card.dataset.telefono = ip;
        card.dataset.cupos = cupos;
        card.dataset.horaSalida = departureTime;

        card.innerHTML = `
            <div class="w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1207.0068433684694!2d-79.96683541685341!3d-2.147501522823838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d7301a324f4c9%3A0xa76d8f1608dedfed!2sLABORATORIO%20DE%20PROFESORES!5e0!3m2!1ses-419!2sec!4v1750261912672!5m2!1ses-419!2sec"
                    class="w-full h-40" style="border:0;" allowfullscreen="" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">${firstname} ${lastname}</h2>
            <p class="text-gray-500 dark:text-gray-300">Número de teléfono: ${ip}</p>
            <p class="text-gray-600 dark:text-gray-400">Cupos: <strong>${cupos}</strong></p>
            <p class="text-gray-600 dark:text-gray-400">
                Hora de salida: <strong>${departureTime}</strong>
            </p>
        `;

        // Guardar datos en localStorage al hacer clic
        card.addEventListener('click', () => {
            localStorage.setItem('nombre', card.dataset.nombre);
            localStorage.setItem('telefono', card.dataset.telefono);
            localStorage.setItem('cupos', card.dataset.cupos);
            localStorage.setItem('horaSalida', card.dataset.horaSalida);
        });

        container.appendChild(card);
    });
};

const applyFilter = () => {
    // Apuntamos al nuevo ID del selector
    const filterHourSelect = document.getElementById('filter-hour-select');
    const selectedHourValue = filterHourSelect.value; // Obtiene el valor (ej. "7", "8", o "")

    // Si el valor es una cadena vacía (la opción "Todas las horas"), mostrar todo
    if (selectedHourValue === "") {
        renderCards(allCarpoolData);
        return;
    }

    // Convertir el valor a número para la comparación
    const filterHour = parseInt(selectedHourValue, 10);

    const filteredData = allCarpoolData.filter(carpool => {
        return carpool.departureHour === filterHour;
    });

    renderCards(filteredData);
};

const clearFilter = () => {
    // Limpiar el selector, restableciéndolo a la opción "Todas las horas"
    const filterHourSelect = document.getElementById('filter-hour-select');
    filterHourSelect.value = '';
    renderCards(allCarpoolData); // Mostrar todos los datos nuevamente
};

// Función de autoejecución
(() => {
    loadData();

    // Añadir event listeners a los botones de filtro
    const applyFilterButton = document.getElementById('apply-filter');
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', applyFilter);
    }

    const clearFilterButton = document.getElementById('clear-filter');
    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', clearFilter);
    }

    // Opcional: Podrías añadir un evento 'change' al selector para filtrar automáticamente
    // const filterHourSelect = document.getElementById('filter-hour-select');
    // if (filterHourSelect) {
    //     filterHourSelect.addEventListener('change', applyFilter);
    // }
})();