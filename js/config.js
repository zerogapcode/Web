const CONFIG = {
    // URL de la nueva API en Cloudflare Workers
    API_SERVER_URL: 'https://black-water-4ccb.yankeevictor73.workers.dev'
};

// Interceptor para agregar "memoria" a las conversaciones sin editar los 11 archivos
const originalFetch = window.fetch;
const sessionHistories = {};

window.fetch = async function() {
    let args = arguments;
    try {
        if (args[0] === CONFIG.API_SERVER_URL && args[1] && args[1].body) {
            let bodyObj = JSON.parse(args[1].body);
            if (bodyObj.message && bodyObj.session_id) {
                if (!sessionHistories[bodyObj.session_id]) {
                    sessionHistories[bodyObj.session_id] = [];
                }
                
                // Añadimos el historial de mensajes anteriores al payload
                bodyObj.history = sessionHistories[bodyObj.session_id];
                args[1].body = JSON.stringify(bodyObj);
                
                // Hacemos la peticion
                const response = await originalFetch.apply(this, args);
                
                // Guardamos la nueva interaccion en el historial de forma asincrona
                const clonedResponse = response.clone();
                clonedResponse.json().then(data => {
                    if (data.status === "success" && data.response) {
                        sessionHistories[bodyObj.session_id].push({ role: "user", parts: [{ text: bodyObj.message }] });
                        sessionHistories[bodyObj.session_id].push({ role: "model", parts: [{ text: data.response }] });
                        
                        // Guardar solo los ultimos 12 mensajes (6 turnos) para no saturar a la IA
                        if (sessionHistories[bodyObj.session_id].length > 12) {
                            sessionHistories[bodyObj.session_id] = sessionHistories[bodyObj.session_id].slice(-12);
                        }
                    }
                }).catch(e => console.error("Error leyendo respuesta para historial", e));
                
                return response;
            }
        }
    } catch(e) {
        console.error("Error en interceptor de memoria:", e);
    }
    return originalFetch.apply(this, args);
};
