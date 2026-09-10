import '../styles/recetas.css'
import Badge from './Badge';
import CargarReceta from './CargarReceta'

function Recetas({ rol, recetas }) {
    const title = rol == 'paciente' ? 'Recetas solicitadas' : 'Recetas pendientes'

    return (
        <div className="recetas-layout">
            {rol === 'paciente' && <div className="recetas">
                <CargarReceta />
            </div>}
            <div className="recetas">
                <h2 className="recetas-title">{title}</h2>
                <div className="recetas-list">
                    {recetas.map((e, index) => (
                        <article className="receta-card" key={`${e.paciente.nombre}-${index}`}>
                            <span className="receta-icon" aria-hidden="true">💊</span>
                            <div className="receta-content">
                                <div className="receta-heading">
                                     
                                    <p className="receta-name">{e.receta.nombre}</p>
                                </div>
                               {
                                rol !== 'paciente' ?  <p className="receta-details">
                                    {e.paciente.nombre} {e.paciente.apellido} · {e.receta.fecha}
                                </p> : 
                                 <p className="receta-details">
                                   {e.receta.fecha}
                                </p>
                               }
                               <Badge/>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Recetas;