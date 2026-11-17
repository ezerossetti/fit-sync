# Progreso y datos personales

## Experiencia móvil

Progreso usa SVG con capas, iluminación y sombra para la evolución y barras semanales con caras en relieve. No incorpora WebGL ni una dependencia gráfica. Las alturas de las barras son proporcionales a los días entrenados. La perspectiva es decorativa; la línea usa fechas reales y segmentos entre muestras, sin inventar valores intermedios.

- Selector de ejercicio, filtros de 28/90 días o todo, carga máxima/volumen/1RM estimado.
- Exploración táctil mediante puntos y deslizador accesible con detalle de carga, repeticiones y series.
- Primera y última mejor carga del período, con repeticiones visibles.
- Estimación Epley solo para series con carga y 1–10 reps; una repetición conserva el peso medido. Se identifica como estimación.
- Calendario mensual navegable; meta semanal de días distintos y marcas históricas por ejercicio.
- Estados sin datos, una sola sesión, carga cero y métricas no calculables.

## Gestión

En Entrenamientos, expandir una sesión → Editar entrenamiento. Permite nombre, fecha, duración, notas, peso/reps/RPE y agregar/quitar series. Mantiene el borrador ante un fallo, confirma descarte y recalcula volumen en el servidor. No permite quitar la última serie de un ejercicio. La eliminación usa hoja de confirmación.

Rutinas → Ordenar rutinas. Flechas táctiles, guardado explícito y persistencia en `usuarios.preferencias.ordenRutinas`. El GET de rutinas aplica ese orden también en Inicio y Entrenar. No requiere migración de base de datos.

Perfil → Tus datos, con vos. Exportación JSON con sesiones, rutinas, ejercicios propios y preferencias. El CSV del historial se mantiene y neutraliza fórmulas para abrirlo en hojas de cálculo.

## Respaldo y restauración

Rutas autenticadas `/api/backup`, `/api/backup/validate`, `/api/backup/restore`. Exportación paginada para evitar el límite implícito de consultas. Archivo v1 de hasta 10 MB, máximo 10.000 registros por colección; se valida antes de ofrecer restaurar y cada lote antes de escribir. No contiene credenciales ni chat del coach. Los borradores locales y pendientes de sincronizar se excluyen explícitamente en la interfaz.

La importación está limitada a la cuenta original. Agrega registros faltantes por UUID y nunca sobrescribe registros existentes. Inserta por lotes de diez con conflicto ignorado y comprobación de propiedad. Una referencia a una rutina que ya no existe pasa a null conservando el nombre histórico. Si se interrumpe, puede haber lotes importados; se informa y se puede reintentar el archivo sin duplicados. No es una transacción global. Preferencias se restauran solo con una casilla explícita; se conservan claves actuales no incluidas en el respaldo.

## Validación

Pruebas Node de cálculos, fechas locales, filtros, carga cero, CSV, validación del respaldo, aislamiento de cuentas, importación repetida y orden de rutinas. QA Chrome con datos ficticios en 320/390/430/768 px: gráficos, calendario, edición con fallo/reintento, recálculo, orden, descarga JSON y restauración, además del entrenamiento y sincronización offline existentes. Build Vite/PWA.

Los casos visuales son emulación Chrome. Queda la comprobación física en Safari instalado en iPhone, especialmente teclado, selector de archivos y descargas. El catálogo mantiene una advertencia de tamaño de chunk; el rediseño no añade un motor 3D pesado.
