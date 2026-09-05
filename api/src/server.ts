import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost"
app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${HOST}:${PORT}`);
});
