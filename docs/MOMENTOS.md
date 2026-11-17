# Tus momentos

Acceso desde Inicio y Progreso a `/historial/momentos`. Implementa cuatro funciones pedidas: PR Moment, Wrapped mensual, silueta muscular 2D y misiones personales. No hay Modo Bestia; se retiraron el suelo en perspectiva, la sombra desplazada de la línea y las caras de relieve de las barras de Progreso.

## PR Moment

Récord cronológico por ejercicio frente a todas sus sesiones anteriores. Primera sesión establece una referencia y no se presenta como récord. Nueva marca al superar la mayor carga previa o superar las repeticiones con esa misma carga máxima. Se deduplican sesiones por UUID y se excluyen futuras/no completadas. El cierre de sesión muestra sus nuevos PR; Momentos permite recorrer los históricos. Una edición del historial recalcula los hitos.

## Wrapped

Selector de meses con entrenamientos y mes actual. Tres tarjetas: constancia, volumen/marcas y ejercicio más frecuente por número de sesiones. El mes actual está marcado «En curso». Cálculos con fechas locales; múltiples sesiones en un día suman sesiones pero un solo día de actividad. El volumen es carga externa × repeticiones, no energía ni trabajo fisiológico.

## Silueta

SVG plano, frontal/posterior, selección táctil y teclado; alternativa por botones de grupos. Cuenta series de lunes a hoy por grupo principal del catálogo y muestra ejercicios asociados. Los ejercicios sin clasificación permanecen visibles en «Sin clasificar». No mide recuperación ni crecimiento; no cuenta músculos secundarios ni prescribe entrenamiento.

## Misiones

Elección personal de 8 o 12 días distintos en el mes, opcionalmente 4 semanas distintas con entrenamiento. Se cuentan los entrenamientos de todo el mes, incluso anteriores a la elección. Se puede cambiar o desactivar sin borrar datos. Avance derivado de las sesiones, no de contadores incrementales, por lo que borrar/editar datos actualiza la insignia. Insignias compartibles al completar.

Persistencia en `usuarios.preferencias.misiones[YYYY-MM]` mediante `PUT /api/usuario/misiones`, autenticado y validado. Conserva otras preferencias y hasta 24 meses. El respaldo JSON admite este campo y lo restaura únicamente al elegir restaurar preferencias. No requiere migración.

## Compartir

Archivo PNG 1080 × 1920 preparado antes de invocar Web Share desde el toque. Admite fondo fotográfico procesado localmente, alternativa de descarga, cancelación sin descarga y error explícito. La PWA no controla los destinos de la hoja iOS ni garantiza entrada directa a Historias de Instagram.

## Verificación

36 pruebas Node (incluidas las anteriores): PR real vs referencia inicial, deduplicación, período mensual, días/semanas distintos, clasificación muscular, persistencia de misiones y respaldo. QA Chrome móvil: selector/tarjetas Wrapped, archivo y foto, mapa, fallo/reintento/persistencia de misiones, PR compartible, estados vacíos y anchos 320/390/430/768 px. Se conserva el flujo de entrenamiento/offline. Pendiente: hoja de compartir real y teclado/archivos en iPhone físico.
