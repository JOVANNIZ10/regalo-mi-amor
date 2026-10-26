import { useEffect, useState } from 'react'
import GlassButton from '../components/GlassButton'
import foto from '../assets/images/foto.jpeg'
import pato from '../assets/images/pato.png'
import './Home.css'

export interface HomeProps {
  onStartQuiz?: () => void
  quizCompleted?: boolean
}

const COMPLETED_MESSAGE =
  'Muy bien mi vida, como veo has completado el cuestionario, ahora, puedes acceder a cualquier apartado del menu.'

export default function Home({ onStartQuiz, quizCompleted = false }: HomeProps) {
  const [showDuckOverlay, setShowDuckOverlay] = useState(true)
  const [showDuckCorner, setShowDuckCorner] = useState(false)
  const [duckMessage, setDuckMessage] = useState(
    quizCompleted
      ? COMPLETED_MESSAGE
      : 'Como ves, te he preparado algo. No te preocupes es muy sencillo.'
  )
  const [duckClickCount, setDuckClickCount] = useState(0)

  const closeOverlay = () => {
    setShowDuckOverlay(false)
    if (quizCompleted) return
    setTimeout(() => setShowDuckCorner(true), 300)
  }

  const handleDuckClick = () => {
    if (quizCompleted) return

    const messages = [
      'Para poder acceder a los siguientes menus, tienes que completar un cuestionario.',
      'El cuestionario consta de 6 preguntas sobre mi, tienes que adivinar TODAS.',
      '¿Estas lista mi amor? Cuando lo estes, pulsa el boton de cuestionario.',
    ]
    if (duckClickCount < messages.length) {
      setDuckMessage(messages[duckClickCount])
      setDuckClickCount(duckClickCount + 1)
    }
  }

  const overlayMessage = quizCompleted
    ? COMPLETED_MESSAGE
    : 'Hola, soy tu patito. Como ves, alguien (tu), me ha vestido de rosa. Por cierto, feliz cumpleaños mi amor.'

  useEffect(() => {
    // No auto-close, only on click
  }, [])

  return (
    <main className="home">
      {showDuckOverlay && (
        <div className="duck-overlay" onClick={closeOverlay}>
          <div className="duck-dialog" onClick={closeOverlay}>
            <div className="speech-bubble">
              <p className="speech-bubble__text">{overlayMessage}</p>
              <p className="speech-bubble__name">Ivan, el novio mas guapo e inteligente del universo</p>
            </div>
            <img src={pato} alt="Patito rosa" className="duck-image" />
          </div>
        </div>
      )}

      {showDuckCorner && (
        <div className="duck-corner" onClick={handleDuckClick}>
          <img src={pato} alt="Patito rosa" className="duck-corner__image" />
          <div className="speech-bubble speech-bubble--corner">
            <p className="speech-bubble__text">{duckMessage}</p>
          </div>
        </div>
      )}

      <div className="home__content">
        <img src={foto} alt="Foto" className="home__photo" />
        <div className="home__buttons">
          <GlassButton size="lg" onClick={onStartQuiz}>
            Cuestionario
          </GlassButton>
          <GlassButton size="lg">Video</GlassButton>
          <GlassButton size="lg">Regalos</GlassButton>
        </div>
      </div>
    </main>
  )
}
