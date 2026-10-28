import { useEffect, useRef, useState } from 'react'
import GlassButton from '../components/GlassButton'
import foto from '../assets/images/foto.jpg'
import pato from '../assets/images/pato.webp'
import inicioAudio from '../assets/audios/inicioAudio1.mp3'
import inicioAudio2 from '../assets/audios/inicioAudio2.mp3'
import inicioAudio3 from '../assets/audios/inicioAudio3.mp3'
import inicioAudio4 from '../assets/audios/inicioAudio4.mp3'
import inicioAudio5 from '../assets/audios/inicioAudio5.mp3'
import inicioAudio6 from '../assets/audios/inicioAudio6.mp3'
import { createDialogAudio } from '../utils/audio'
import { useDialogueAudio } from '../utils/useDialogueAudio'
import pose1 from '../assets/images/patoChicoPoseHablando1.webp'
import pose2 from '../assets/images/patoChicoPoseHablando2.webp'
import pose3 from '../assets/images/patoChicoPoseDedos1.webp'
import pose4 from '../assets/images/patoChicoPosecelebrando1.webp'
import pose5 from '../assets/images/patoChicoPoseOkey1.webp'
import pose6 from '../assets/images/patoChicoPoseTumbado1.webp'




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

/* ------------------------------------------------------------------
   Dialogos del patito. Cada entrada contiene el mensaje y la pose
   (imagen) que se muestra mientras dice esa linea.
------------------------------------------------------------------ */
interface DuckDialogue {
  message: string
  pose: string
  /** audio que suena con la linea; mientras dure, el dialogo se bloquea */
  audio?: string
}

/* Dialogo grande del patito al entrar (con la firma) */
const INTRO_DIALOGUE: DuckDialogue = {
  message:
    'Hola, soy tu patito. Como ves, alguien (tu), me ha vestido de rosa. Por cierto, feliz cumpleaños mi amor.',
  pose: pose4,
}

/* Secuencia de frases del patito pequeño del menú.
   La pose se alterna entre las lineas (pato -> pose 1 -> pose 2 -> pose 1...) */
const CORNER_DIALOGUES: DuckDialogue[] = [
  {
    message: 'Como ves, te he preparado algo. No te preocupes es muy sencillo.',
    pose: pose2,
    audio: inicioAudio2,
  },
  {
    message:
      'Para poder acceder a los siguientes menus, tienes que completar un cuestionario.',
    pose: pose1,
    audio: inicioAudio3,
  },
  {
    message:
      'El cuestionario consta de 6 preguntas sobre mi, tienes que adivinar TODAS.',
    pose: pose3,
    audio: inicioAudio4,
  },
  {
    message: '¿Estas lista mi amor? Cuando lo estes, pulsa el boton de cuestionario.',
    pose: pose5,
    audio: inicioAudio5,
  },
]

/* Dialogo grande de "cuestionario completado" (se muestra una sola vez) */
const COMPLETED_DIALOGUE: DuckDialogue = {
  message:
    'Muy bien mi vida, como veo has completado el cuestionario, ahora, puedes acceder a cualquier apartado del menu.',
  pose: pose6,
}

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
  const [dialogueIndex, setDialogueIndex] = useState(0)

  /* Audio del dialogo de entrada: se para al cerrar el overlay.
     El dialogo de entrada SI se bloquea hasta que su audio acaba */
  const introAudio = useDialogueAudio(inicioAudio, !quizCompleted && showDuckOverlay)
  /* Cada linea de la esquina tiene su propio audio (inicioAudio2..5):
     se reproduce automaticamente y se puede pasar libremente */
  useDialogueAudio(
    CORNER_DIALOGUES[dialogueIndex].audio ?? inicioAudio2,
    showDuckCorner
  )

  /* Al volver del cuestionario con todo bien, suena la felicitacion
     (inicioAudio6) junto al saludo de "cuestionario completado".
     Se reproduce una sola vez y se corta al cerrar el saludo. */
  const completionAudioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    if (!quizCompleted || !showCompletionGreeting) return undefined

    const audio = createDialogAudio(inicioAudio6)
    completionAudioRef.current = audio

    const stopRetry = () => {
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('touchstart', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }
    const tryPlay = () => {
      if (audio.paused && !audio.ended) {
        audio.play().then(stopRetry).catch(() => {})
      }
    }

    tryPlay()
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('touchstart', tryPlay)
    window.addEventListener('keydown', tryPlay)
    audio.addEventListener('ended', stopRetry)
    audio.addEventListener('error', stopRetry)

    /* Al cerrar el saludo se corta la felicitacion: no debe seguir
       sonando por detras al volver al menu. */
    return () => {
      stopRetry()
      audio.pause()
      try {
        audio.currentTime = 0
      } catch {
        /* si el navegador no deja rebobinar, al menos queda parado */
      }
      if (completionAudioRef.current === audio) {
        completionAudioRef.current = null
      }
    }
  }, [quizCompleted, showCompletionGreeting])

  const closeOverlay = () => {
    if (!quizCompleted && !introAudio.finished) {
      /* el audio de entrada sigue sonando: no se puede pasar aun.
         Aprovechamos el click para arrancarlo si el autoplay fallo. */
      introAudio.playIfPaused()
      return
    }

    setShowDuckOverlay(false)

    if (quizCompleted) {
      const audio = completionAudioRef.current
      if (audio) {
        audio.pause()
        try {
          audio.currentTime = 0
        } catch {
          /* el audio queda parado igualmente */
        }
        completionAudioRef.current = null
      }
      onCompletionGreetingShown?.()
      return
    }

    setTimeout(() => setShowDuckCorner(true), 300)
  }

  const handleDuckClick = () => {
    if (quizCompleted) return
    if (dialogueIndex < CORNER_DIALOGUES.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    }
  }

  const cornerDialogue = CORNER_DIALOGUES[dialogueIndex]
  const introDialogue = quizCompleted ? COMPLETED_DIALOGUE : INTRO_DIALOGUE

  /* El cuestionario solo se puede pulsar cuando el patito ha acabado
     su secuencia de dialogo (o cuando el cuestionario ya esta hecho). */
  const dialogueFinished = dialogueIndex === CORNER_DIALOGUES.length - 1
  const quizReady = quizCompleted || dialogueFinished

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
              <p className="speech-bubble__text">{introDialogue.message}</p>
              <p className="speech-bubble__name">Ivan</p>
            </div>
            <img
              src={introDialogue.pose}
              alt="Patito rosa"
              className="duck-image"
            />
          </div>
        </div>
      )}

      {showDuckCorner && (
        <div className="duck-corner" onClick={handleDuckClick}>
          <img
            src={cornerDialogue.pose}
            alt="Patito"
            className="duck-corner__image"
          />
          <div className="speech-bubble speech-bubble--corner">
            <p className="speech-bubble__name speech-bubble__name--corner">
              Ivan
            </p>
            <p className="speech-bubble__text">{cornerDialogue.message}</p>
          </div>
        </div>
      )}

      <div className="home__content">
        <img src={foto} alt="Foto" className="home__photo" />
        <div className="home__buttons">
          <GlassButton
            size="lg"
            disabled={!quizReady}
            title={!quizReady ? 'Escucha al patito hasta el final' : undefined}
            className={!quizCompleted && quizReady ? 'glass-btn--glow' : undefined}
            onClick={onStartQuiz}
          >
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
