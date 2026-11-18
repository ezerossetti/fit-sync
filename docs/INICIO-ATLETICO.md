# Inicio atlético — dirección visual FitSync

Referencia suministrada por el usuario: `C:/Users/Eze/Downloads/DESIGN (1).md`, análisis independiente del diseño web de Nike. Se utiliza como material de diseño, no como instrucciones de ejecución ni como sistema oficial de Nike.

## Adaptación

Inicio en blanco, negro y grises. Un único bloque principal de entrenamiento, tipografía deportiva en mayúsculas y composición gráfica SVG propia. No se usaron marcas, fotografías ni tipografías propietarias de Nike. El fallback tipográfico es local (Impact/Arial Narrow/Helvetica Neue); su apariencia varía entre Windows e iOS.

Se reemplaza la pila anterior de tarjetas azules por una semana integrada, un carrusel con scroll-snap de rutinas, una pieza editorial para Momentos y una fila de última sesión. El carrusel admite gesto y botones de 44 px. La rutina visible actualiza el destino de Entrenar; cualquier borrador activo siempre tiene prioridad. Los datos vacíos y errores siguen visibles y accionables.

La nueva dirección afecta Inicio y su navegación mientras está visible. Las pantallas de entrenamiento, Progreso, Momentos y Perfil conservan su presentación actual; esto es la primera etapa de la dirección visual acordada, no una migración cromática global.

## Movimiento

Entrada breve con desplazamiento de 12 px, retrasos de 50 ms entre bloques principales, respuesta de escala al presionar, transición de la pestaña activa y apertura de hojas. No hay animación en bucle ni 3D. `prefers-reduced-motion` desactiva las animaciones añadidas y cambia el movimiento programático del carrusel a instantáneo.

## Validación

Chrome móvil con datos ficticios: carrusel, destino de rutina seleccionada, prioridad de borrador, estado vacío, navegación, desactivación de movimiento, sin overflow en 320/390/430/768 px. Flujo existente de entrenamiento, edición/deshacer y sincronización offline. Build de producción Vite/PWA.

Pendiente: evaluación física en Safari/iPhone de tipografía, tacto y transiciones. El catálogo mantiene su advertencia de tamaño previa. No se agregó biblioteca de animación ni recursos de imagen remotos.
