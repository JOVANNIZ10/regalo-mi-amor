/* ------------------------------------------------------------------
   Modulo central de audio.

   - Musica de ambiente de fondo (bucle, todas las secciones),
     con pausa/reanudacion para secciones que llevan su propia pista
     (p.ej. el cuestionario de contrarreloj).
   - Tic-tac de contrarreloj para el cuestionario (sintetizado,
     sin archivos: Web Audio API).
   - Efecto "pop" para los clicks de boton (tambien sintetizado).

   El audio con sonido no puede arrancar sin una interaccion del
   usuario (norma de los navegadores): aqui se intenta al momento
   y, si se bloquea, en la primera interaccion de cualquier tipo.
------------------------------------------------------------------ */

/* ---------- Musica de fondo ---------- */
import bgMusicOgg from '../assets/audios/musicaAmbienteInazuma.ogg'
import bgMusicMp3 from '../assets/audios/musicaAmbienteInazuma64.mp3'

/* Volumen de la musica de fondo (0 a 1), ajustable desde la ruedita */
const DEFAULT_MUSIC_VOLUME = 0.15
let bgVolume = DEFAULT_MUSIC_VOLUME

let bgAudio = null
let bgPausedByPage = false
let bgInitialized = false

export function getMusicVolume() {
  return bgVolume
}

/** Ajusta el volumen de la musica de fondo en caliente */
export function setMusicVolume(volume) {
  bgVolume = Math.min(1, Math.max(0, volume))
  if (bgAudio) bgAudio.volume = bgVolume
}

function startBgAudio(src) {
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = bgVolume
  audio.addEventListener('error', () => {
    /* navegador sin soporte ogg/opus -> cambia al mp3 */
    if (src !== bgMusicMp3) {
      const fallback = new Audio(bgMusicMp3)
      fallback.loop = true
      fallback.volume = bgVolume
      if (bgAudio === audio) bgAudio = fallback
      /* si ya estaba sonando (cambio a mitad de sesion) lo arranca */
      if (!bgPausedByPage) fallback.play().catch(() => {})
    }
  })
  return audio
}

export function initBackgroundMusic() {
  if (bgInitialized) return
  bgInitialized = true

  bgAudio = startBgAudio(bgMusicOgg)

  const tryPlay = () => {
    if (!bgPausedByPage && bgAudio && bgAudio.paused) {
      bgAudio.play().catch(() => {})
    }
  }

  /* intento automatico */
  tryPlay()

  /* reintento con la primera interaccion de cualquier tipo */
  window.addEventListener('pointerdown', tryPlay)
  window.addEventListener('touchstart', tryPlay)
  window.addEventListener('keydown', tryPlay)
}

/** La pagina actual lleva su propia pista: silencia el fondo */
export function pauseBackgroundMusic() {
  bgPausedByPage = true
  bgAudio?.pause()
}

/** La pagina sale: el fondo vuelve */
export function resumeBackgroundMusic() {
  bgPausedByPage = false
  if (bgAudio) bgAudio.play().catch(() => {})
}

/* ---------- Volumen de los audios de dialogo (voces, victoria...) ---------- */
let dialogueVolume = 1
const activeDialogAudios = new Set()

export function getDialogueVolume() {
  return dialogueVolume
}

/** Ajusta el volumen de las voces, incluso las que suenan ahora mismo */
export function setDialogueVolume(volume) {
  dialogueVolume = Math.min(1, Math.max(0, volume))
  for (const audio of activeDialogAudios) audio.volume = dialogueVolume
}

/**
 * Crea un Audio de dialogo (voces de los patitos, victoria...) con el
 * volumen configurado y registrado, para que la ruedita lo ajuste
 * incluso mientras suena. Se quita del registro al acabar/error.
 */
export function createDialogAudio(src) {
  const audio = new Audio(src)
  audio.volume = dialogueVolume
  activeDialogAudios.add(audio)
  const unregister = () => activeDialogAudios.delete(audio)
  audio.addEventListener('ended', unregister)
  audio.addEventListener('error', unregister)
  return audio
}

/* ---------- Contexto Web Audio (sintetizados) ---------- */
let sfxCtx = null

function ensureCtx() {
  /* Se crea perezosamente dentro de un gesto del usuario: ahi el
     navegador permite el audio siempre. */
  if (!sfxCtx) {
    const Ctx = window.AudioContext ?? window.webkitAudioContext
    if (!Ctx) return null
    sfxCtx = new Ctx()
  }
  if (sfxCtx.state === 'suspended') sfxCtx.resume().catch(() => {})
  return sfxCtx
}

/* ---------- Efecto de click (tap suave) ---------- */
export function playClickSfx() {
  const ctx = ensureCtx()
  if (!ctx) return

  const now = ctx.currentTime

  /* "tap" corto y grave: nota limpia con caida rapida, sin barrido
     de tono (el barrido downward era lo que sonaba a laser/disparo) */
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.07)
}

/* ---------- Tic-tac de contrarreloj para el cuestionario ---------- */
const TICK_PERIOD_MS = 530 /* un tic y un tac alternate */

let tickInterval = null

function playTick(high) {
  const ctx = ensureCtx()
  if (!ctx) return

  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = high ? 1150 : 940
  gain.gain.setValueAtTime(0.07, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.06)
}

export function startQuizTicking() {
  if (tickInterval !== null) return
  let high = false
  playTick(high)
  tickInterval = setInterval(() => {
    high = !high
    playTick(high)
  }, TICK_PERIOD_MS)
}

export function stopQuizTicking() {
  if (tickInterval !== null) {
    clearInterval(tickInterval)
    tickInterval = null
  }
}
