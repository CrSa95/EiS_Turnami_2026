import '../styles/badge.css'

const badgeLabels = {
    disponible: 'Disponible',
    cancelado: 'Cancelado',
    pendiente: 'Pendiente',
}

function Badge({ status }) {
    const normalizedStatus = badgeLabels[status] ? status : 'pendiente'

    return (
        <span className={`badge badge-${normalizedStatus}`}>
            {badgeLabels[normalizedStatus]}
        </span>
    )
}

export default Badge
