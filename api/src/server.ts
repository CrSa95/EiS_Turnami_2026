import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost"
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:secretpassword@127.0.0.1:27017/turnami_db?authSource=admin';

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB');

    app.listen(PORT, () => {
      console.log(` Servidor corriendo en ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

bootstrap();