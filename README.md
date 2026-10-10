# EiS_PaMi_2026


1. crear un archivo .env en la carpeta /api con la siguiente configuración
```
MONGO_URI=mongodb://127.0.0.1:27017/turnami_db
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=Turnami <onboarding@resend.dev>
NOTIFICATION_RECIPIENT_EMAIL=tu-correo@ejemplo.com
``` 

`RESEND_API_KEY` es la clave privada de Resend. Sin registrar un dominio,
utilizá `onboarding@resend.dev` como remitente. En el plan gratuito/modo de
prueba, Resend limita el envío a la dirección de correo verificada de tu propia
cuenta; configurá esa misma dirección en `NOTIFICATION_RECIPIENT_EMAIL`.
Para enviar a otros destinatarios, Resend requiere verificar un dominio.
Si Resend falla al notificar el rechazo de una orden, esta vuelve a quedar
pendiente y el médico puede reintentar desde el modal.

Los correos se envían con una plantilla HTML común de Turnami (logo y colores
institucionales). Para reutilizarla en nuevas notificaciones, usar
`EmailService.sendBrandedEmail` con el asunto, la versión de texto y el contenido
HTML del mensaje.

2. Buildear la primera vez y levantar proyecto, primero el backend y luego el frontend, en diferentes terminales
```
BD:
net start MongoDB

BACKEND:
cd api
npm install
npm run dev

FRONTEND:
npm install
npm run dev

npm run start
```

3. abrir la app yendo a la pagina http://localhost:5173/