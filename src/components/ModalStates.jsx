import { useEffect } from "react";
import { States } from "../pages/HomePage";
import Modal from "./Modal";

function ModalState({ state, setState }) {
  console.log("ModalState", state);

  // Extraer tipo y mensaje dinámico si state es un objeto
  const currentType = typeof state === "object" ? state?.type : state;
  const customMessage = typeof state === "object" ? state?.message : null;

  useEffect(() => {
    if (currentType !== States.Ok && currentType !== States.Error) return;

    const timeoutId = setTimeout(() => setState("NONE"), 10000); // acá es para settear los segs
    return () => clearTimeout(timeoutId);
  }, [currentType, setState]);

  return (
    <>
      {currentType === States.Ok && (
        <Modal
          status="Ok"
          message={
            customMessage ||
            "Su receta fue cargada exitosamente, en breve su medico notificara que la misma fue subida al sistema de PAMI"
          }
          onClose={() => setState("NONE")}
        />
      )}
      {currentType === States.Error && (
        <Modal
          status="Fallo"
          message={
            customMessage ||
            "Debe cargar la imagen de la receta antes de intentar subirla."
          }
          onClose={() => setState("NONE")}
        />
      )}
      {currentType === States.Loading && <Modal status="Cargando" />}
    </>
  );
}

export default ModalState;