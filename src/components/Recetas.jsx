import '../styles/recetas.css'
import CargarReceta from './CargarReceta'

function Recetas({ rol, recetas }) {
    const title = rol == 'paciente' ? 'Mis Recetas' : 'Recetas pendientes'

    return (
        <div className="recetas">
            {rol === 'paciente' && <CargarReceta />}
           
            <h2 className="recetas-title">{title}</h2>
            <div className="recetas-list">
                {recetas.map((e, index) => (
                    <article className="receta-card" key={`${e.paciente.nombre}-${index}`}>
                        <span className="receta-icon" aria-hidden="true">💊</span>
                        <div className="receta-content">
                            <div className="receta-heading">
                                <span className="receta-type">Receta</span>
                                <p className="receta-name">{e.receta.nombre}</p>
                            </div>
                            <p className="receta-details">
                                {e.paciente.nombre} {e.paciente.apellido} · {e.receta.descripcion}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
              
        </div>
    )
}

export default Recetas;