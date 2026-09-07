# EiS_PaMi_2026


1. crear un archivo .env en la carpeta /api con las siguiente info 
```
MONGO_URI=mongodb://127.0.0.1:27017/turnami_db
``` 

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