import { useEffect, useState } from 'react'
import GlassButton from '../components/GlassButton'
import foto from '../assets/images/foto.jpeg'
import pato from '../assets/images/pato.png'
import pose1 from '../assets/images/patoChicoPoseHablando1.png'
import pose2 from '../assets/images/patoChicoPoseHablando2.png'
import './Home.css'

export interface HomeProps {
  onStartQuiz?: () => void
  onOpenLetter?: () => void
  onOpenGifts?: () => void
  quizCompleted?: boolean
  /** Muestra el saludo del patito de "cuestionario completado" (solo una vez) */
  showCompletionGreeting?: boolean
  onCompletionGreetingShown?: () => void
}

const COMPLETED_MESSAGE =
  'Muy bien mi vida, como veo has completado el cuestionario, ahora, puedes acceder a cualquier apartado del menu.'

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function Home({
  onStartQuiz,
  onOpenLetter,
  onOpenGifts,
  quizCompleted = false,
  showCompletionGreeting = false,
  onCompletionGreetingShown,
}: HomeProps) {
  // El overlay solo se muestra al entrar por primera vez o justo después
  // de completar el cuestionario. Al volver desde otra sección, no.
  const [showDuckOverlay, setShowDuckOverlay] = useState(
    !quizCompleted || showCompletionGreeting
  )
  const [showDuckCorner, setShowDuckCorner] = useState(false)
  const [duckMessage, setDuckMessage] = useState(
    quizCompleted
      ? COMPLETED_MESSAGE
      : 'Como ves, te he preparado algo. No te preocupes es muy sencillo.'
  )
  const [duckClickCount, setDuckClickCount] = useState(0)

  const closeOverlay = () => {
    setShowDuckOverlay(false)

    if (quizCompleted) {
      onCompletionGreetingShown?.()
      return
    }

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

  /* Imagen del patito: la primera frase usa el pato normal y, en el resto,
     se alternan las poses de habla (linea 1 -> pose 1, linea 2 -> pose 2,
     linea 3 -> pose 1, linea 4 -> pose 2...). */
  const currentLine = Math.max(0, duckClickCount - 1)
  const duckCornerImage =
    duckClickCount === 0 ? pato : currentLine % 2 === 0 ? pose1 : pose2
  const duckCornerAlt = duckClickCount === 0 ? 'Patito rosa' : `Patito, pose ${currentLine % 2 ? 2 : 1}`

  const overlayMessage = quizCompleted
    ? COMPLETED_MESSAGE
    : 'Hola, soy tu patito. Como ves, alguien (tu), me ha vestido de rosa. Por cierto, feliz cumpleaños mi amor.'

  useEffect(() => {
    // No auto-close, only on click
  }, [])

  return (
    <main
      className={
        'home' + (!showDuckOverlay && !showDuckCorner ? ' home--no-duck' : '')
      }
    >
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
          <img
            src={duckCornerImage}
            alt={duckCornerAlt}
            className="duck-corner__image"
          />
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
          <GlassButton
            size="lg"
            disabled={!quizCompleted}
            icon={!quizCompleted ? <LockIcon /> : undefined}
            title={
              !quizCompleted
                ? 'Completa el cuestionario para desbloquear'
                : undefined
            }
            onClick={onOpenLetter}
          >
            Carta
          </GlassButton>
          <GlassButton
            size="lg"
            disabled={!quizCompleted}
            icon={!quizCompleted ? <LockIcon /> : undefined}
            title={
              !quizCompleted
                ? 'Completa el cuestionario para desbloquear'
                : undefined
            }
            onClick={onOpenGifts}
          >
            Regalos
          </GlassButton>
        </div>

        {!quizCompleted && (
          <p className="home__lock-hint">
            Completa el cuestionario para desbloquear Carta y Regalos
          </p>
        )}
      </div>
    </main>
  )
}
