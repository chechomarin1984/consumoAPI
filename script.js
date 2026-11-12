// ===================== CONFIGURACIÓN =====================
// Datos tomados del ejemplo "Read all rows" de Supabase
const API_URL = 'https://obigmyakksfxqguiwfkq.supabase.co/rest/v1/capacitacion?select=*';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaWdteWFra3NmeHFndWl3ZmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0OTU4MzUsImV4cCI6MjExMDA3MTgzNX0.41RuO81IIyCkb9HmhQGe7t7X--n2tcaS4TKRRIkKh4s';

// Encabezados que exige Supabase: en ambos va la misma clave (anon key)
const HEADERS = {
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
};

// ===================== ELEMENTOS DEL DOM =====================
const lista = document.getElementById('lista-capacitaciones');
const mensaje = document.getElementById('mensaje');
const buscador = document.getElementById('buscador');
const btnRecargar = document.getElementById('btn-recargar');

let capacitaciones = []; // Datos recibidos de la API

// ===================== CONSUMO DE LA API =====================
async function obtenerCapacitaciones() {
    mostrarMensaje('Cargando capacitaciones...');
    lista.innerHTML = '';
    btnRecargar.disabled = true;

    try {
        const respuesta = await fetch(API_URL, {
            method: 'GET',
            headers: HEADERS,
        });

        // fetch no lanza error con 401, 403, 404 o 500: hay que revisarlo
        if (!respuesta.ok) {
            throw new Error(mensajeSegunEstado(respuesta.status));
        }

        const datos = await respuesta.json();

        // Acepta un arreglo directo o una respuesta paginada { results: [...] }
        capacitaciones = Array.isArray(datos) ? datos : (datos.results || []);

        mostrarCapacitaciones(capacitaciones);
    } catch (error) {
        // Error de red, CORS o el error lanzado arriba
        mostrarMensaje(error.message || 'No fue posible conectar con la API.', true);
        console.error('Error al consumir la API:', error);
    } finally {
        btnRecargar.disabled = false;
    }
}

function mensajeSegunEstado(status) {
    switch (status) {
        case 401: return 'No autorizado (401): revisa el token de Authorization.';
        case 403: return 'Acceso denegado (403): revisa la API key o los permisos.';
        case 404: return 'No se encontró el recurso (404): revisa la URL de la API.';
        case 500: return 'Error interno del servidor (500).';
        default:  return `Error al consultar la API (código ${status}).`;
    }
}

// ===================== MOSTRAR DATOS =====================
function mostrarCapacitaciones(items) {
    lista.innerHTML = '';

    if (items.length === 0) {
        // En Supabase, una lista vacía puede significar que RLS bloquea la lectura
        mostrarMensaje('No hay capacitaciones para mostrar. Si la tabla sí tiene datos, revisa las políticas RLS en Supabase.');
        return;
    }

    mostrarMensaje(`${items.length} capacitación(es) encontrada(s).`);

    items.forEach((capacitacion) => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta';

        const id = document.createElement('span');
        id.className = 'id';
        id.textContent = `ID: ${capacitacion.id}`;

        const titulo = document.createElement('h2');
        titulo.textContent = capacitacion.titulo;

        const descripcion = document.createElement('p');
        descripcion.textContent = capacitacion.descripcion;

        // textContent (y no innerHTML) evita inyectar HTML malicioso desde la API
        tarjeta.append(id, titulo, descripcion);
        lista.appendChild(tarjeta);
    });
}

function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle('error', esError);
}

// ===================== EVENTOS =====================
buscador.addEventListener('input', () => {
    const texto = buscador.value.toLowerCase().trim();
    const filtradas = capacitaciones.filter((c) =>
        String(c.titulo).toLowerCase().includes(texto) ||
        String(c.descripcion).toLowerCase().includes(texto)
    );
    mostrarCapacitaciones(filtradas);
});

btnRecargar.addEventListener('click', obtenerCapacitaciones);

// Carga inicial al abrir la página
document.addEventListener('DOMContentLoaded', obtenerCapacitaciones);
