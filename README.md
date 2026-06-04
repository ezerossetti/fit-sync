# 💪 FitSync

> Tu fuerza, en datos.

---

## 🎯 Descripción

**FitSync** es una PWA (Progressive Web App) de registro de entrenamiento de fuerza para deportistas amateurs de 18-35 años que entrenan sin entrenador en Argentina. La app permite registrar series, pesos y repeticiones sin teclado, mostrando el historial de la sesión anterior antes de cada ejercicio para facilitar la sobrecarga progresiva.

**Stack:**
- **Backend:** Node.js + Express.js (ES modules)
- **Frontend:** Vite + React 18 + Axios (PWA)
- **Base de datos:** Preparada para Supabase (actualmente con datos mockeados)

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
│   │   ├── models/
│   │   │   ├── sesion.model.js       # Mock data (Supabase ready)
│   │   │   ├── rutina.model.js
│   │   │   └── usuario.model.js
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
│       ├── components/
│       │   ├── SesionesList.jsx
│       │   ├── SesionForm.jsx
│       │   ├── UsuarioList.jsx
│       │   └── UsuarioForm.jsx
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
- `usuario_id` hardcodeado: `'user-123'`

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
- ✅ Datos mockeados listos para Supabase
- ✅ Frontend Vite + React con proxy (PWA)
- ✅ 4 componentes funcionales (CRUD básico)
- ✅ 3 servicios con 5 métodos CRUD cada uno
- ✅ Manejo de loading y errores
- ✅ CSS inline mínimo (scaffold)
- ✅ Postman collection para testing
- ✅ Migración PATCH → PUT
- ✅ Backend separado en directorio propio

---

## 📝 TODO / Pendientes

### UX/UI Design 🎨
- [ ] Diseño visual con identidad FitSync (#0A2E6E + #29B0E8)
- [ ] Mobile-first responsive design
- [ ] Componentes con Tailwind CSS
- [ ] Pantalla activa de entrenamiento con botones +/- sin teclado

### Autenticación & Seguridad 🔐
- [ ] Implementar JWT o sesiones
- [ ] Validación de datos (zod o yup)
- [ ] Rate limiting
- [ ] CORS configurado por ambiente

### Base de Datos 🗄️
- [ ] Migración a Supabase
- [ ] Migrations/Seeders
- [ ] Índices optimizados
- [ ] Soft deletes

### Features MVP 🚀
- [ ] Historial inmediato ("Última vez: 100kg × 5 reps")
- [ ] Cronómetro de descanso integrado
- [ ] Catálogo de ejercicios bilingüe
- [ ] Freemium (máx. 3 rutinas en tier gratuito)

### Features V2 🔮
- [ ] Analytics avanzados de progreso
- [ ] Backup en la nube
- [ ] Sincronización multidispositivo
- [ ] Exportación de historial
- [ ] Widget iOS/Android

### Testing 🧪
- [ ] Unit tests (backend)
- [ ] Integration tests
- [ ] E2E tests (frontend)

### DevOps & Deploy 🚀
- [ ] Deploy frontend en Vercel
- [ ] Deploy backend en Railway
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker setup

---

## 🔧 Configuración Inicial (Primera Vez)

```bash
# Clonar repo
git clone https://github.com/tu-usuario/fit-sync.git
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

# Frontend Configuration
VITE_API_URL=http://localhost:3000

# Database (Supabase - Futuro)
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
```

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
- Verificar que `usuarioId` se pasa correctamente en las rutas
- Revisar que el mock filtra por `usuario_id === 'user-123'`

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

**Última actualización:** Junio 2026
