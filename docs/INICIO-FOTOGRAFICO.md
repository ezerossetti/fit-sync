# Inicio fotográfico

## Intención
Conservar el saludo personal y el fondo blanco. Reemplazar el cartel tipográfico y las tarjetas repetidas por fotografía, tipografía contenida y listas abiertas.

## Cambios
- Se conserva «Vamos, {nombre}» y el acceso al perfil.
- Una fotografía en blanco y negro, generada para FitSync, reemplaza el cartel y sus frases. Representa a un atleta anónimo y no una celebridad. El archivo se incluye en el proyecto y en el precache de la PWA.
- El botón Entrenar queda debajo de la fotografía. Una sesión pendiente tiene prioridad y muestra su nombre y número de series registradas.
- Las rutinas se presentan como filas con separadores finos, sin carrusel ni portadas abstractas. Cada fila abre su rutina; con una sesión pendiente, permite retomarla y se explica esta prioridad.
- Momentos y última sesión son accesos discretos, sin banners promocionales.
- Se conservan el resumen semanal, los estados vacíos, la recuperación de datos y los avisos de error.
- Animaciones de entrada y respuesta al toque respetan la preferencia de movimiento reducido.

## Validación
- 36 pruebas existentes de frontend/backend aprobadas.
- Chrome con emulación móvil: saludo, foto cargada, destinos de todas las rutinas, prioridad del borrador, estado vacío, navegación a rutinas y momentos y movimiento reducido.
- Sin desbordamiento horizontal a 320, 390, 402, 430 y 768 px.
- Inspección de captura de pantalla a 390 px. No equivale a una prueba en un iPhone físico.

## Asset
`frontend/src/assets/training-editorial.png`: fotografía generada mediante ImageGen, sin tipografía ni marcas de terceros. Fuente original conservada sin modificaciones de contenido.
