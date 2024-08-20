// Define constantes para la API Key y el ID del equipo
const apiKey = 'cc6bea6e97e925067239871931bdf46f'; 
const teamId = 496; // ID de Colón de Santa Fe

// Asegúrate de que luxon esté disponible en tu entorno
const { DateTime } = luxon;

/**
 * Obtiene la fecha del próximo partido de fútbol desde la API.
 * @returns {Promise<DateTime|null>} La fecha del próximo partido en la zona horaria de Buenos Aires o null si ocurre un error.
 */
async function getNextMatch() {
    try {
        // Realiza la solicitud a la API para obtener los detalles del próximo partido
        const response = await fetch(`https://v3.football.api-sports.io/fixtures?team=${teamId}&next=1`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });

        // Verifica si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error('Error al obtener el próximo partido');
        }

        // Convierte la respuesta en formato JSON
        const data = await response.json();
        // Extrae la fecha del partido en formato UTC
        const matchDateUTC = data.response[0].fixture.date;

        // Convierte la fecha UTC a la hora local de Argentina usando luxon
        const matchDateLocal = DateTime.fromISO(matchDateUTC, { zone: 'utc' })
                                       .setZone('America/Argentina/Buenos_Aires');
        
        return matchDateLocal;
    } catch (error) {
        // Imprime el mensaje de error en la consola
        console.error('Error:', error.message);
        return null;
    }
}

/**
 * Actualiza el contador regresivo en la página web.
 * @param {DateTime} matchDate La fecha y hora del próximo partido en la zona horaria de Buenos Aires.
 */
function updateCountdown(matchDate) {
    if (!matchDate) return; // Si no hay fecha, no actualiza el contador

    // Obtiene la fecha y hora actual en la zona horaria de Buenos Aires
    const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    // Calcula el tiempo restante hasta el próximo partido
    const timeRemaining = matchDate.diff(now, ['days', 'hours', 'minutes', 'seconds']);

    // Si el partido ya comenzó, muestra un mensaje indicando que ha comenzado
    if (timeRemaining.toMillis() < 0) {
        document.getElementById('countdown').innerHTML = "¡El partido ya comenzó!";
        return;
    }

    // Actualiza el contenido del elemento con el tiempo restante en días, horas, minutos y segundos
    document.getElementById('countdown').innerHTML = 
        `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${Math.floor(timeRemaining.seconds)}s`;
}

/**
 * Inicializa el contador regresivo.
 */
async function initCountdown() {
    // Obtiene la fecha del próximo partido
    const matchDate = await getNextMatch();
    if (matchDate) {
        // Actualiza el contador cada segundo
        setInterval(() => updateCountdown(matchDate), 1000);
        // Actualiza el contador inmediatamente
        updateCountdown(matchDate);
    } else {
        // Muestra un mensaje en caso de error al obtener la fecha del próximo partido
        document.getElementById('countdown').innerHTML = "No se pudo obtener la fecha del próximo partido.";
    }
}

// Inicia el proceso de actualización del contador regresivo
initCountdown();
