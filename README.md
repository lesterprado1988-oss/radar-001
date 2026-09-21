# RADAR

PWA de RADAR, memoria personal local.

## Reparación aplicada
- Interfaz legible y responsive.
- `📖 Ver memoria` y `🌅 Resumen del día` visibles como acciones secundarias.
- Se conserva la memoria en `localStorage` con la clave `radar_memory_v09`.
- Detección de múltiples señales en una sola entrada.
- Detección de fechas, horas y tiempos relativos.
- Solicitud de permiso para notificaciones sin errores si la API no existe.
- Registro de feedback.
- Resumen construido desde la memoria real.
- Registro del Service Worker para que la PWA pueda actualizarse correctamente.

## Nota sobre recordatorios
Las notificaciones con `setTimeout` funcionan mientras el entorno mantiene activa la página. Una PWA no garantiza una notificación puntual si el sistema suspende o cierra completamente la aplicación. Para notificaciones fiables en Android habrá que llevar esta misma lógica a notificaciones nativas.
