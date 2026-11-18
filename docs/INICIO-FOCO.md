# Inicio centrado en el entrenamiento

Reemplaza la fotografía del inicio por una composición de datos personales y una ilustración anatómica vectorial. Conserva el saludo, fondo blanco, lista de rutinas y accesos existentes.

- Nombre de la rutina, cantidad de ejercicios y series previstas, y fecha de la última sesión completada de esa rutina.
- Selector anterior/siguiente que actualiza la composición y el destino del botón Entrenar.
- Silueta con vistas frente/espalda. Resalta grupos principales según los metadatos del ejercicio o el catálogo existente. Los ejercicios desconocidos no reciben una clasificación inventada. No representa recuperación ni fatiga.
- Una sesión pendiente tiene prioridad sobre el selector de rutinas; muestra ejercicios y series registrados y permite continuarla.
- Animaciones breves, desactivadas al solicitar movimiento reducido. Controles de al menos 44 px.
- Sin descarga de fotos en el inicio; el SVG forma parte del código y funciona con el precache existente.

Validación: Chrome con emulación móvil, vistas 320/390/402/430/768 px; cambio de rutina y destino del CTA, zonas resaltadas, frente/espalda, prioridad del borrador, estado vacío, navegación y movimiento reducido. No se probó en un iPhone físico.
