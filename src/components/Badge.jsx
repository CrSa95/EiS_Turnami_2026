import '../styles/badge.css'

const badgeLabels = {
    Pendiente: 'Pendiente',
    Transcripta: 'Transcripta',
    Rechazada: 'Rechazada',
}

function Badge({ status }) {
    // Si el estado no viene o no coincide, mostramos 'Pendiente' por defecto
    const normalizedStatus = badgeLabels[status] ? status : 'Pendiente'

    return (
        // Usamos .toLowerCase() para las clases CSS (ej: badge-pendiente)
        <span className={`badge badge-${normalizedStatus.toLowerCase()}`}>
            {badgeLabels[normalizedStatus]}
        </span>
    )
}

export default Badge