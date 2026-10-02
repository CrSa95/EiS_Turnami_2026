import {formatearFechaTexto} from "../helpers/dateUtils"
export default function TurnoTable({turnos}){
if (!turnos || turnos.length === 0) {
    return (
      <div className="turnos-vacio">
        <p>No hay turnos registrados para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="turnos-grid">
      {turnos.map((turno) => (
        <div key={turno._id || turno.createdAt} className="turno-card">
          {/* Header de la Card: Fecha/Hora y Estado */}
          <div className="card-header">
            <div className="tiempo">
              <span className="fecha">{formatearFechaTexto(turno.fechaPreferencia)}</span>
              <span className="hora">{turno.horaPreferencia || '--:--'} hs</span>
            </div>
          </div>

          {/* Información del Paciente */}
          <div className="seccion-paciente">
            <span className="label">Paciente</span>
            <div className="nombre-paciente">
              {turno.pacienteApellido && turno.pacienteNombre
                ? `${turno.pacienteApellido}, ${turno.pacienteNombre}`
                : turno.pacienteNombre || turno.pacienteApellido || 'No asignado'}
            </div>
            <div className="dni-badge">
              DNI: <span>{turno.pacienteDni || '-'}</span>
            </div>
          </div>

          {/* Motivo de Consulta */}
          <div className="seccion-motivo">
            <span className="label">Motivo</span>
            <div className="motivo-texto">{turno.motivo}</div>
            {turno.descripcion && turno.descripcion !== turno.motivo && (
              <div className="descripcion-texto">{turno.descripcion}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}