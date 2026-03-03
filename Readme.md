# 💬 Real-Time Chat Application

![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?style=for-the-badge&logo=next.js)
![Zustand](https://img.shields.io/badge/State_Management-Zustand-blue?style=for-the-badge&logo=react)
![Colyseus](https://img.shields.io/badge/Backend-Colyseus-red?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

Un proyecto de aprendizaje _Full-Stack_ enfocado en la construcción de sistemas interactivos en tiempo real utilizando la web moderna. Esta aplicación permite a los usuarios crear salas de chat dinámicas, conectarse mediante identificadores únicos y recibir notificaciones instantáneas de soporte.

## 🚀 Características Principales

- **Salas Multijugador en Tiempo Real**: Arquitectura cliente-servidor basada en WebSockets estables.
- **Soporte & Administración Activa**: Salas especiales (`admin-xxx`) que contactan en milisegundos a un Bot de Telegram notificando al administrador de eventos importantes.
- **Memoria Temporal (QoL)**: Al entrar a una sala viva, el Backend te provee contexto instantáneo de los últimos 50 mensajes de historial enviados mientras no estabas.
- **Micro-interacciones Reactivas**: Sistema de avisos visuales automáticos cuando los participantes entran o salen de una sala.
- **Estética Pulida (UX/UI)**: Uso extremo de diseños fluidos, modo híbrido, `lucide-react`, efectos Glassmorphism (`backdrop-blur`) y `Tailwind CSS V4`.

---

## 🏗️ Arquitectura del Repositorio (Monorepo)

Este proyecto fue estructurado en un formato monorepo para facilitar la distribución de "tipos", schemas y validaciones compartidas entre el navegador y el servidor sin duplicar código.

```text
ChatApp/
├── front/        # 💻 Aplicación Client-Side y Server-Side (Next.js App Router)
├── back/         # ⚙️  Servidor de estado en memoria (Node.js + Colyseus)
└── shared/       # 🤝 Interfaces, Tipos y Schemas compartidos
```

### 1. El Frontend (`/front`)

Construido sobre **Next.js 15 (Turbopack)**. Emplea las últimas convenciones de la web:

- `Zustand` se encarga del estado global (`useChatStore`) para persistir la conexión WebSockets entre rutas complejas sin reconectar innecesariamente.
- `TailwindCSS` se hace cargo de Variables Dinámicas para dar vida a un tema oscuro moderno, inyectando bordes iluminados estilo "Neón" y gradientes envolventes.

### 2. El Backend (`/back`)

Cimentado totalmente bajo la supremacía temporal de **Colyseus** (El estándar actual para juegos multijugador HTML5 y Chat masivo):

- Administra ciclos de vida: `onJoin()`, `onLeave()`, `onMessage()`.
- Valida internamente y expulsa clientes desconectados ahorrando memoria (`garbage collection`).
- Empaca los scripts de ejecución en CommonJS listos para plataformas en la Nube (como **Render.com**), y soporta el uso nativo de Node.js via `.env`.

### 3. Shared (`/shared`)

El pegamento entre las 2 aplicaciones. Garantiza en tiempo de compilación (Typescript) que tanto el servidor que envía un _mensaje_, como el Front que lo _lee_, interpreten los mismos datos exactamente.

---

## 🛠 Instalación y Uso (Desarrollo Local)

Necesitas tener pre-instalado Node.JS (v18+) y NPM.

**Primero, descarga las dependencias principales en ambos entornos:**

```bash
cd back/ && npm install
cd ../front/ && npm install
```

**Variables de Entorno necesarias:**

- En `/back/.env`: Crea un archivo listando tu `TELEGRAM_BOT_TOKEN`, el número general `PORT`, y tu ID directo en la app celular (`USER_ID`).
- En `/front/.env.local`: Crea un flag apuntando tu backend `NEXT_PUBLIC_COLYSEUS_URL=ws://localhost:2567`.

**Levantar el Entorno Dual:**
Abre dos terminales por separado en la raíz del proyecto.

1. `cd back && npm run dev`
2. `cd front && npm run dev`

¡Visita tu portal dimensional en [http://localhost:3000](http://localhost:3000)!

---

## 📚 Objetivos de Aprendizaje

Este proyecto fue conceptualizado por **Mario Gomariz (@mariogomariz)** para explorar activamente las fronteras de:

1. **La comunicación bidireccional continua** sin HTTP Polling (WebSockets vs tRPC vs REST).
2. Sincronización de un Framework React.js robusto (_Next.js_) con los sistemas de validación estrictos que asumen las salas de _Colyseus_.
3. Estrategias de manejo de colisiones (Doble renderizado en Strict-Mode, Conexiones huérfanas).
4. Prácticas de UI/UX contemporáneas.
5. Emisión silenciosa en el Back hacia APIS de terceros asíncronas (Notificaciones Vía Telegram API Bots).
