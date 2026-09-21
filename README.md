# RADAR Diario v0.3

PWA local para diario, detección básica de señales, memoria y recordatorios.

## Publicación
Sube el contenido de esta carpeta a tu repositorio de GitHub Pages, reemplazando los archivos anteriores. Mantén `index.html`, `manifest.webmanifest`, `sw.js` e `icon.svg` en la raíz.

## Datos
Las entradas, señales, feedback y recordatorios se guardan en `localStorage` del navegador/dispositivo.

## Notificaciones
El navegador debe conceder permiso. En esta versión, las notificaciones se comprueban mientras la aplicación está activa; el navegador puede limitar notificaciones programadas en segundo plano. Para notificaciones realmente fiables en segundo plano habrá que añadir un mecanismo específico de plataforma/servidor en una versión posterior.
