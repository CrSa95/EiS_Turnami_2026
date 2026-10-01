export const getRangoFechasSemanaActual = () => {
  const hoy = new Date();
  
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  const diaSemana = hoy.getDay(); // 0: Dom, 1: Lun, ..., 5: Vie, 6: Sáb
  const diasHastaViernes = 5 - diaSemana;
  
  const viernes = new Date(hoy);
  viernes.setDate(hoy.getDate() + (diasHastaViernes >= 0 ? diasHastaViernes : 0));

  const min = manana.toISOString().split("T")[0];
  const max = viernes.toISOString().split("T")[0];

  return { min, max };
};

export const generarHorarios = () => {
  const horarios = [];
  let hora = 9;
  let minutos = 0;

  while (hora < 19 || (hora === 19 && minutos === 0)) {
    const hStr = hora.toString().padStart(2, "0");
    const mStr = minutos.toString().padStart(2, "0");
    horarios.push(`${hStr}:${mStr}`);

    minutos += 30;
    if (minutos === 60) {
      minutos = 0;
      hora += 1;
    }
  }
  return horarios;
};