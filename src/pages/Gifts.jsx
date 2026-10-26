import { useCallback, useEffect, useRef, useState } from 'react'
import GlassButton from '../components/GlassButton'
import pato from '../assets/images/pato.png'
import patoEstera from '../assets/images/patoEstera.png'
import regalo1 from '../assets/images/regalo1.png'
import regalo2 from '../assets/images/regalo2.png'
import regalo3 from '../assets/images/regalo3.png'
import regalo4 from '../assets/images/regalo4.png'
import './Gifts.css'

/* ------------------------------------------------------------------
   Diálogos de entrada
------------------------------------------------------------------ */
const DIALOGUES = [
  {
    image: pato,
    alt: 'Patito rosa',
    text: '¿Crees que te lo voy a poner tan facil? Antes de recibir tus regalos tendras que pasar una prueba de obstaculos.',
    showName: true,
  },
  {
    image: patoEstera,
    alt: 'Patito de Estera',
    text: 'Cariño, por favor, dame los regalos yaaaa, oyeee.',
    showName: false,
  },
  {
    image: pato,
    alt: 'Patito rosa',
    text: 'Lo siento mi amor, pero tienes que pasar esta prueba para recibirlos, obraznicuta mea frumoasa ce esti.',
    showName: true,
  },
]

/* ------------------------------------------------------------------
   Regalos y niveles.
   Para usar la FOTO real del regalo, guarda la imagen en
   src/assets/images/ (p. ej. regalo1.png), impórtala arriba y añade
   `image: nombreImportado` al objeto. Si solo hay `emoji`, se muestra
   el emoji como marcador.
------------------------------------------------------------------ */
const GIFTS = [
  {
    name: 'Patito de peluche',
    emoji: '🦆',
    image: regalo1,
  },
  {
    name: 'Pollito de peluche',
    emoji: '🐤',
    image: regalo2,
  },
  {
    name: 'Perfume Valentino Vendetta',
    emoji: '🌸',
    image: regalo3,
  },
  {
    name: 'Dyson Airwrap rosa',
    emoji: '🎀',
    image: regalo4,
  },
]

const LEVELS = [
  { target: 5, moveDur: 2200, spawnMs: 1200 },
  { target: 7, moveDur: 1900, spawnMs: 1050 },
  { target: 9, moveDur: 1650, spawnMs: 950 },
  { target: 11, moveDur: 1400, spawnMs: 900 },
]

/* Física del salto.
   El tiempo en el aire es ~0.71s, sin embargo el hueco entre obstaculos
   (spawnMs) siempre debe ser mayor que ese tiempo para que el nivel
   sea superable. */
const GRAVITY = 2800
const JUMP_VELOCITY = -1000

export default function Gifts({ onBack }) {
  /* ---------- Fases ----------
     big | estera | reply  -> diálogos de entrada
     ready                 -> panel antes de un nivel
     playing               -> juego en marcha
     crashed               -> choque
     gift                  -> regalo conseguido (overlay)
     done                  -> todos los niveles superados
  */
  const [phase, setPhase] = useState('big')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [levelIndex, setLevelIndex] = useState(0)
  const [obstacles, setObstacles] = useState([])
  const [passed, setPassed] = useState(0)
  const [collected, setCollected] = useState([])

  /* ---------- Refs del juego ---------- */
  const duckRef = useRef(null)
  const fieldRef = useRef(null)
  const duckYRef = useRef(0) // offset px (negativo = en el aire)
  const jumpVelRef = useRef(0)
  const passedRef = useRef(0)
  const obstacleIdRef = useRef(0)
  const spawnTimerRef = useRef(null)
  const rafRef = useRef(null)
  const phaseRef = useRef(phase) // estado fresco dentro del bucle/handlers

  phaseRef.current = phase

  const level = LEVELS[levelIndex]
  const gift = GIFTS[levelIndex]
  const dialogue = DIALOGUES[dialogueIndex]

  /* ---------- Utilidades ---------- */
  const resetDuck = useCallback(() => {
    duckYRef.current = 0
    jumpVelRef.current = 0
    if (duckRef.current) {
      duckRef.current.style.transform = 'translateY(0px)'
    }
  }, [])

  const stopTimers = useCallback(() => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => stopTimers, [stopTimers])

  const jump = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    if (duckYRef.current === 0) {
      jumpVelRef.current = JUMP_VELOCITY
    }
  }, [])

  /* Teclado: espacio / flecha arriba */
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, jump])

  /* ---------- Bucle del juego ---------- */
  useEffect(() => {
    if (phase !== 'playing') return

    resetDuck()
    passedRef.current = 0
    setPassed(0)
    setObstacles([])
    let lastT = 0

    const tick = (t) => {
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0
      lastT = t

      /* física del salto */
      if (duckYRef.current !== 0 || jumpVelRef.current !== 0) {
        duckYRef.current += jumpVelRef.current * dt
        jumpVelRef.current += GRAVITY * dt
        if (duckYRef.current > 0) {
          duckYRef.current = 0
          jumpVelRef.current = 0
        }
        if (duckRef.current) {
          duckRef.current.style.transform = `translateY(${duckYRef.current}px)`
        }
      }

      /* colisiones */
      const duckRect = duckRef.current?.getBoundingClientRect()
      if (duckRect) {
        const obstacleEls =
          fieldRef.current?.querySelectorAll('.gifts-obstacle') ?? []
        obstacleEls.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const overlapsX =
            rect.left < duckRect.right - 10 && rect.right > duckRect.left + 10
          const overlapsY = duckRect.bottom - 8 > rect.top
          if (overlapsX && overlapsY) {
            stopTimers()
            setPhase('crashed')
            return
          }
        })
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    spawnTimerRef.current = setInterval(() => {
      obstacleIdRef.current += 1
      const id = obstacleIdRef.current
      setObstacles((prev) => [...prev, id])
    }, level.spawnMs)

    return stopTimers
  }, [phase, levelIndex, resetDuck, stopTimers])

  /* ---------- Acciones ---------- */
  const advanceDialogue = () => {
    if (dialogueIndex < DIALOGUES.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      setPhase('ready')
    }
  }

  const retryLevel = () => {
    /* Importante: limpiamos los obstaculos ANTES de reanudar el juego,
       para que ninguno congelado del intento anterior choque al volver. */
    setObstacles([])
    passedRef.current = 0
    setPassed(0)
    setPhase('playing')
  }

  const claimGift = () => {
    const claimed = GIFTS[levelIndex]
    setCollected((prev) => (prev.includes(claimed.name) ? prev : [...prev, claimed.name]))

    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1)
      setPhase('ready')
    } else {
      setPhase('done')
    }
  }

  const restartAll = () => {
    setCollected([])
    setLevelIndex(0)
    setPhase('ready')
  }

  const handleObstacleGone = (id) => {
    if (phaseRef.current !== 'playing') return
    setObstacles((prev) => prev.filter((o) => o !== id))
    passedRef.current += 1
    setPassed(passedRef.current)
    if (passedRef.current >= level.target) {
      stopTimers()
      setPhase('gift')
    }
  }

  /* ---------- Pantallas ---------- */
  const showEntryOverlay =
    (phase === 'big' || phase === 'estera' || phase === 'reply') && dialogue

  return (
    <main className="gifts">
      {/* Overlay de diálogos de entrada */}
      {showEntryOverlay && (
        <div className="gifts-overlay" onClick={advanceDialogue}>
          <div className="gifts-overlay__dialog">
            <div className="gifts-overlay__bubble">
              <p className="gifts-overlay__text">{dialogue.text}</p>
              {dialogue.showName && (
                <p className="gifts-overlay__name">
                  Ivan, el novio mas guapo e inteligente del universo
                </p>
              )}
            </div>
            <img
              src={dialogue.image}
              alt={dialogue.alt}
              className="gifts-overlay__duck"
            />
          </div>
        </div>
      )}

      {/* Overlay de regalo ganado */}
      {phase === 'gift' && (
        <div className="gifts-overlay" onClick={claimGift}>
          <div className="gifts-overlay__dialog">
            <div className="gifts-overlay__bubble">
              <p className="gifts-overlay__text">
                Felicidades mi amor, te has ganado {gift.name}.
              </p>
              <p className="gifts-overlay__name">
                Ivan, el novio mas guapo e inteligente del universo
              </p>
            </div>

            <div className="gifts-gift">
              <span className="gifts-gift__visual">
                {gift.image ? (
                  <img src={gift.image} alt={gift.name} />
                ) : (
                  <span aria-hidden="true">{gift.emoji}</span>
                )}
              </span>
              <p className="gifts-gift__name">{gift.name}</p>
              <p className="gifts-gift__meta">
                Nivel {levelIndex + 1} de {LEVELS.length} · Toca la pantalla para
                continuar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Panel principal: listo / final */}
      {(phase === 'ready' || phase === 'done') && (
        <section className="gifts__stage">
          <div className="gifts__panel glass">
            {phase === 'ready' && (
              <>
                <p className="gifts__eyebrow">
                  Nivel {levelIndex + 1} de {LEVELS.length}
                </p>
                <h2 className="gifts__title">
                  Salta {level.target} obstaculos sin chocarte
                </h2>
                <p className="gifts__text">
                  Toca la pantalla (o pulsa espacio) para que el patito salte.
                  Cada nivel es mas rapido y al final te espera{' '}
                  <strong>{GIFTS[levelIndex].name}</strong>.
                </p>
                <div className="gifts__actions">
                  <GlassButton variant="ghost" onClick={onBack}>
                    Volver al menu
                  </GlassButton>
                  <GlassButton variant="accent" onClick={() => setPhase('playing')}>
                    {levelIndex === 0 ? 'Empezar' : 'Siguiente nivel'}
                  </GlassButton>
                </div>
              </>
            )}

            {phase === 'done' && (
              <>
                <p className="gifts__eyebrow">Prueba completada</p>
                <h2 className="gifts__title">Has superado todos los niveles</h2>
                <ul className="gifts__collection">
                  {GIFTS.map((g) => (
                    <li key={g.name}>
                      {g.image ? (
                        <img
                          src={g.image}
                          alt=""
                          className="gifts__collection-thumb"
                        />
                      ) : (
                        <span aria-hidden="true">{g.emoji}</span>
                      )}
                      <span>{g.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="gifts__text">
                  Recuerdas estos regalos y más, mi amor. Mereces esto y{' '}
                  <strong>un infinito</strong>.
                </p>
                <div className="gifts__actions">
                  <GlassButton variant="ghost" onClick={onBack}>
                    Volver al menu
                  </GlassButton>
                  <GlassButton variant="accent" onClick={restartAll}>
                    Jugar otra vez
                  </GlassButton>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Campo de juego (también visible al chocarse) */}
      {(phase === 'playing' || phase === 'crashed') && (
        <section
          className={
            'gifts-game' + (phase === 'crashed' ? ' gifts-game--crashed' : '')
          }
          ref={fieldRef}
          onPointerDown={jump}
          aria-label="Campo de juego: toca para saltar"
        >
          <div className="gifts-game__hud">
            <span>Nivel {levelIndex + 1}</span>
            <span>
              Saltados {passed}/{level.target}
            </span>
          </div>

          <img
            src={patoEstera}
            alt="Patito saltando"
            className="gifts-game__duck"
            ref={duckRef}
          />

          {obstacles.map((id) => (
            <span
              key={id}
              className={
                'gifts-obstacle' + (id % 2 === 0 ? ' gifts-obstacle--tall' : '')
              }
              style={{ animationDuration: `${level.moveDur}ms` }}
              onAnimationEnd={() => handleObstacleGone(id)}
            />
          ))}

          {phase === 'crashed' && (
            <div className="gifts-crash glass">
              <p className="gifts__eyebrow">Ay...</p>
              <h2 className="gifts-crash__title">Te has chocado</h2>
              <p className="gifts-crash__text">
                Los {level.target} obstaculos tienen que ser seguidos para
                desbloquear tu regalo.
              </p>
              <div className="gifts-crash__actions">
                <GlassButton variant="ghost" size="sm" onClick={onBack}>
                  Volver
                </GlassButton>
                <GlassButton variant="accent" size="sm" onClick={retryLevel}>
                  Reintentar
                </GlassButton>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
