import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Rutas existentes
import medicoRouter from "./controllers/medico.controller.js";
import pacienteRouter from "./controllers/paciente.controller.js";
import ImageModel from './model/image.model.js'; 

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// --- 1. CONFIGURACIÓN DE CARPETA DE SUBIDAS ---
// Usamos path.resolve para evitar problemas de __dirname en ES Modules
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Exponer la carpeta uploads para poder ver las imágenes desde el navegador
app.use('/uploads', express.static(uploadDir));

// --- 2. CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Renombrar archivo con la fecha actual para evitar duplicados
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- 3. RUTAS DE LA API ---
app.use("/api/v1/medico", medicoRouter);
app.use("/api/v1/paciente", pacienteRouter);

// Ruta para subir la imagen (la integramos aquí)
// Opcionalmente puedes mover esto a un upload.controller.js en el futuro
app.post('/api/v1/upload', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se envió ninguna imagen' });
      return;
    }

    
     
      
      const newImage = new ImageModel({
        filename: req.file.filename,
        filepath: `/uploads/${req.file.filename}`, 
        mimetype: req.file.mimetype,
        size: req.file.size
      });
      await newImage.save();
      
      res.status(201).json({
        message: 'Imagen subida exitosamente',
        image: newImage
      });
    

    // Respuesta temporal si no usas Base de Datos de momento
    res.status(201).json({
      message: 'Imagen subida exitosamente',
      fileInfo: {
        filename: req.file.filename,
        filepath: `/uploads/${req.file.filename}`
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al subir la imagen', error });
  }
});

export default app;