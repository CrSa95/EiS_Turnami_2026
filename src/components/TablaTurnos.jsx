import React from 'react';
import { formatearFechaTexto } from '../helpers/dateUtils';

export default function TurnoTable({ turnos = [] }) {
  const obtenerClaseBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'turno-badge badge-pendiente';
      case 'CONFIRMADO':
      case 'ATENDIDO':
        return 'turno-badge badge-confirmado';
      case 'CANCELADO':
        return 'turno-badge badge-cancelado';
      default:
        return 'turno-badge badge-default';
    }
  };

  if (!turnos || turnos.length === 0) {
    return (
      <div className="turnos-vacio">
        <p>No hay turnos registrados para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="tabla-turnos-wrapper">
      <table className="tabla-turnos">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Paciente</th>
            <th>Motivo</th>
            <th>Fecha y Hora</th>
            <th className="th-estado">Estado</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => (
            <tr key={turno._id || turno.createdAt}>
              <td data-label="DNI" className="td-dni">
                {turno.pacienteDni || '-'}
              </td>

              <td data-label="Paciente" className="td-paciente">
                {turno.pacienteApellido && turno.pacienteNombre
                  ? `${turno.pacienteApellido}, ${turno.pacienteNombre}`
                  : turno.pacienteNombre || turno.pacienteApellido || 'No asignado'}
              </td>


              <td data-label="Motivo" className="td-motivo">
                <span className="motivo-principal">{turno.motivo}</span>
                {turno.descripcion && turno.descripcion !== turno.motivo && (
                  <span className="descripcion-secundaria">{turno.descripcion}</span>
                )}
              </td>

              <td data-label="Estado" className="td-estado">
                <span className={obtenerClaseBadge(turno.estado)}>
                  {turno.estado || 'SIN ESTADO'}
                </span>
              </td>
              <td data-label="Fecha y Hora" className="td-fecha">
                <span className="fecha-principal">
                  {formatearFechaTexto(turno.fechaPreferencia)}
                </span>
                <span className="hora-secundaria">
                  {turno.horaPreferencia ? ` - ${turno.horaPreferencia} hs` : ''}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}