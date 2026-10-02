
import {
  addDays,
  format,
  getDay,
  getHours,
  getMinutes,
  isToday,
  isValid,
  differenceInMilliseconds,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
/**
 * Formatea una fecha como YYYY-MM-DD en horario local.
 */
const formatFechaLocal = (date) => format(date, "yyyy-MM-dd");

/**
 * Convierte YYYY-MM-DD o un ISO con fecha y hora
 * en una fecha local basada en el componente de fecha.
 */
export const parseFecha = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== "string") {
    return null;
  }

  const soloFecha = fechaStr.includes("T")
    ? fechaStr.split("T")[0]
    : fechaStr;

  const fecha = parseISO(soloFecha);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

/**
 * Calcula el rango permitido para reservar un turno.
 *
 * Reglas:
 * - Lunes a jueves antes de las 19:00:
 *   desde mañana hasta el viernes de esa semana.
 * - Jueves desde las 19:00:
 *   desde el lunes siguiente hasta el viernes siguiente.
 * - Viernes antes de las 19:00:
 *   solo el viernes actual.
 * - Viernes desde las 19:00:
 *   desde el lunes siguiente hasta el viernes siguiente.
 * - Sábado y domingo:
 *   desde el lunes siguiente hasta el viernes siguiente.
 */
export const getRangoFechasSemanaActual = () => {
  const hoy = new Date();
  const diaSemana = getDay(hoy);
  const horaActual = getHours(hoy);

  let fechaInicio;
  let fechaFin;

  const esJuevesPost19 = diaSemana === 4 && horaActual >= 19;
  const esViernesPost19 = diaSemana === 5 && horaActual >= 19;

  if (diaSemana === 6) {
    fechaInicio = addDays(hoy, 2);
    fechaFin = addDays(hoy, 6);
  } else if (diaSemana === 0) {
    fechaInicio = addDays(hoy, 1);
    fechaFin = addDays(hoy, 5);
  } else if (esViernesPost19) {
    fechaInicio = addDays(hoy, 3);
    fechaFin = addDays(hoy, 7);
  } else if (esJuevesPost19) {
    fechaInicio = addDays(hoy, 4);
    fechaFin = addDays(hoy, 8);
  } else if (diaSemana === 5) {
    fechaInicio = addDays(hoy, 3);
    fechaFin = addDays(hoy, 7);
  } else {
    fechaInicio = addDays(hoy, 1);
    fechaFin = addDays(hoy, 5 - diaSemana);
  }

  return {
    min: formatFechaLocal(fechaInicio),
    max: formatFechaLocal(fechaFin),
  };
};

/**
 * Genera horarios desde las 09:00 hasta las 19:00,
 * en intervalos de 30 minutos.
 *
 * Si la fecha seleccionada es hoy, excluye los horarios
 * que ya pasaron.
 */
export const generarHorarios = (fechaSeleccionada) => {
  const fecha = parseFecha(fechaSeleccionada);

  if (!fecha) {
    return [];
  }

  const ahora = new Date();
  const esFechaHoy = isToday(fecha);

  const horaActual = getHours(ahora);
  const minutosActuales = getMinutes(ahora);

  const horarios = [];

  for (let minutosDelDia = 9 * 60; minutosDelDia <= 19 * 60; minutosDelDia += 30) {
    const hora = Math.floor(minutosDelDia / 60);
    const minutos = minutosDelDia % 60;

    const yaPaso =
      esFechaHoy &&
      (hora < horaActual ||
        (hora === horaActual && minutos <= minutosActuales));

    if (yaPaso) {
      continue;
    }

    const horaTexto = String(hora).padStart(2, "0");
    const minutosTexto = String(minutos).padStart(2, "0");

    horarios.push(`${horaTexto}:${minutosTexto}`);
  }

  return horarios;
};

export const formatearFechaTexto = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== "string") {
    return "";
  }

  const soloFecha = fechaStr.includes("T")
    ? fechaStr.split("T")[0]
    : fechaStr;

  const fecha = parseISO(soloFecha);

  if (!isValid(fecha)) {
    return fechaStr;
  }

  return format(fecha, "d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
};

/**
 * Comprueba si un turno puede cancelarse por el plazo de 24 horas.
 *
 * Si la API proporciona turno.cancelable como booleano,
 * ese valor tiene prioridad.
 */
export const esCancelable24hs = (turno) => {
  if (typeof turno?.cancelable === "boolean") {
    return turno.cancelable;
  }

  const fechaRaw = turno?.fechaPreferencia || turno?.fecha;
  const hora = turno?.horaPreferencia || turno?.hora;

  if (!fechaRaw || !hora) {
    return false;
  }

  const fechaLimpia = fechaRaw.includes("T")
    ? fechaRaw.split("T")[0]
    : fechaRaw;

  const fechaHoraTurno = parseISO(
    `${fechaLimpia}T${hora}:00`
  );

  if (!isValid(fechaHoraTurno)) {
    return false;
  }

  const diferencia = differenceInMilliseconds(
    fechaHoraTurno,
    new Date()
  );

  return diferencia >= 24 * 60 * 60 * 1000;
};