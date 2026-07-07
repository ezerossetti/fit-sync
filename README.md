# 💪 FitSync

> Tu fuerza, en datos.

---

## 🎯 Descripción

**FitSync** es una PWA (Progressive Web App) de registro de entrenamiento de fuerza para deportistas amateurs de 18-35 años que entrenan sin entrenador en Argentina. La app permite registrar series, pesos y repeticiones sin teclado, mostrando el historial de la sesión anterior antes de cada ejercicio para facilitar la sobrecarga progresiva.

**Stack:**
- **Backend:** Node.js + Express.js (ES modules), deployado en **Render**
- **Frontend:** Vite + React 18 + Axios (PWA), deployado en **Vercel**
- **Base de datos:** **Supabase (PostgreSQL)** — conectado y funcionando en producción con datos reales
- **Autenticación:** **Supabase Auth** (JWT)

---

## 🌐 Demo en Producción

- **Frontend:** https://fit-sync-topaz.vercel.app
- **Backend / API:** https://fit-sync-59pg.onrender.com

> ⚠️ El backend está en el free tier de Render, que se "duerme" tras 15 min sin tráfico. La primera request después de estar inactiva puede tardar 30-60 seg en responder — es esperado, no es un error.

<!-- 📸 TODO: reemplazar por la captura real de la app corriendo en producción -->
![FitSync en producción](./screenshot.png)

---

## 🛠️ Tech Stack

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![ES Modules](https://img.shields.io/badge/ES%20Modules-F7DF1E?style=flat&logo=javascript&logoColor=black)

### Frontend
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-5A28CC?style=flat&logo=axios&logoColor=white)

### Base de Datos
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

### Deploy
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

### Tools
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=postman&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)

---

## 📁 Estructura del Proyecto

```
fit-sync-backend/
├── backend/                          # Backend API
│   ├── index.js                      # Servidor principal
│   ├── package.json                  # Dependencias
│   ├── .env                          # Variables de ambiente (no commitear)
│   ├── src/
│   │   ├── app.js                    # Configuración Express
│   │   ├── controllers/
│   │   │   ├── sesion.controller.js
│   │   │   ├── rutina.controller.js
│   │   │   └── usuario.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # requireAuth: valida el JWT de Supabase
│   │   ├── models/
│   │   │   ├── sesion.model.js       # Conectado a Supabase real (getAll, getById, create, update, remove)
│   │   │   ├── rutina.model.js       # Conectado a Supabase real
│   │   │   └── usuario.model.js      # Conectado a Supabase real
│   │   ├── supabase.js               # Cliente de Supabase (createClient con URL + SERVICE_ROLE_KEY)
│   │   └── routes/
│   │       ├── index.routes.js
│   │       ├── sesiones.routes.js
│   │       ├── rutinas.routes.js
│   │       └── usuario.routes.js
│   └── postman/
│       └── FitSync.postman_collection.json
│
├── frontend/                         # Frontend Vite + React (PWA)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                # Proxy a /api → localhost:3000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── lib/
│       │   └── supabaseClient.js
│       ├── data/
│       │   ├── exerciseCatalog.js    # Catálogo de 62 ejercicios
│       │   └── coach.js              # Modo coach: sugerir alternativa / generar rutina
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Home.jsx
│       │   ├── Rutinas.jsx
│       │   ├── EntrenamientoActivo.jsx
│       │   ├── Historial.jsx
│       │   └── Perfil.jsx
│       ├── components/
│       │   ├── SesionesList.jsx
│       │   ├── SesionForm.jsx
│       │   ├── UsuarioList.jsx
│       │   └── UsuarioForm.jsx
│       ├── utils/
│       │   └── helpers.js
│       └── services/
│           ├── sesiones.service.js   # 5 métodos CRUD
│           ├── rutinas.service.js    # 5 métodos CRUD
│           └── usuario.service.js   # 5 métodos CRUD
│
├── .gitignore
├── .env.example                      # Variables de ambiente (plantilla)
└── README.md
```

---

## 🚀 Cómo Correr

### Backend

```bash
cd backend

# Instalar dependencias (primera vez)
npm install

# Dev mode (con nodemon)
npm run dev

# Start (producción)
npm start
```

Backend corre en: `http://localhost:3000`

### Frontend

```bash
cd frontend

# Instalar dependencias (primera vez)
npm install

# Dev mode (Vite con proxy a backend)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

Frontend corre en: `http://localhost:5173`  
Proxy automático: `/api` → `http://localhost:3000`

---

## ☁️ Deploy (C12 - C13)

### Backend → Render

1. New + → Web Service → conectar el repo desde GitHub.
2. **Root Directory:** `backend`
3. **Branch:** `main`
4. **Build Command:** `npm install`
5. **Start Command:** `node index.js`
6. **Environment Variables** (Render → Settings → Environment):
   ```
   SUPABASE_URL=<tu url de supabase>
   SUPABASE_ANON_KEY=<tu anon key de supabase>
   SUPABASE_SERVICE_ROLE_KEY=<tu service role key de supabase>
   ```
7. Deploy. URL pública: `https://fit-sync-59pg.onrender.com`

### Frontend → Vercel

1. Importar el repo en Vercel.
2. **Root Directory:** `frontend`
3. **Environment Variables:**
   ```
   VITE_API_URL=https://fit-sync-59pg.onrender.com
   VITE_SUPABASE_URL=<tu url de supabase>
   VITE_SUPABASE_ANON_KEY=<tu anon key de supabase>
   ```
   ⚠️ Ojo con el typo clásico de copy-paste: verificar que arranque con `https://` completo (con las dos "s" y las dos barras), no `ttps://`.
4. Deploy. Cualquier cambio de env var requiere **Redeploy manual** (no se aplica solo).
5. URL pública: `https://fit-sync-topaz.vercel.app`

### Supabase → Configuración necesaria

- Proyecto creado en [supabase.com](https://supabase.com), con tablas `usuarios`, `rutinas` y `sesiones` (nombres en minúscula, tal cual las espera el backend).
- **Row Level Security (RLS):** ya está activado con policies reales. El backend usa la `service_role` key para saltarse RLS (ya valida el JWT por su cuenta), así que si falta esa variable de entorno vas a tener errores de RLS en los inserts/updates.
- Datos de prueba cargados en las 3 tablas para validar el flujo end-to-end en producción.

---

## 📚 Especificaciones API

### Rutas Disponibles

#### Health Check
```
GET /api/health
```

#### Sesiones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/sesiones` | Obtener todas las sesiones |
| GET | `/api/sesiones/:id` | Obtener sesión por ID |
| POST | `/api/sesiones` | Crear sesión |
| PUT | `/api/sesiones/:id` | Actualizar sesión |
| DELETE | `/api/sesiones/:id` | Eliminar sesión |

#### Rutinas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/rutinas` | Obtener todas las rutinas |
| GET | `/api/rutinas/:id` | Obtener rutina por ID |
| POST | `/api/rutinas` | Crear rutina |
| PUT | `/api/rutinas/:id` | Actualizar rutina |
| DELETE | `/api/rutinas/:id` | Eliminar rutina |

#### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuario` | Obtener todos los usuarios |
| GET | `/api/usuario/:id` | Obtener usuario por ID |
| POST | `/api/usuario` | Crear usuario |
| PUT | `/api/usuario/:id` | Actualizar usuario |
| DELETE | `/api/usuario/:id` | Eliminar usuario |

> 🔐 Las rutas de `sesiones` y `rutinas` requieren header `Authorization: Bearer <token>` (JWT de Supabase Auth).

### Formato de Respuestas

**Exitosa:**
```json
{
  "success": true,
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## 🎨 Frontend — Componentes

### Login
- Login y registro con Supabase Auth

### Home
- Saludo con el nombre real del usuario logueado (antes hardcodeado)

### Rutinas
- CRUD de rutinas
- Botón "Duplicar rutina"
- Modo coach: "Sugerir alternativa" por ejercicio y "Generar rutina sugerida" por split

### EntrenamientoActivo
- Botones +/- sin teclado, cronómetro de descanso
- Corte automático de series (fix del bug de "siguiente infinito")

### Historial
- Heatmap de actividad (12 semanas) y gráfico de progreso por ejercicio
- Récords personales automáticos

### Perfil
- Preferencias (descanso, unidad) persistidas en la base
- Toggle de recordatorios/push eliminado

### SesionesList
- Muestra todas las sesiones del usuario
- Campos: `fecha`, `rutina_nombre`, `volumen_total`, `duracion_min`, `completada`
- **Estado con color:**
  - 🟢 `completada: true` → Verde
  - 🟠 `completada: false` → Naranja
- Manejo de estados: loading, error

### SesionForm
- Formulario para registrar una nueva sesión
- Refresca la lista automáticamente al crear
- `usuario_id` ya no hardcodeado — sale de la sesión de Supabase Auth

### UsuarioList
- Muestra todos los usuarios registrados
- Campos: `nombre`, `email`, `rol`, `activo`

### UsuarioForm
- Formulario para crear nuevos usuarios
- Refresca la lista automáticamente al crear

---

## 📋 Servicios

### sesiones.service.js
```javascript
sesionesService.getAll()          // GET /api/sesiones
sesionesService.getById(id)       // GET /api/sesiones/:id
sesionesService.create(data)      // POST /api/sesiones
sesionesService.update(id, data)  // PUT /api/sesiones/:id
sesionesService.delete(id)        // DELETE /api/sesiones/:id
```

### rutinas.service.js
```javascript
rutinasService.getAll()           // GET /api/rutinas
rutinasService.getById(id)        // GET /api/rutinas/:id
rutinasService.create(data)       // POST /api/rutinas
rutinasService.update(id, data)   // PUT /api/rutinas/:id
rutinasService.delete(id)         // DELETE /api/rutinas/:id
```

### usuario.service.js
```javascript
usuarioService.getAll()           // GET /api/usuario
usuarioService.getById(id)        // GET /api/usuario/:id
usuarioService.create(data)       // POST /api/usuario
usuarioService.update(id, data)   // PUT /api/usuario/:id
usuarioService.delete(id)         // DELETE /api/usuario/:id
```

---

## ✅ Features Actuales

- ✅ Backend API con patrón MVC
- ✅ 3 entidades: Sesion, Rutina, Usuario
- ✅ Conectado a **Supabase real** (PostgreSQL) — sin datos mockeados
- ✅ Frontend Vite + React con proxy (PWA)
- ✅ 3 servicios con 5 métodos CRUD cada uno
- ✅ Manejo de loading y errores
- ✅ Postman collection para testing
- ✅ Migración PATCH → PUT
- ✅ Backend separado en directorio propio
- ✅ **Backend deployado en Render**, leyendo/escribiendo en Supabase real
- ✅ **Frontend deployado en Vercel**, apuntando al backend de Render
- ✅ Flujo CRUD completo validado end-to-end en producción (no solo local)
- ✅ Variables de entorno separadas por ambiente (nunca hardcodeadas)
- ✅ Autenticación real con Supabase Auth (reemplazó el `usuario_id` hardcodeado)
- ✅ RLS activado con policies reales + service role key en el backend
- ✅ Diseño con identidad FitSync, mobile-first, Tailwind CSS
- ✅ Pantalla activa de entrenamiento con botones +/- sin teclado
- ✅ Historial inmediato de la sesión anterior
- ✅ Cronómetro de descanso integrado
- ✅ Fix del bug de "siguiente infinito" en Entrenamiento Activo
- ✅ Catálogo de ejercicios ampliado a 62
- ✅ Botón "Duplicar rutina"
- ✅ Preferencias del Perfil persistidas
- ✅ Heatmap de actividad + gráfico de progreso por ejercicio
- ✅ Récords personales (PRs) automáticos
- ✅ Modo coach (sugerir alternativa + generar rutina sugerida)

---

## 📝 TODO / Pendientes

### UX/UI Design 🎨
- [x] Diseño visual con identidad FitSync (#0A2E6E + #29B0E8)
- [x] Mobile-first responsive design
- [x] Componentes con Tailwind CSS
- [x] Pantalla activa de entrenamiento con botones +/- sin teclado

### Autenticación & Seguridad 🔐
- [x] Implementar JWT o sesiones
- [ ] Validación de datos (zod o yup)
- [ ] Rate limiting
- [ ] CORS configurado por ambiente

### Base de Datos 🗄️
- [x] Migración a Supabase
- [x] Policies de RLS reales
- [ ] Migrations/Seeders
- [ ] Índices optimizados
- [ ] Soft deletes

### Features MVP 🚀
- [x] Historial inmediato ("Última vez: 100kg × 5 reps")
- [x] Cronómetro de descanso integrado
- [x] Catálogo de ejercicios ampliado (bilingüe pendiente)
- [ ] Freemium (máx. 3 rutinas en tier gratuito)

### Features V2 🔮
- [ ] Analytics avanzados de progreso (1RM estimado)
- [ ] Backup en la nube
- [ ] Sincronización multidispositivo
- [ ] Exportación de historial
- [ ] Widget iOS/Android

### Testing 🧪
- [ ] Unit tests (backend)
- [ ] Integration tests
- [ ] E2E tests (frontend)

### DevOps & Deploy 🚀
- [x] Deploy frontend en Vercel
- [x] Deploy backend en Render
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker setup
- [ ] Captura de pantalla de la app en producción (README)

---

## 🔧 Configuración Inicial (Primera Vez)

```bash
# Clonar repo
git clone https://github.com/ezerossetti/fit-sync
cd fit-sync

# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install

# Volver a raíz
cd ..

# Configurar variables de ambiente
cp .env.example .env
```

### Variables de Ambiente

Copia `.env.example` a `.env` y ajustá según tu ambiente:

```bash
# Backend Configuration
NODE_ENV=development
PORT=3000

# Database (Supabase)
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>

# Frontend Configuration
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

En producción, `VITE_API_URL` se configura en Vercel apuntando al backend de Render (`https://fit-sync-59pg.onrender.com`), y `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` se configuran en Render con los mismos valores del `.env` local.

**Nota:** El archivo `.env` está en `.gitignore`. Usá `.env.example` como referencia.

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"
```bash
cd backend && npm install
```

### Error: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Error: Proxy no funciona en frontend
- Verificar que el backend corre en `localhost:3000`
- Verificar que `vite.config.js` tiene el proxy configurado
- Reiniciar el dev server del frontend

### Error: "getAll devuelve array vacío"
- Verificar que el token de sesión se manda en el header `Authorization: Bearer <token>`
- Revisar que el usuario logueado tiene filas asociadas a su `usuario_id`

### Error: `Failed to resolve import "@supabase/supabase-js"`
```bash
cd frontend && npm install @supabase/supabase-js
```

### Error: `violates foreign key constraint "usuarios_id_fkey"`
- Hay filas viejas en `usuarios` que no existen en `auth.users`. Revisar y borrar antes de aplicar la FK.

### Error: `new row violates row-level security policy`
- Falta `SUPABASE_SERVICE_ROLE_KEY` en el `.env` del backend o en Render.

---

## 👤 Autor

**Ezequiel Rossetti** — Estudiante Ing. Informatica
Proyecto desarrollado en el curso IADE — Diseño de Experiencias · DigitAR / Digital House

---

## 📄 Licencia

MIT

---

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/nueva-feature`
2. Commit: `git commit -am 'feat: descripción'`
3. Push: `git push origin feature/nueva-feature`
4. Pull Request

---

**Última actualización:** Julio 2026 (Auth con Supabase Auth, catálogo 62 ejercicios, heatmap + progreso, modo coach)
