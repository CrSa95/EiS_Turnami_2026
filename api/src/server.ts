import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PacienteModel from './model/paciente.model.js';
import MedicoModel from './model/medico.model.js';
import PasswordService from './services/password.services.js';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost"
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:secretpassword@127.0.0.1:27017/turnami_db?authSource=admin';

async function seedMedicoDePrueba() {
  const dni = '11223344';
  const medicoExistente = await MedicoModel.findOne({ dni }).exec();

  if (!medicoExistente) {
    await MedicoModel.create({
      dni,
      password: await PasswordService.hash('1234'),
      nombre: 'Juan',
      apellido: 'Perez',
    });
    console.log(' Medico de prueba creado');
  }
}

async function seedPacienteDePrueba() {
  const pacientes = [
    {
      dni: "00000000",
      nombre: "Maria",
      apellido: "Gonzalez",
    },
    {
      dni: "12345678",
      nombre: "Ana",
      apellido: "Lopez",
    },
    {
      dni: "87654321",
      nombre: "Carlos",
      apellido: "Rodriguez",
    },
  ];

  for (const paciente of pacientes) {
    const pacienteExistente = await PacienteModel.findOne({
      dni: paciente.dni,
    }).exec();

    if (!pacienteExistente) {
      await PacienteModel.create({
        ...paciente,
        password: await PasswordService.hash("1234"),
        medicoDni: "11223344",
      });
      console.log(` Paciente de prueba creado: ${paciente.dni}`);
    }
  }
}

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB');
    await seedMedicoDePrueba();
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