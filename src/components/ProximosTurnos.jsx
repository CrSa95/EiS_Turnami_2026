import { useCallback, useEffect, useState } from "react";
import { obtenerProximosTurnos } from "../data/auth";
import {
  formatearFechaTexto,
  getFechaHoraTurno,
  getTurnoId,
} from "../helpers/dateUtils";
import "../styles/ProximosTurnos.css";

const ESPECIALIDAD = "Clínica médica";


const formatearHora = (hora) => {
  if (!hora || typeof hora !== "string") {
    return "Hora no disponible";
  }

  const partes = hora.trim().split(":");
  if (partes.length >= 2) {
    const hh = partes[0].padStart(2, "0");
    const mm = partes[1].padStart(2, "0");
    return `${hh}:${mm} hs`;
  }
  return hora.slice(0, 5);
};

const obtenerNombreMedico = (turno) => {
  if (turno?.medico?.nombre) {
    return turno.medico.apellido
      ? `${turno.medico.nombre} ${turno.medico.apellido}`
      : turno.medico.nombre;
  }
  return turno?.nombreMedico || turno?.medicoNombre || "Médico asignado";
};

export default function ProximosTurnos({ token }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargarTurnos = useCallback(async () => {
    setCargando(true);
    setError(false);

    try {
      const respuesta = await obtenerProximosTurnos(token);

      let lista = [];
      if (Array.isArray(respuesta)) {
        lista = respuesta;
      } else if (Array.isArray(respuesta?.turnos)) {
        lista = respuesta.turnos;
      }

      const ahora = new Date();

      const proximosTurnos = lista
        .filter((turno) => {
          if (!turno) return false;

          // Solo turnos confirmados
          const estado = String(turno.estado ?? "").trim().toLowerCase();
          if (estado !== "confirmado") return false;

          const fechaHora = getFechaHoraTurno(turno);
          return fechaHora ? fechaHora > ahora : true;
        })
        .sort((a, b) => {
          const fA = getFechaHoraTurno(a);
          const fB = getFechaHoraTurno(b);
          if (!fA || !fB) return 0;
          return fA.getTime() - fB.getTime();
        });

      setTurnos(proximosTurnos);
    } catch (err) {
      console.error("Error al cargar los próximos turnos:", err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  if (cargando) {
    return (
      <section className="proximos-turnos">
        <h1>Próximos Turnos</h1>
        <p role="status">Cargando próximos turnos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="proximos-turnos">
        <h1>Próximos Turnos</h1>
        <div className="turnos-error" role="alert">
          <p>
            No se pudieron cargar tus próximos turnos. Por favor, verificá tu
            conexión e intentá nuevamente.
          </p>
          <button type="button" onClick={cargarTurnos}>
            Recargar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="proximos-turnos">
      <h1>Próximos Turnos</h1>

      {turnos.length === 0 ? (
        <p className="turnos-vacios">No tenés próximos turnos agendados.</p>
      ) : (
        <ul className="turnos-lista">
          {turnos.map((turno) => {
            const idKey =
              getTurnoId(turno) ??
              `${turno.fecha || turno.fechaPreferencia}-${turno.hora || turno.horaPreferencia}`;
            return (
              <li className="turno-tarjeta" key={idKey}>
                <h2>{obtenerNombreMedico(turno)}</h2>
                <p>
                  <strong>Especialidad:</strong> {ESPECIALIDAD}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {formatearFechaTexto(turno.fechaPreferencia || turno.fecha)}
                </p>
                <p>
                  <strong>Hora:</strong>{" "}
                  {formatearHora(turno.horaPreferencia || turno.hora)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
