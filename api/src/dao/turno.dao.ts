import {
    TurnoModel,
    EstadoTurno,
    ITurno,
    ITurnoConPaciente,
} from "../model/turno.model.js";
export class TurnoDAO {
    async buscarTurnosPorEstado(
        pacienteDni: string,
        semanaAnio?: string,
        estados: string[] = [],
    ) {
        const filtro: any = {
            pacienteDni,
        };

        if (semanaAnio) {
            filtro.semanaAnio = semanaAnio;
        }

        if (estados.length > 0) {
            filtro.estado = { $in: estados };
        }

        return await TurnoModel.find(filtro).sort({ fechaPreferencia: 1 });
    }

    async crearTurno(datosTurno: Partial<ITurno>) {
        const nuevoTurno = new TurnoModel(datosTurno);
        return await nuevoTurno.save();
    }

    async obtenerTurnoPorId(id: string): Promise<ITurno | null> {
        return await TurnoModel.findById(id);
    }

    async cancelarTurno(id: string): Promise<ITurno | null> {
        return await TurnoModel.findByIdAndUpdate(
            id,
            { estado: EstadoTurno.CANCELADO },
            { new: true },
        );
    }

    async turnosDelMedico(idMedico: String): Promise<ITurnoConPaciente[]> {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        return await TurnoModel.aggregate([
            {
                $match: {
                    medicoDni: idMedico.toString(),
                    // Excluye fechas anteriores al día de hoy
                    fechaPreferencia: { $gte: hoy },
                },
            },
            {
                $lookup: {
                    from: "pacientes",
                    localField: "pacienteDni",
                    foreignField: "dni",
                    as: "pacienteInfo",
                },
            },
            {
                $unwind: {
                    path: "$pacienteInfo",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    pacienteNombre: "$pacienteInfo.nombre",
                    pacienteApellido: "$pacienteInfo.apellido",
                },
            },
            {
                $sort: {
                    fechaPreferencia: 1,
                    horaPreferencia: 1,
                },
            },
            {
                $project: {
                    pacienteInfo: 0,
                },
            },
        ]);
    }

    async cancelarTurnoDelPaciente(idMedico: string, idTurno: string): Promise<ITurno | null> {
        return await TurnoModel.findOneAndUpdate(
            {
                _id: idTurno,
                medicoDni: idMedico,
                estado: { $in: [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO] },
            },
            { estado: EstadoTurno.CANCELADO },
            { new: true },
        ).exec();
    }

    async restaurarEstadoTurno(idTurno: string, estado: EstadoTurno): Promise<ITurno | null> {
        return await TurnoModel.findOneAndUpdate(
            { _id: idTurno, estado: EstadoTurno.CANCELADO },
            { estado },
            { new: true },
        ).exec();
    }
}
export default TurnoDAO;
