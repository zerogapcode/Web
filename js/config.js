const CONFIG = {
    // URL de la nueva API en Cloudflare Workers
    API_SERVER_URL: 'https://black-water-4ccb.yankeevictor73.workers.dev'
};

// Interceptor para agregar "memoria" persistente
const originalFetch = window.fetch;

window.fetch = async function() {
    let args = arguments;
    try {
        if (args[0] === CONFIG.API_SERVER_URL && args[1] && args[1].body) {
            let bodyObj = JSON.parse(args[1].body);
            if (bodyObj.message && bodyObj.session_id) {
                // Leer el historial desde localStorage para que sobreviva a las recargas de página
                let sessionHistories = JSON.parse(localStorage.getItem('protonlab_chats') || '{}');
                
                if (!sessionHistories[bodyObj.session_id]) {
                    sessionHistories[bodyObj.session_id] = [];
                }
                
                // Añadimos el historial de mensajes anteriores al payload (solo los últimos 10)
                bodyObj.history = sessionHistories[bodyObj.session_id];
                args[1].body = JSON.stringify(bodyObj);
                
                // Hacemos la peticion
                const response = await originalFetch.apply(this, args);
                
                // Guardamos la nueva interaccion
                const clonedResponse = response.clone();
                clonedResponse.json().then(data => {
                    if (data.status === "success" && data.response) {
                        // Recargar el objeto por si hubo múltiples peticiones a la vez
                        let currentHistories = JSON.parse(localStorage.getItem('protonlab_chats') || '{}');
                        if (!currentHistories[bodyObj.session_id]) {
                            currentHistories[bodyObj.session_id] = [];
                        }
                        
                        currentHistories[bodyObj.session_id].push({ role: "user", parts: [{ text: bodyObj.message }] });
                        currentHistories[bodyObj.session_id].push({ role: "model", parts: [{ text: data.response }] });
                        
                        // Mantener la conversación en un máximo de 14 interacciones
                        if (currentHistories[bodyObj.session_id].length > 14) {
                            currentHistories[bodyObj.session_id] = currentHistories[bodyObj.session_id].slice(-14);
                        }
                        
                        localStorage.setItem('protonlab_chats', JSON.stringify(currentHistories));
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
