import { useState } from 'react'
import GlassButton from '../components/GlassButton'
import pato from '../assets/images/pato.png'
import './Letter.css'

export default function Letter({ onBack }) {
  const [showDuck, setShowDuck] = useState(true)
  const [opened, setOpened] = useState(false)

  return (
    <main className="letter">
      {showDuck && (
        <div className="letter-overlay" onClick={() => setShowDuck(false)}>
          <div className="letter-overlay__dialog">
            <div className="letter-overlay__bubble">
              <p className="letter-overlay__text">
                Mi vida, te he preparado una carta, espero que te guste. Mereces
                esto y un infinito.
              </p>
              <p className="letter-overlay__name">
                Ivan, el novio mas guapo e inteligente del universo
              </p>
            </div>
            <img src={pato} alt="Patito rosa" className="letter-overlay__duck" />
          </div>
        </div>
      )}

      <div className="letter__stage">
        {!opened ? (
          <button
            type="button"
            className="envelope"
            onClick={() => setOpened(true)}
            aria-label="Abrir la carta"
          >
            <span className="envelope__flap" aria-hidden="true" />
            <span className="envelope__body" aria-hidden="true">
              <span className="envelope__seal">♥</span>
            </span>
            <span className="envelope__hint">Haz click para abrir</span>
          </button>
        ) : (
          <article className="letter-card">
            <p className="letter-card__greeting">Hola iubire:</p>
            <p>
              Gracias por formar parte de mi vida. Tu bella sonrisa me alegra todos los dias, no sabes lo bendecida que estas en tener esos dientes perfectos. Nunca pensé que mi vida daría un giro tan radical y se encontraria contigo, eres la mejor decisión y cosa que me ha pasado. Quiero pasar el resto de mi vida contigo y verte sonreir cada segundo. Espero ser suficiente y lo mejor para ti. Te amo preciosa mia.
            </p>
            <p>
              Mereces esto y un infinito. Y yo quiero dártelo, poquito a poco,
              todos los días de mi vida.
            </p>
            <p className="letter-card__signature">
              Te quiero,
              <br />
              Iván
            </p>
            <span className="letter-card__heart" aria-hidden="true">
              ♥
            </span>
          </article>
        )}
      </div>

      <footer className="letter__footer">
        <GlassButton variant="ghost" size="sm" onClick={onBack}>
          Volver al menú
        </GlassButton>

        {opened && (
          <button
            type="button"
            className="letter__close"
            onClick={() => setOpened(false)}
          >
            Cerrar carta
          </button>
        )}
      </footer>
    </main>
  )
}
