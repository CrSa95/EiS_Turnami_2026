import BrandMark from './BrandMark'

function WelcomePanel() {
  return (
    <section className="intro-panel">
      <header className="brand"><BrandMark /></header>
      <div className="intro-content">
        <p className="eyebrow">CUIDADO DE TU SALUD</p>
        <h1>Tu salud,<br />en un solo lugar.</h1>
        <p className="intro-copy">Gestioná tus turnos, recetas y órdenes médicas con la tranquilidad de tener todo organizado.</p>
      </div>
      <div className="decorative-calendar" aria-hidden="true"><div className="calendar-top"><span>Próximo turno</span><i /></div><strong>12</strong><div><span>Jueves</span><b>10:30</b></div></div>
    </section>
  )
}

export default WelcomePanel