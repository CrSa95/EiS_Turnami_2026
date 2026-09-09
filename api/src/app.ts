import medicoRouter from "./controllers/medico.controller.js";
import pacienteRouter from "./controllers/paciente.controller.js";
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from "morgan";
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Importamos el DAO y Controlador de imágenes para mantener la arquitectura de capas
import ImageDAO from './dao/image.dao.js';
import ImageController from './controllers/image.controller.js';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// --- CONFIGURACIÓN DE CARPETA Y MULTER PARA IMÁGENES ---
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Exponemos la carpeta para que el frontend pueda acceder a las imágenes mediante URL (ej: http://localhost:3000/uploads/nombre.jpg)
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Instanciamos el DAO y el Controlador de imágenes
const imageDAO = new ImageDAO();
const imageController = new ImageController(imageDAO);

// --- RUTAS DE LA API ---
app.use("/api/v1/medico", medicoRouter);
app.use("/api/v1/paciente", pacienteRouter);

// Ruta directa para subir imágenes conectada al controlador
app.post("/api/v1/upload", upload.single('image'), imageController.uploadImage);

export default app;