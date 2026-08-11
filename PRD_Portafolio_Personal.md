# PRD — Portafolio Digital Personal (Imágenes, Videos y Proyectos)

**Versión:** 1.0
**Fecha:** Agosto 2026
**Tipo de documento:** Product Requirements Document (para desarrollo asistido por IA)

---

## 1. Resumen Ejecutivo

Sitio web tipo portafolio para una persona (artista/creativo, según referencia visual) que exhibe proyectos compuestos por imágenes y videos, con estética editorial minimalista (referencia: `wggremiclementine.showit.site` y capturas adjuntas de Julian Jeffreys — murales, fine art, diseño gráfico, brand design).

El sistema tiene **dos módulos**:

1. **Módulo Público (Frontend visible):** landing, galería de proyectos, detalle de proyecto, sobre mí, contacto.
2. **Módulo Admin (Panel de gestión):** CRUD de proyectos, subida/organización de imágenes y videos, orden de despliegue, categorías, borradores/publicado.

Es un proyecto de **volumen pequeño** (<50 proyectos), pero el PRD está pensado con buenas prácticas para escalar sin reescritura si el contenido crece.

---

## 2. Objetivos del Producto

- Mostrar el trabajo de la persona de forma visualmente impactante (full-bleed, mosaicos, hero grid).
- Permitir que el dueño del contenido (admin) suba/edite/organice proyectos sin tocar código.
- Soportar imágenes **y** video embebido/alojado por proyecto.
- Ser rápido, responsive y con buen SEO (portafolio = necesita indexar bien en Google/Redes).
- Bajo costo de infraestructura (idealmente gratis o unos pocos dólares/mes).

## 3. Fuera de alcance (v1)

- E-commerce / venta de obras.
- Sistema de comentarios públicos.
- Múltiples usuarios/roles admin (solo 1 admin).
- Blog (se puede dejar como extensión futura).

---

## 4. Usuarios y Roles

| Rol | Descripción | Permisos |
|---|---|---|
| **Visitante (público)** | Cualquier persona que navega el sitio | Solo lectura: ver proyectos publicados, imágenes, videos, contacto |
| **Admin (dueño del portafolio)** | Única persona que gestiona contenido | CRUD completo de proyectos, media, categorías, orden, estado (borrador/publicado) |

> No se requiere sistema de registro público. El admin se autentica con usuario/contraseña (o login simple protegido).

---

## 5. Arquitectura Técnica (Stack Elegido)

Dado que el desarrollador es **Python** y trabaja con servidores **Ubuntu/Windows Server**, se define:

### Backend
- **Framework:** Django (recomendado sobre FastAPI para este caso) porque:
  - Trae **admin panel** ya construido (Django Admin), lo cual acelera muchísimo el módulo admin.
  - Django ORM + migraciones = manejo robusto de modelo de datos con crecimiento futuro.
  - Django REST Framework (DRF) para exponer API consumida por el frontend público.
- **Alternativa más liviana:** FastAPI + SQLAdmin/SQLModel si se prefiere algo más minimalista y con mayor control manual (más trabajo construir el admin desde cero).
- **Base de datos:** PostgreSQL (gratis, robusto, soporta JSONField para metadatos flexibles de proyecto).

### Frontend (separado del backend, consumiendo API)
- **Next.js (React)** — ideal para SEO (SSR/SSG), performance de imágenes (next/image), y estética tipo "editorial" con animaciones/scroll.
- Alternativa: si preferís mantener todo en Python, Django Templates + HTMX + Alpine.js (menos moderno visualmente pero 100% Python, cero contexto extra de JS framework).

**Recomendación final:** Django + DRF (backend/admin) + Next.js (público), separados por API REST. Esto da la mejor combinación de: admin gratis de Django, performance de Next.js, y SEO fuerte.

### Almacenamiento de imágenes y video (pregunta clave: barato o gratis)

| Opción | Costo | Pros | Contras |
|---|---|---|---|
| **Cloudinary (recomendado)** | Free tier: 25GB storage + 25GB bandwidth/mes | Transformaciones automáticas (resize, WebP, thumbnails), soporta video, CDN incluido, SDK oficial para Django/Python | Límite gratis puede quedarse corto si subís videos pesados en HD |
| Cloudflare R2 + Cloudflare CDN | Storage barato (~$0.015/GB) + **cero costo de egress (salida de datos)** | Muy barato a largo plazo, buena performance | Sin transformación de imágenes automática (hay que hacerla vos con Pillow/ffmpeg antes de subir) |
| AWS S3 + CloudFront | Storage barato, pero egress cobra | Estándar de industria, muy documentado | Factura puede sorprender si hay tráfico de video alto |
| Servidor propio (Ubuntu) | Gratis si ya tenés el servidor | Control total | Vos sos responsable de backups, CDN, ancho de banda; para video no es lo ideal |

**Recomendación para este caso (portafolio chico, <50 proyectos):**
👉 **Cloudinary free tier.** Con <50 proyectos el límite gratuito alcanza sobradamente, tiene SDK de Python (`cloudinary` package), se integra fácil con Django (`django-cloudinary-storage`), maneja imagen y video, y genera automáticamente thumbnails/versiones optimizadas — lo cual evita procesar video/imagen manualmente.

Si en el futuro se supera el free tier: migrar a Cloudflare R2 manteniendo la misma interfaz de storage abstracta (ver sección de arquitectura desacoplada más abajo).

### Hosting / Deploy

| Componente | Opción gratuita/barata sugerida |
|---|---|
| Backend Django + API | Railway.app / Render.com (free tier) o VPS Ubuntu propio |
| Frontend Next.js | Vercel (free tier, ideal para Next.js) |
| Base de datos PostgreSQL | Supabase (free tier) o Render Postgres free |
| Dominio | Namecheap / Google Domains (~$10-15/año) |

---

## 6. Arquitectura Desacoplada (Buenas Prácticas de Escalabilidad)

Aunque el volumen es chico hoy, se diseña para escalar:

```
┌─────────────┐      REST API (JSON)      ┌──────────────┐
│  Next.js     │ ────────────────────────▶ │  Django + DRF │
│  (Público)   │ ◀──────────────────────── │  (Backend)    │
└─────────────┘                            └───────┬───────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  PostgreSQL DB   │
                                            └──────────────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  Cloudinary       │
                                            │  (Media Storage)  │
                                            └────────────────────┘

┌──────────────────┐
│  Django Admin      │  ← Módulo Admin (protegido, /admin o /panel)
│  (o panel custom)  │
└──────────────────┘
```

**Principios aplicados:**
- **Separation of concerns:** admin, API pública y frontend son capas independientes.
- **Storage abstraction:** usar `django-storages` con backend intercambiable (Cloudinary hoy, S3/R2 mañana sin tocar el resto del código).
- **Stateless API:** permite escalar horizontalmente el backend si el tráfico crece.
- **Cache:** usar cache de Django (Redis opcional) para endpoints públicos de alta lectura (listado de proyectos).
- **CDN por defecto:** las imágenes siempre se sirven vía CDN (Cloudinary), nunca desde el servidor Django directamente.

---

## 7. Modelo de Datos (Alto Nivel)

### `Project` (Proyecto)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID/PK | |
| title | string | |
| slug | string único | para URLs amigables `/portfolio/nombre-proyecto` |
| category | FK → Category | ej: Murales, Fine Art, Diseño Gráfico, Brand Design |
| description | text (rich text) | |
| cover_image | Media (imagen) | imagen destacada para el grid/mosaico |
| status | enum | `draft` / `published` |
| order | integer | orden manual de despliegue en el grid |
| featured | boolean | destacar en home |
| tags | M2M → Tag | opcional, para filtros |
| created_at / updated_at | datetime | |
| client_name | string (opcional) | |
| project_date | date (opcional) | |

### `MediaItem` (Imagen o Video dentro de un proyecto)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID/PK | |
| project | FK → Project | |
| type | enum | `image` / `video` |
| file_url | string (Cloudinary URL) | |
| thumbnail_url | string | auto-generado por Cloudinary |
| order | integer | orden dentro de la galería del proyecto |
| alt_text | string | accesibilidad + SEO |
| caption | string (opcional) | |

### `Category`
| Campo | Tipo |
|---|---|
| id | PK |
| name | string |
| slug | string |

### `SiteSettings` (singleton, editable desde admin)
- Bio / texto "sobre mí"
- Foto de perfil
- Redes sociales (Instagram, etc.)
- Email de contacto
- SEO meta (título/descripción del sitio)

---

## 8. Requisitos Funcionales

### Módulo Público
- RF01: Home con hero visual (grid de imágenes destacadas, similar a la referencia).
- RF02: Sección de portafolio con grid/mosaico filtrable por categoría.
- RF03: Página de detalle de proyecto con galería (imágenes + video reproducible inline).
- RF04: Página "Sobre mí".
- RF05: Formulario de contacto (envía email al admin, con protección anti-spam/captcha).
- RF06: Diseño 100% responsive (mobile-first, ya que gran parte del tráfico de portafolios es mobile).
- RF07: Meta tags dinámicos por proyecto (Open Graph para compartir en redes).
- RF08: Lazy loading de imágenes/video para performance.

### Módulo Admin
- RA01: Login protegido (usuario/contraseña, 2FA opcional recomendado).
- RA02: CRUD de proyectos (crear, editar, eliminar, duplicar).
- RA03: Subida de múltiples imágenes/videos por proyecto (drag & drop deseable).
- RA04: Reordenar proyectos y media (drag & drop o campo `order`).
- RA05: Estado borrador/publicado (previsualizar antes de publicar).
- RA06: Gestión de categorías/tags.
- RA07: Edición de contenido de "Sobre mí" y datos de contacto sin tocar código.
- RA08: Optimización automática de imágenes al subir (vía Cloudinary, sin intervención manual).

---

## 9. Requisitos No Funcionales

- **Performance:** Lighthouse score ≥ 90 en mobile (imágenes optimizadas, lazy load, CDN).
- **SEO:** SSR/SSG en Next.js, sitemap.xml, robots.txt, schema.org (Person/CreativeWork).
- **Seguridad:**
  - Admin detrás de autenticación fuerte (rate limiting en login).
  - HTTPS obligatorio (Let's Encrypt si es VPS propio, automático en Vercel/Render).
  - Sanitización de inputs (Django lo maneja por defecto contra SQLi/XSS).
  - Variables sensibles (API keys de Cloudinary, DB) en `.env`, nunca en código.
- **Escalabilidad:** arquitectura desacoplada (ver sección 6) permite crecer sin reescritura mayor.
- **Backups:** backup automático de base de datos (diario, retención 7-30 días) — Render/Supabase lo ofrecen en free tier con limitaciones, evaluar según proveedor final.
- **Accesibilidad:** alt text obligatorio en imágenes (campo en modelo `MediaItem`).
- **Mantenibilidad:** código tipado donde aplique (type hints en Python, TypeScript en Next.js), tests unitarios básicos en endpoints críticos del API.

---

## 10. Flujo de Usuario (User Flow)

**Visitante:**
Home → ve grid destacado → entra a Portfolio → filtra por categoría → click en proyecto → ve galería completa (imágenes + video) → opcionalmente va a Contacto.

**Admin:**
Login → Dashboard → "Nuevo Proyecto" → completa título/categoría/descripción → sube imágenes/video → ordena → marca como "Publicado" → aparece automáticamente en el sitio público.

---

## 11. Roadmap / Fases de Desarrollo

| Fase | Alcance |
|---|---|
| **Fase 1 — MVP** | Modelo de datos, Django Admin funcional, API DRF básica, integración Cloudinary |
| **Fase 2 — Frontend público** | Next.js consumiendo API: Home, Portfolio grid, Detalle de proyecto, Sobre mí, Contacto |
| **Fase 3 — Pulido admin custom** | (Opcional) reemplazar Django Admin por panel custom más visual si se desea mejor UX para el cliente final |
| **Fase 4 — SEO + Performance** | Sitemap, meta tags, optimización de imágenes, analytics (Google Analytics/Plausible) |
| **Fase 5 — Deploy** | Backend en Render/Railway, Frontend en Vercel, DB en Supabase, dominio propio |

---

## 12. Stack Resumen (para pasarle a la IA generadora de código)

```
Backend:        Django 5.x + Django REST Framework
Base de datos:  PostgreSQL
Storage media:  Cloudinary (django-cloudinary-storage)
Frontend:       Next.js 14+ (App Router) + TypeScript + TailwindCSS
Auth admin:     Django Auth (sesión) o JWT si el admin se separa a un panel propio en Next.js
Hosting BE:     Render / Railway (free tier)
Hosting FE:     Vercel (free tier)
DB Hosting:     Supabase Postgres (free tier)
Control ver.:   Git + GitHub
```

---

## 13. Notas para la IA que implementará el proyecto

- Priorizar **Django Admin nativo** para el módulo admin en la Fase 1 (ahorra tiempo de desarrollo enorme, y ya cumple con RA01-RA08 casi de fábrica con customización de `ModelAdmin`).
- Usar `django-cloudinary-storage` para que el campo `file_url` de `MediaItem` se suba automáticamente a Cloudinary al guardar desde el admin.
- El frontend público **nunca** debe tener acceso de escritura a la API — solo lectura (endpoints `GET` públicos, endpoints `POST/PUT/DELETE` protegidos y usados solo por el admin).
- Generar el proyecto con estructura de carpetas clara: `/backend` (Django) y `/frontend` (Next.js) como repos o carpetas separadas dentro de un monorepo.
- Incluir `.env.example` con las variables necesarias (Cloudinary keys, DB URL, SECRET_KEY) sin valores reales.
