function Recetas({ rol, recetas }) {

    const rowReceta = (e) => {
        return <div> <div>
            {e.receta.nombre}</div>  <div>
                {e.paciente.nombre}</div> <div>
                {e.receta.descripcion}</div> </div>

    }

    const headersRecetas = () => {
        return <div>
            <div>
            Nombre Paciente
        </div>
        <div>
            Medicamento
        </div>
        </div>
    }

    return <div>
        {rol == "paciente" &&  <CargarReceta />}
        <h1>Recetas</h1>

        {
            headersRecetas()
        }
        {
            recetas.map(e => {
                return rowReceta(e)
            })
        }
    </div>

}

export default Recetas;