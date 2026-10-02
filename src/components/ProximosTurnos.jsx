import { useCallback, useEffect, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerEstadoTurnos } from "../data/auth";

const ESPECIALIDAD = "Clínica médica";

const formatearFecha = (fecha) => {
  if (!fecha || typeof fecha !== "string") {
    return "Fecha no disponible";
  }

  const fechaLocal = fecha.includes("T") ? fecha.split("T")[0] : fecha;
  const fechaParseada = parseISO(fechaLocal);

  if (!isValid(fechaParseada)) {
    return "Fecha no disponible";
  }

  return format(fechaParseada, "d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
};

const formatearHora = (hora) => {
  if (!hora || typeof hora !== "string") {
    return "Hora no disponible";
  }
  // Garantizar el formato HH:mm agregando padStart si viene como "9:00"
  const partes = hora.trim().split(":");
  if (partes.length >= 2) {
    const hh = partes[0].padStart(2, "0");
    const mm = partes[1].padStart(2, "0");
    return `${hh}:${mm} hs`;
  }
  return hora.slice(0, 5);
};

const obtenerFechaHora = (turno) => {
  const fecha = turno?.fechaPreferencia || turno?.fecha;
  const hora = turno?.horaPreferencia || turno?.hora;

  if (!fecha || !hora) {
    return null;
  }

  const fechaLimpia = fecha.includes("T") ? fecha.split("T")[0] : fecha;
  const horaLimpia = hora.length === 5 ? hora : hora.padStart(5, "0");
  const fechaHora = parseISO(`${fechaLimpia}T${horaLimpia}`);

  return isValid(fechaHora) ? fechaHora : null;
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
      const respuesta = await obtenerEstadoTurnos(token);

      // Normalizar la respuesta de la API (sea array directo u objeto con propiedad turnos/turno)
      let lista = [];
      if (Array.isArray(respuesta)) {
        lista = respuesta;
      } else if (respuesta?.turnos && Array.isArray(respuesta.turnos)) {
        lista = respuesta.turnos;
      } else if (respuesta?.turno || respuesta?.id || respuesta?._id) {
        lista = [respuesta.turno || respuesta];
      }

      const ahora = new Date();

      const proximosTurnos = lista
        .filter((turno) => {
          if (!turno) return false;
          const fechaHora = obtenerFechaHora(turno);
          const estadoValido =
              !turno.estado ||
              turno.estado.toUpperCase() === "CONFIRMADO"


          return estadoValido && fechaHora && fechaHora > ahora;
        })
        .sort((a, b) => {
          const fA = obtenerFechaHora(a);
          const fB = obtenerFechaHora(b);
          return (fA ? fA.getTime() : 0) - (fB ? fB.getTime() : 0);
        });

      setTurnos(proximosTurnos);
    } catch (err) {
      console.error("Error al cargar los próximos turnos:", err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [token]); // Se añade token a las dependencias

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
            const idKey = turno.id || turno._id || `${turno.fecha}-${turno.hora}`;
            return (
              <li className="turno-tarjeta" key={idKey}>
                <h2>{obtenerNombreMedico(turno)}</h2>
                <p>
                  <strong>Especialidad:</strong> {ESPECIALIDAD}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {formatearFecha(
                    turno.fechaPreferencia || turno.fecha
                  )}
                </p>
                <p>
                  <strong>Hora:</strong>{" "}
                  {formatearHora(
                    turno.horaPreferencia || turno.hora
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}