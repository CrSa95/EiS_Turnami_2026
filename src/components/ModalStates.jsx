import { useEffect } from "react";
import { States } from "../pages/HomePage";
import Modal from "./Modal";

function ModalState({ state, setState }) {

    console.log('ModalState', state)

  useEffect(() => {
    if (state !== States.Ok && state !== States.Error) return;

    const timeoutId = setTimeout(() => setState("NONE"), 1000);
    return () => clearTimeout(timeoutId);
  }, [state, setState]);

  return (
    <>
      {state === States.Ok && (
        <Modal
          status="Ok"
          message="Su receta fue cargada exitosamente, en breve su medico notificara que la misma fue subida al sistema de PAMI"
        />
      )}
      {state === States.Error && (
        <Modal
          status="Fallo"
          message="Debe cargar la imagen de la receta antes de intentar subirla."
          onClose={() => setState("NONE")}
        />
      )}
      {state === States.Loading && <Modal status="Cargando" />}
    </>
  );
}
export default ModalState;
