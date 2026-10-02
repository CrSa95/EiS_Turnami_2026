import { Request, Response } from 'express';
import TurnoService from '../services/turno.service.js';

export class TurnoController {
  private turnoService: TurnoService;

  constructor(turnoService: TurnoService) {
    this.turnoService = turnoService;
  }

  solicitarTurno = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteDni = (req as any).user?.dni;
      const { medicoDni, motivo, descripcion, fechaPreferencia, horaPreferencia } = req.body;

      const { mensaje, turno } = await this.turnoService.solicitarTurno({
        pacienteDni,
        medicoDni,     
        motivo,
        descripcion,
        fechaPreferencia,
        horaPreferencia
      });

      res.status(201).json({ mensaje, turno });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al solicitar turno";
      res.status(400).json({ message });
    }
  };

  obtenerEstadoSemanal = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteDni = (req as any).user?.dni;
      const estado = await this.turnoService.obtenerEstadoTurnoSemanal(pacienteDni);
      res.status(200).json(estado);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener estado de turnos";
      res.status(500).json({ message });
    }
  };

  obtenerProximosTurnos = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteDni = (req as any).user?.dni;
      const turnos = await this.turnoService.obtenerProximosTurnos(pacienteDni);
      res.status(200).json({ turnos });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener próximos turnos";
      res.status(500).json({ message });
    }
  };

  obtenerMedicoAsignado = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteDni = (req as any).user?.dni;
      const medico = await this.turnoService.obtenerMedicoAsignado(pacienteDni);
      res.status(200).json(medico);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener el médico";
      res.status(400).json({ message });
    }
  };

  cancelarTurno = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteDni = (req as any).user?.dni;
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        res.status(400).json({ message: "Identificador de turno no válido." });
        return;
      }

      const resultado = await this.turnoService.cancelarTurno(id, pacienteDni);
      res.status(200).json(resultado);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cancelar el turno";
      res.status(400).json({ message });
    }
  };

  turnosDelMedico = async(req: Request, res:Response): Promise<void> => {
    try{
      const medicoDni = (req as any).user?.dni;
      const resultado = await this.turnoService.proximosTurnosMedico(medicoDni)
      res.status(200).json(
        resultado
      )
    }catch(error){
      const message = error instanceof Error ? error.message : "Error al obtener los turnos proximos";
      res.status(500).json({ message });
    }
  }
}

export default TurnoController;