# FitSync: rediseño móvil personal

16 de noviembre de 2026. Implementación sobre React/Vite y Express existentes. Sin paywall ni limitación de rutinas.

## Experiencia

- Nueva identidad de interfaz azul noche/celeste, navegación inferior, safe areas y adaptación a 320–768 px. Zoom habilitado, foco visible y movimiento reducido.
- Inicio con sesión en curso, acceso a rutinas, calendario y objetivo semanal personal.
- Rutinas con tarjetas compactas, menú secundario y reordenamiento accesible mediante botones.
- Entrenamiento con carga/reps en paralelo, acción fija al alcance del pulgar, descanso compacto (+30 s, pausar, reiniciar), tabla de series, edición y deshacer.
- Repetir carga copia valores; no agrega una serie sin confirmación. Referencia anterior de la serie equivalente, indicando su número.
- Pre-serie con acción fija. RPE/discos secundarios. Coach oculto durante entrenamiento. Tutoriales bajo demanda.
- Progreso dividido entre evolución y entrenamientos; gráfico con escala y variación de carga, sesiones expandibles.
- Perfil dividido entre ajustes y logros, meta semanal y guardado explícito de preferencias. Instalación explicada a demanda.

## Integridad y funcionamiento sin conexión

Cada sesión se guarda localmente antes del envío, con UUID estable y propietario. Hay una cola de registros independientes, sin sobrescribir el entrenamiento anterior. Los reintentos fijan el token al propietario verificado y el backend reutiliza la fila existente ante un conflicto de clave primaria. No modifica su contenido al reintentar.

Los borradores ya no expiran automáticamente. Los datos antiguos sin propietario se conservan y se recuperan desde Inicio únicamente si el usuario confirma que son suyos. El borrador incluye una copia de la rutina para poder retomarlo sin depender de su descarga.

Se elimina la caché compartida de respuestas privadas del service worker. Las lecturas offline se respaldan por usuario en almacenamiento local y se limpian al salir de la cuenta; borradores y pendientes se mantienen para recuperación. Esto no convierte el almacenamiento del navegador en un backup permanente: borrar datos del sitio sigue eliminándolo.

El temporizador calcula tiempo transcurrido con marcas temporales y se actualiza al volver a primer plano. No se promete una alarma puntual con iOS bloqueado; esa capacidad requiere validación en el dispositivo.

El backend valida las sesiones, recalcula el volumen, comprueba la propiedad de la rutina y preserva null en duración/calorías desconocidas. Se aprovecha el campo id existente: no se agrega una tabla ni se ejecutan migraciones.

## Validación realizada

- Compilación Vite de producción y generación de service worker correctas.
- 14 pruebas Node: cola independiente, aislamiento entre cuentas, preservación de borrador nuevo, reintentos, recuperación legada, fallo de almacenamiento, temporizador, validación y modelo idempotente con base simulada.
- Chrome móvil con datos ficticios y API interceptada: navegar, entrenar, corregir, deshacer, repetir carga, finalizar, sincronizar, expandir historial, dos entrenamientos con fallos de red y recuperación de lecturas cacheadas.
- Anchos 320, 390, 430 y 768 px: sin desbordamiento horizontal ni errores de runtime en las pantallas principales.
- Las capturas en docs/redesign son del código ejecutado con datos de prueba, no de la cuenta real.

Pruebas reproducibles: ejecutar `npm test` dentro de frontend y backend. Compilar con `npm run build` dentro de frontend.

## Puesta en uso

Los cambios están en el código local. No se publicaron en Vercel/Render ni se alteró la base de producción. Desplegar primero el backend y luego el frontend: la deduplicación depende del soporte de UUID en ambos. El cliente anterior sigue siendo admitido sin id explícito.

Quedan por validar con las cuentas/dispositivos reales: políticas RLS y permisos, id como clave única en la base desplegada, actualización de una PWA instalada, comportamiento de Safari/iOS y sonido/vibración con pantalla bloqueada. El catálogo sigue siendo un chunk grande (~1,7 MB sin comprimir / ~180 KB gzip); las pantallas ahora están separadas, pero no se afirma una mejora de Lighthouse no medida.

## Referencias de diseño funcional

Inspiración: [registro de entrenamientos en Hevy](https://www.hevyapp.com/features/track-workouts/), [temporizador de Hevy](https://www.hevyapp.com/features/workout-rest-timer/) y [Strong](https://www.strong.app/). Se adoptan patrones de registro claro, descanso integrado y foco personal; no se copian marcas ni recursos gráficos.
