import '../styles/navigation.css'
import BrandMark from './BrandMark'

function Navigation({ title, subtitle, handleLogout }) {
    return (
        <header className="navigation-header">
                <BrandMark/>
            <div className="navigation-heading">
                <h1 className="navigation-title">{title}</h1>
                {subtitle && <p className="navigation-subtitle">{subtitle}</p>}
            </div>
            <div className="navigation-actions">
                <button className="navigation-button" type="button" onClick={() => handleLogout()}>
                    Cerrar Session
                </button>
            </div>
        </header>
    )
}

export default Navigation