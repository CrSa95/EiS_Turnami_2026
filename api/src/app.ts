import medicoRouter from "./controllers/medico.controller.js"
import pacienteRouter from "./controllers/paciente.controller.js"
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from "morgan"
const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'))

app.use("/api/v1/medico", medicoRouter)
app.use("/api/v1/paciente", pacienteRouter)
export default app;
