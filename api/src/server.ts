import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PacienteModel from './model/paciente.model.js';
import PasswordService from './services/password.services.js';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost"
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:secretpassword@127.0.0.1:27017/turnami_db?authSource=admin';

async function seedPacienteDePrueba() {
  const dni = '00000000';
  const pacienteExistente = await PacienteModel.findOne({ dni }).exec();

  if (!pacienteExistente) {
    await PacienteModel.create({
      dni,
      password: await PasswordService.hash('1234'),
      nombre: 'Maria',
      apellido: 'Gonzalez',
    });
    console.log(' Paciente de prueba creado');
  }
}

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB');
    await seedPacienteDePrueba();

    app.listen(PORT, () => {
      console.log(` Servidor corriendo en ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

bootstrap();