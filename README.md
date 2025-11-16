# Sistema de Planillas - Frontend

Este es el frontend del Sistema de Planillas desarrollado con Angular 20.

## Configuración del Proyecto

### Prerrequisitos
- Node.js (versión 18 o superior)
- Angular CLI 20
- Backend API ejecutándose en `http://localhost:8080/api`

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la API:**
   - Asegúrate de que el backend esté ejecutándose en `http://localhost:8080/api`
   - La configuración de la API se encuentra en `src/environments/environment.ts`

### Ejecutar el Proyecto

1. **Servidor de desarrollo:**
   ```bash
   ng serve
   ```

2. **Abrir en el navegador:**
   - URL: `http://localhost:4200`
   - El proyecto iniciará automáticamente en la página de login

### Estructura del Proyecto

```
src/
├── app/
│   ├── core/                 # Servicios, guards, interceptors
│   │   ├── config/          # Configuración de API
│   │   ├── guards/          # Guards de autenticación
│   │   ├── interceptors/    # Interceptors HTTP
│   │   └── services/        # Servicios de la aplicación
│   ├── features/            # Módulos de características
│   │   ├── auth/           # Autenticación (login/register)
│   │   ├── dashboard/      # Panel principal
│   │   ├── main-menu/      # Menú principal
│   │   └── cargo/          # Gestión de cargos
│   └── shared/             # Componentes compartidos
│       ├── components/     # Componentes reutilizables
│       ├── models/         # Modelos de datos
│       └── pipes/          # Pipes personalizados
└── environments/           # Configuración de entornos
```

### Funcionalidades

- **Login:** Autenticación de usuarios
- **Dashboard:** Panel principal con estadísticas
- **Menú Principal:** Navegación entre módulos
- **Gestión de Cargos:** CRUD de cargos (conectado a API)

### Configuración de API

El proyecto está configurado para conectarse a:
- **URL Base:** `http://localhost:8080/api`
- **Endpoints principales:**
  - Login: `/auth/login`
  - Register: `/auth/register`
  - Cargos: `/cargos/*`

### Notas Importantes

- El proyecto usa Angular 20 con componentes standalone
- La autenticación se maneja con JWT tokens
- Los interceptors manejan automáticamente la autenticación y errores
- El proyecto está optimizado para desarrollo y producción

### Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Construir para producción
ng build

# Ejecutar tests
ng test

# Linting
ng lint
```
