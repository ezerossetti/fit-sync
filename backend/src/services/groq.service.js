// Wrapper para la API de Groq (OpenAI-compatible).
// La API key es gratuita: se saca en https://console.groq.com/keys
// y se guarda en el .env del backend como GROQ_API_KEY (nunca se manda al frontend).

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Instrucciones de sistema por tipo de interacción. Todas comparten la misma
// identidad de coach, pero cada modo tiene su propio foco y extensión de respuesta.
const SYSTEM_PROMPTS = {
  chat: `Sos el coach de entrenamiento de fuerza dentro de la app FitSync. Hablás en español rioplatense, de forma directa y concreta.
Tu trabajo es responder preguntas del usuario sobre su entrenamiento usando los datos reales que te pasan como contexto (rutinas, sesiones, progreso, racha, balance muscular).
Basate en principios de sobrecarga progresiva, volumen, frecuencia y recuperación. Si el contexto no alcanza para responder algo con certeza, decilo en vez de inventar.
No dases diagnósticos médicos ni indicaciones para lesiones: si el usuario menciona dolor o lesión, recomendale consultar a un profesional de la salud.
Respuestas cortas y accionables, sin relleno.`,

  comentario_sesion: `Sos el coach de entrenamiento de fuerza de FitSync. Te paso los datos de la sesión que el usuario acaba de terminar, más su historial reciente en esos mismos ejercicios.
Escribí un comentario breve (2 a 4 oraciones) con feedback concreto: qué mejoró o empeoró respecto a sesiones anteriores, y una sugerencia puntual para la próxima vez (subir peso, mantener, bajar volumen, etc).
Tono motivador pero honesto, sin relleno genérico tipo "buen trabajo". Si detectás una señal de estancamiento o de posible deload, decilo explícitamente.`,

  resumen: `Sos el coach de entrenamiento de fuerza de FitSync. Te paso un resumen agregado del período (semanal o mensual): volumen total, sesiones completadas, balance muscular, racha, PRs nuevos y la sugerencia de deload si la hay.
Armá un resumen en 3 a 5 oraciones con: qué se hizo bien, qué grupo muscular quedó relegado si aplica, y una recomendación concreta para el próximo período.
No repitas los números tal cual los recibiste, interpretalos.`,

  sugerir_ejercicios: `Sos el coach de entrenamiento de fuerza de FitSync. Te paso las rutinas actuales del usuario y su balance muscular reciente (empuje, tracción, piernas, core).
Sugerí entre 2 y 4 ejercicios concretos (del catálogo estándar de gimnasio) que le convendría sumar a sus rutinas para corregir desbalances o variar estímulo, y para cada uno una razón de una línea.
No sugieras ejercicios que ya tiene en sus rutinas actuales.`,
};

/**
 * Llama a Groq con el modo indicado.
 * @param {'chat'|'comentario_sesion'|'resumen'|'sugerir_ejercicios'} modo
 * @param {string} contextoJSON - contexto de datos del usuario, ya armado, en JSON.stringify
 * @param {string} mensajeUsuario - pregunta o instrucción puntual (en 'chat' es lo que escribió el usuario)
 * @param {Array<{rol: 'user'|'model', contenido: string}>} historial - turnos previos del chat (solo aplica a 'chat')
 */
export const groqService = {
  generarRespuesta: async (modo, { contextoJSON, mensajeUsuario, historial = [] }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Falta configurar GROQ_API_KEY en el .env del backend');
    }

    const systemInstruction = SYSTEM_PROMPTS[modo];
    if (!systemInstruction) {
      throw new Error(`Modo de coach inválido: ${modo}`);
    }

    // Groq usa el formato de mensajes de OpenAI: role 'system' | 'user' | 'assistant'.
    const messages = [{ role: 'system', content: systemInstruction }];

    historial.forEach((turno) => {
      messages.push({
        role: turno.rol === 'model' ? 'assistant' : 'user',
        content: turno.contenido,
      });
    });

    // Mensaje actual: le pegamos el contexto de datos justo antes de la pregunta
    const textoFinal = `Contexto de datos del usuario (JSON):\n${contextoJSON}\n\n${mensajeUsuario}`;
    messages.push({ role: 'user', content: textoFinal });

    const body = {
      model: GROQ_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 500,
    };

    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Error de Groq (${resp.status}): ${errText}`);
    }

    const data = await resp.json();
    const texto = data?.choices?.[0]?.message?.content;

    if (!texto) {
      throw new Error('Groq no devolvió una respuesta válida');
    }

    return texto.trim();
  },
};
