const formatFechaLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getRangoFechasSemanaActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
  const horaActual = hoy.getHours();

  let fechaInicio = new Date(hoy);
  let fechaFin = new Date(hoy);

  const esJuevesPost19 = diaSemana === 4 && horaActual >= 19;
  const esViernesPost19 = diaSemana === 5 && horaActual >= 19;

  // Casos donde la semana laboral actual ya cerró -> Muestra la PRÓXIMA SEMANA completa
  if (diaSemana === 6) {
    // Sábado -> Próximo Lunes (+2) a Viernes (+6)
    fechaInicio.setDate(hoy.getDate() + 2);
    fechaFin.setDate(hoy.getDate() + 6);
  } else if (diaSemana === 0) {
    // Domingo -> Próximo Lunes (+1) a Viernes (+5)
    fechaInicio.setDate(hoy.getDate() + 1);
    fechaFin.setDate(hoy.getDate() + 5);
  } else if (esViernesPost19) {
    // Viernes post 19hs -> Próximo Lunes (+3) a Viernes (+7)
    fechaInicio.setDate(hoy.getDate() + 3);
    fechaFin.setDate(hoy.getDate() + 7);
  } else if (esJuevesPost19) {
    // Jueves post 19hs -> Salta directamente al Próximo Lunes (+4) a Viernes (+8)
    fechaInicio.setDate(hoy.getDate() + 4);
    fechaFin.setDate(hoy.getDate() + 8);
  } else if (diaSemana === 5) {
    // Viernes ANTES de las 19hs -> Solo permite pedir para el mismo Viernes de hoy
    fechaInicio = hoy;
    fechaFin = hoy;
  } else {
    // Lunes, Martes o Miércoles / Jueves antes de las 19hs
    fechaInicio.setDate(hoy.getDate() + 1);
    const diasHastaViernes = 5 - diaSemana;
    fechaFin.setDate(hoy.getDate() + diasHastaViernes);
  }

  return {
    min: formatFechaLocal(fechaInicio),
    max: formatFechaLocal(fechaFin),
  };
};

export const generarHorarios = (fechaSeleccionada) => {
  if (!fechaSeleccionada) return [];

  const horarios = [];
  let hora = 9;
  let minutos = 0;

  const hoy = new Date();
  const esHoy = fechaSeleccionada === formatFechaLocal(hoy);
  const horaActual = hoy.getHours();
  const minutosActuales = hoy.getMinutes();

  while (hora < 19 || (hora === 19 && minutos === 0)) {
    const yaPaso = esHoy && (hora < horaActual || (hora === horaActual && minutos <= minutosActuales));

    if (!yaPaso) {
      const hStr = hora.toString().padStart(2, "0");
      const mStr = minutos.toString().padStart(2, "0");
      horarios.push(`${hStr}:${mStr}`);
    }

    minutos += 30;
    if (minutos === 60) {
      minutos = 0;
      hora += 1;
    }
  }

  return horarios;
};