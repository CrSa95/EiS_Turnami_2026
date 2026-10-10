import { useEffect } from "react";
import { States } from "../pages/HomePage";
import Modal from "./Modal";

function ModalState({ state, setState }) {
  console.log("ModalState", state);

  const currentType = typeof state === "object" ? state?.type : state;
  const customMessage = typeof state === "object" ? state?.message : null;
  const customTitle = typeof state === "object" ? state?.title : null;
  const persistent = typeof state === "object" && state?.persistent;
  const customOnRetry = typeof state === "object" ? state?.onRetry : null;

  useEffect(() => {
    if (persistent || (currentType !== States.Ok && currentType !== States.Error)) return;

    const timeoutId = setTimeout(() => setState("NONE"), 10000);
    return () => clearTimeout(timeoutId);
  }, [currentType, persistent, setState]);

  return (
    <>
      {currentType === States.Ok && (
        <Modal
          status="Ok"
          title={customTitle || "Operación completada"}
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
          title={customTitle || "Ocurrió un error"}
          message={
            customMessage ||
            "Debe cargar la imagen de la receta antes de intentar subirla."
          }
          onClose={() => setState("NONE")}
          onRetry={customOnRetry ? () => {
            setState("NONE");
            customOnRetry();
          } : undefined}
        />
      )}
      {currentType === States.Loading && <Modal status="Cargando" />}
    </>
  );
}

export default ModalState