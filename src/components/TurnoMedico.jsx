import React, { useEffect, useState, useCallback } from 'react';
import { obtenerTurnosAsignadosAlMedico, cancelarTurnoConPaciente } from "../data/auth";
import TurnoTable from './TablaTurnos';

export default function TurnoMedico({ token, dni, onCancel }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarTurnos = useCallback(async () => {
    try {
      const data = await obtenerTurnosAsignadosAlMedico(token);
      if (data) {
        setTurnos(data);
      }
    } catch (error) {
      console.error("Error al pedir turnos:", error);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  const handleCancelarTurno = async (turnoOId) => {
    const id = typeof turnoOId === 'object' ? turnoOId._id : turnoOId;

    await cancelarTurnoConPaciente(token, id);

    await cargarTurnos();

    if (onCancel) onCancel();
  };

  if (cargando) {
    return <p>Cargando turnos...</p>;
  }

  return (
    <div>
      <h2>Turnos del médico</h2>
      <TurnoTable turnos={turnos} onCancelarTurno={handleCancelarTurno} />
    </div>
  );
}