import { useEffect } from "react";
import { States } from "../pages/HomePage";
import Modal from "./modal";

function ModalState({ state, setState }) {

    console.log('ModalState', state)

    useEffect(() => {
        if (state !== States.Ok && state !== States.Error) return

        const timeoutId = setTimeout(() => setState('NONE'), 3000)
        return () => clearTimeout(timeoutId)
    }, [state, setState])

    return <>
        {state === States.Ok && <Modal status="Ok" message="Guardado correctamente" />}
        {state === States.Error && <Modal status="Fallo" message="No se pudo completar la operación" onClose={() => setState('NONE')} />}
        {state === States.Loading && <Modal status="Cargando" />}
    </>
}
export default ModalState