import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ImageModel from '../model/image.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:secretpassword@127.0.0.1:27017/turnami_db?authSource=admin';

const ordenesBase = [
  {
    idImagen: "O0001",
    tipo: "Orden" as const,
    filename: "orden_0001.jpg",
    filepath: "/uploads/orden_0001.jpg",
    mimetype: "image/jpeg",
    size: 1024,
    pacienteDni: "00000000",
    estado: "Pendiente" as const,
    fecha: new Date("2026-09-01T10:00:00Z"), // 01 SEP
  },
  {
    idImagen: "O0002",
    tipo: "Orden" as const,
    filename: "orden_0002.jpg",
    filepath: "/uploads/orden_0002.jpg",
    mimetype: "image/jpeg",
    size: 2048,
    pacienteDni: "00000000",
    estado: "Pendiente" as const,
    fecha: new Date("2026-09-02T10:00:00Z"), // 02 SEP
  },
  {
    idImagen: "O0102",
    tipo: "Orden" as const,
    filename: "orden_0002.jpg",
    filepath: "/uploads/orden_0002.jpg",
    mimetype: "image/jpeg",
    size: 2048,
    pacienteDni: "00000000",
    estado: "Pendiente" as const,
    fecha: new Date("2026-09-01T10:00:01Z"), // 01 SEP un segundo después de la O0001
  },
];

async function runSeed() {
  const targetId = process.argv[2]; 

  const ordenesAProcesar = targetId
    ? ordenesBase.filter((o) => o.idImagen === targetId)
    : ordenesBase;

  if (ordenesAProcesar.length === 0) {
    console.error(` No se encontró la orden "${targetId}". Opciones válidas: O0001, O0002`);
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB para seed de Órdenes');

    for (const orden of ordenesAProcesar) {
      const { fecha, ...datosOrden } = orden;

      await ImageModel.collection.updateOne(
        { idImagen: orden.idImagen },
        { 
          $set: {
            ...datosOrden,
            createdAt: fecha,
            updatedAt: fecha,
          } 
        },
        { upsert: true }
      );

      console.log(` Orden procesada: ${orden.idImagen} | Fecha grabada: ${fecha.toISOString()}`);
    }

    console.log(' Seed finalizado exitosamente.');
  } catch (error) {
    console.error(' Error al ejecutar el seed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runSeed();