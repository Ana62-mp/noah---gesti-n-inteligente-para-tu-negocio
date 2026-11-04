# NOAH - Gestión inteligente para tu negocio

Prototipo navegable de una plataforma de gestión para restaurantes, tiendas y barberías, con el asistente de voz y texto "Noah". Todos los datos son de ejemplo.

## Ejecutar en local

```
npm install
copy .env.example .env
npm run dev
```

La app abre en http://localhost:3000. Sin clave de IA funciona completa en modo demo.

## Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `GEMINI_API_KEY` | No | Activa el "Modo IA real" del chat. Sin ella el chat responde en modo demo |
| `GEMINI_MODEL` | No | Modelo de Gemini a usar. Por defecto `gemini-2.5-flash` |

En Vercel se configuran en Settings, Environment Variables, sin prefijo `VITE_`. `/api/health` indica con `hasGeminiKey` si hay clave, sin mostrarla.

## Despliegue en Vercel

`vercel.json` ya define la instalación (`npm ci`), el build y el redireccionamiento de la SPA. Las funciones de `api/` sirven el chat y la comprobación de estado. Cada rama genera un despliegue de Preview; `main` es producción.

## Pruebas

```
npm run lint
npm test
```

## Roles

| Rol | Ve |
|---|---|
| Dueño | Todo el negocio, sus finanzas y la configuración |
| Caja | Ventas, cobros, mesas, delivery y carta con precios |
| Mesero | Mesas, pedidos por voz y carta con precios |
| Cocina | Solo comandas |
| Inventario | Insumos, compras de mercadería, proveedores y alertas de stock |

Las reglas viven en `src/shared/permissions/rolePermissions.ts`. En este prototipo se aplican en el navegador; en producción también deben validarse en el servidor.

## Convenciones

Ramas y commits siguen `Commits_Ramas_Git.md`.
