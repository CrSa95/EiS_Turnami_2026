import React, { useEffect, useState } from 'react';
import {obtenerTurnosAsignadosAlMedico, cancelarTurnoConPaciente} from "../data/auth"
import TurnoTable from './TablaTurnos';
export default function TurnoMedico({token, dni, onCancel}) {
const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const handleCancelarTurno = async (turnoID)=>{
      const response = await cancelarTurnoConPaciente(token, turnoID)
      
      if(onCancel) onCancel();
  }
  useEffect(() => {
    let montado = true;

    const traerDatos = async () => {
      try {
        const data = await obtenerTurnosAsignadosAlMedico(token);
        if (montado && data) {
          setTurnos(data);
        }
      } catch (error) {
        console.error("Error al pedir turnos:", error);
      } finally {
        if (montado) setCargando(false);
      }
    };

    traerDatos();
    
    return () => {
      montado = false;
    };
  }, [token]);

  if (cargando) {
    return <p>Cargando turnos...</p>;
  }
  return (
    <div>
      <h2>Turnos del médico</h2>
      <TurnoTable turnos={turnos} onCancelarTurno={handleCancelarTurno}/>
    </div>
  );
}       