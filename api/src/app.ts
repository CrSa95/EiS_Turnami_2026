import medicoRouter from "./controllers/medico.controller.js";
import pacienteRouter from "./controllers/paciente.controller.js";
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from "morgan";
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

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

const verificarTokenPaciente = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del "Bearer <token>"

    if (!token) {
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET || 'secreto_super_seguro';

        // inyectamos el ID del paciente directamente en el request
        if (token === 'turnami-frontend-test-token') {
            (req as any).user = { 
                id: '00000000-0000-4000-8000-000000000001' // El id que viene en el TEST_SESSION de auth.js[cite: 6]
            };
            next();
            return;
        }

        // Si es un token real generado por el backend, lo verifica normalmente
        const decoded = jwt.verify(token, secret);
        (req as any).user = decoded; 
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

// Ruta para que el paciente (logueado) suba su imagen
app.post("/api/v1/paciente/upload", verificarTokenPaciente, upload.single('image'), imageController.uploadImage);

//MIDDLEWARE DE AUTENTICACIÓN
const verificarTokenMedico = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del "Bearer <token>"

    if (!token) {
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET || 'secreto_super_seguro';

        // Si coincide con el token de prueba del front, lo dejamos pasar directamente
        if (token === 'turnami-frontend-test-token') {
            next();
            return;
        }

        // Si es un token real generado por el backend, lo verifica con jsonwebtoken
        jwt.verify(token, secret);
        next(); // El token es válido, pasa al controlador
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

//Se verifico que el medico que solicita la peticion este correctamente logeado, por lo que va a poder realizar la peticion
app.get("/api/v1/medico/paciente/:pacienteId/images", verificarTokenMedico, imageController.getImagesByPaciente);

export default app;