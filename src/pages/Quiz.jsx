import { useEffect, useState } from 'react'
import GlassButton from '../components/GlassButton'
import beso from '../assets/images/patoChicoPoseBeso1.webp'
import triste from '../assets/images/patoChicoPoseTriste1.webp'
import victoriaAudio from '../assets/audios/audioFormularioVictoria.mp3'
import derrotaAudio from '../assets/audios/audioFormularioDerrota.mp3'
import { createDialogAudio } from '../utils/audio'
import {
  startQuizTicking,
  stopQuizTicking,
  playClickSfx,
  stopDialogAudios,
} from '../utils/audio'
import './Quiz.css'

/* ------------------------------------------------------------------
   Preguntas.
   `correct` es el TEXTO exacto de la opción correcta (así no hay
   errores de índices). Cambia `question`, `options` y `correct`
   para poner las tuyas.
------------------------------------------------------------------ */
const QUESTIONS = [
  {
    question: '¿Cuál de estas comidas no me gusta?',
    options: ['Calamares', 'Alubias', 'Lentejas', 'Puré de verduras'],
    correct: 'Puré de verduras',
  },
  {
    question:
      '¿De qué color era la camisa la primera vez que me fijé en ti en la iglesia?',
    options: ['Blanca', 'Azul oscuro', 'Negra', 'Azul claro'],
    correct: 'Azul claro',
  },
  {
    question: '¿Cuál es mi marca favorita de coches?',
    options: ['BMW', 'Audi', 'Mercedes', 'Volkswagen'],
    correct: 'Audi',
  },
  {
    question: '¿Cuál es mi color favorito?',
    options: ['Azul', 'Rojo', 'Verde', 'Blanco'],
    correct: 'Azul',
  },
  {
    question: '¿Qué modalidad estoy estudiando en la universidad?',
    options: ['Computación', 'Software', 'Hardware', 'Analítica de datos'],
    correct: 'Software',
  },
  {
    question: '¿En qué país me encantaría vivir?',
    options: ['Estados Unidos', 'Noruega', 'Suiza', 'Todas son correctas'],
    correct: 'Suiza',
  },
]

export default function Quiz({ onBack, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)

  /* Tic-tac de contrarreloj mientras se responde el cuestionario.
     Al salir, se para el tic-tac y cualquier voz en curso (victoria/
     derrota) para que no se solape con el audio del menu. */
  useEffect(() => {
    stopDialogAudios() /* corta voces que vengan de otra seccion */
    startQuizTicking()
    return () => {
      stopQuizTicking()
      stopDialogAudios()
    }
  }, [])

  /* Al terminar (pantalla de resultado) se para el tic-tac.
     Si pulsa "Repetir", vuelve a sonar. */
  useEffect(() => {
    if (finished) stopQuizTicking()
    else startQuizTicking()
  }, [finished])

  const question = QUESTIONS[current]
  const total = QUESTIONS.length
  const progress = ((current + (selected !== null ? 1 : 0)) / total) * 100

  const choose = (index) => {
    setSelected(index)
  }

  const next = () => {
    if (selected === null) return

    const updated = [...answers]
    updated[current] = selected

    if (current === total - 1) {
      setAnswers(updated)
      setFinished(true)

      /* Victoria o derrota al terminar. Se lanza dentro del click, asi
         el navegador permite el autoplay (viene de una interaccion). */
      const perfectNow = QUESTIONS.every(
        (item, index) => item.options[updated[index]] === item.correct
      )
      const audio = createDialogAudio(perfectNow ? victoriaAudio : derrotaAudio)
      audio.play().catch(() => {})
      return
    }

    setAnswers(updated)
    setCurrent(current + 1)
    setSelected(null)
  }

  const previous = () => {
    if (current === 0) return
    setCurrent(current - 1)
    setSelected(answers[current - 1] ?? null)
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
  }

  const score = answers.reduce((acc, answer, index) => {
    const item = QUESTIONS[index]
    return item.options[answer] === item.correct ? acc + 1 : acc
  }, 0)

  useEffect(() => {
    if (finished && score === total) {
      onComplete?.()
    }
  }, [finished, score, total, onComplete])

  if (finished) {
    const perfect = score === total

    return (
      <main className="quiz quiz--result">
        <div className="quiz__result">
          <div className="quiz__duck-bubble">
            <p className="quiz__score">
              {score} de {total}
            </p>
            <p className="quiz__duck-text">
              {perfect
                ? 'Muy bieeeeen amore mio, te quiero y te amo con todo, dame un besito.'
                : 'Mi vida, preciosidad de mi alma. ¿No me conoces? Hazlo otra vez por favor.'}
            </p>
          </div>

          {/* prueba superada -> pose beso; fallida -> pose triste */}
          <img
            src={perfect ? beso : triste}
            alt={perfect ? 'Patito chico beso' : 'Patito chico triste'}
            className="quiz__duck"
          />
        </div>

        <div className="quiz__actions quiz__actions--result">
          <GlassButton variant="ghost" onClick={onBack}>
            Volver al menú
          </GlassButton>
          <GlassButton variant="accent" onClick={restart}>
            Repetir
          </GlassButton>
        </div>
      </main>
    )
  }

  return (
    <main className="quiz">
      <section className="quiz__panel glass">
        <header className="quiz__header">
          <div className="quiz__topbar">
            <button
              type="button"
              className="quiz__back"
              onClick={() => {
                playClickSfx();
                onBack();
              }}
              aria-label="Volver al menú"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Menú
            </button>
            <p className="quiz__eyebrow">
              Pregunta {current + 1} de {total}
            </p>
          </div>
          <div className="quiz__progress" aria-hidden="true">
            <span className="quiz__progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <h2 className="quiz__title">{question.question}</h2>

        <ul className="quiz__options">
          {question.options.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                className={
                  "quiz__option" + (selected === index ? " quiz__option--selected" : "")
                }
                onClick={() => {
                  playClickSfx();
                  choose(index);
                }}
                aria-pressed={selected === index}
              >
                <span className="quiz__option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="quiz__actions">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={previous}
            disabled={current === 0}
          >
            Anterior
          </GlassButton>
          <GlassButton
            variant="accent"
            onClick={next}
            disabled={selected === null}
          >
            {current === total - 1 ? 'Terminar' : 'Siguiente'}
          </GlassButton>
        </div>
      </section>
    </main>
  )
}
