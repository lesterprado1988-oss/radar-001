# RADAR — Experimento #001

## Segundo cerebro personal

RADAR deja de tratar cada entrada como un dato aislado. Esta base conserva la memoria local existente (`radar_memory_v09`) y añade una primera capa de contexto:

- recuerda lo que el usuario cuenta;
- relaciona emociones repetidas;
- detecta temas recurrentes;
- distingue intención, compromiso, logro, preocupación, dinero y recordatorios;
- genera respuestas que cambian según el contexto acumulado;
- explica por qué está haciendo una observación;
- aprende del feedback de utilidad;
- muestra patrones emergentes en Memoria y Resumen del día.

La siguiente evolución natural es conectar fuentes externas autorizadas por el usuario (calendario, correo, salud, actividad, uso de aplicaciones, etc.) para ampliar el contexto sin convertir RADAR en un reemplazo de esas apps.

La memoria sigue siendo local al dispositivo. Las notificaciones de la PWA dependen del soporte del navegador y de que el sistema permita su ejecución; para garantías más fuertes será necesario el cliente Android nativo.
