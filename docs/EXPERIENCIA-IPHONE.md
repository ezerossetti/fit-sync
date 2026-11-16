# FitSync: controles móviles, compartir y Chiche

## Cambios

- Controles de 44–50 px, botones de acción redondos, selectores segmentados, navegación inferior flotante y tipografía de sistema para controles.
- Chiche en la barra superior, sin widget flotante sobre el contenido. Panel con foco de teclado, Escape, ajuste al teclado virtual y recuperación del mensaje ante error.
- Compartir abre una hoja modal accesible con una tarjeta completa como predeterminada. Permite seleccionar una foto local y componer un PNG 1080 × 1920. No sube la foto a un servidor.
- El archivo se prepara antes del toque de compartir, y se comparte sin texto adicional. Cancelar no descarga nada. Si compartir falla, se explica cómo guardar la imagen.
- Instagram decide qué destinos ofrece su extensión; la PWA no puede garantizar abrir directamente el editor de Historias. Se mantiene una alternativa para guardar y seleccionar la imagen desde Instagram.
- Spotify es un acceso a la aplicación/sitio, sin afirmar que existe una cuenta conectada o control de reproducción.

## Chiche

El modelo anterior `llama-3.1-8b-instant` fue retirado para free/developer el 16/08/2026 según https://console.groq.com/docs/deprecations. El reemplazo predeterminado es `openai/gpt-oss-20b`; rutinas usa `openai/gpt-oss-120b`. Variables opcionales: `GROQ_MODEL_LIGERO`, `GROQ_MODEL_RUTINA`. `GROQ_API_KEY` permanece exclusivamente en el backend.

Timeout del proveedor 45 s, cliente 90 s para admitir arranque en frío. Presupuesto adicional para razonamiento. Los fallos de historial o persistencia no descartan una respuesta válida; se informa que no pudo guardarse. Errores del proveedor no se devuelven crudos al cliente.

## Validación

18 pruebas Node: validación, sesiones, almacenamiento offline, reloj, proveedor y controlador del coach. Build Vite/PWA. Chrome móvil con API simulada: 320/390/430/768 px, entrenamiento, edición, deshacer, sincronización, dos sesiones offline, compartir foto/tarjeta, PNG 1080 × 1920, cancelación/error del share y reintento de chat. Una llamada real a Groq con la configuración local confirmó respuesta del modelo nuevo, sin datos personales.

Pendiente de prueba física: Safari instalado en iPhone, teclado iOS, hoja real de compartir y destino Instagram. No se equipara emulación Chrome con dispositivo real ni configuración local con servidor de producción.

## Recursos y alcance

Aplicar Apple Human Interface Guidelines para controles y hojas; pruebas de accesibilidad y pruebas reales de Safari. No hace falta un plugin de generación de sitios para modificar este repositorio. Un skill de imágenes solo aporta si se decide crear material visual; no resuelve errores de interacción.

Antes de comprar reloj, definir modelo y compatibilidad concreta: no existe emparejamiento universal desde esta PWA. HealthKit/watchOS requiere trabajo nativo y permisos específicos; no se agregó una conexión ficticia. Spotify integrado requiere OAuth y, para Web Playback SDK, Premium; el acceso directo funciona sin agregar esa dependencia.

Prioridades siguientes: reemplazar confirmaciones del navegador por hojas de acción; auditar contraste y VoiceOver en iPhone; dividir carga del catálogo; telemetría de errores sin contenido privado; verificar exportación/restauración de datos. Evitar sumar widgets, gamificación o paywalls que interrumpan el registro de series.
