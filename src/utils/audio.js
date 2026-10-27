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

/* En iPhone/Safari el volumen de un <audio> es de solo lectura (lo manda
   el boton fisico del telefono). Para que el slider funcione en movil la
   musica pasa por un GainNode de Web Audio, que si se puede ajustar. */
let bgCtx = null
let bgGain = null
let bgSource = null
let bgSourceAudio = null

function connectBgGain(audio) {
  const Ctx = window.AudioContext ?? window.webkitAudioContext
  if (!Ctx) return

  if (!bgCtx) bgCtx = new Ctx()
  bgCtx.resume().catch(() => {})

  if (!bgGain) {
    bgGain = bgCtx.createGain()
    bgGain.connect(bgCtx.destination)
  }

  /* createMediaElementSource solo puede llamarse UNA vez por elemento:
     solo se crea si aun no hay fuente o si cambio el elemento (fallback) */
  if (bgSourceAudio !== audio) {
    try {
      if (bgSource) bgSource.disconnect()
      bgSource = bgCtx.createMediaElementSource(audio)
      bgSource.connect(bgGain)
      bgSourceAudio = audio
    } catch {
      /* sin Web Audio: se queda con el volumen del elemento */
      bgSource = null
      bgSourceAudio = null
    }
  }

  if (bgSource) {
    /* a partir de aqui el volumen lo manda el gain, no el elemento */
    audio.volume = 1
    bgGain.gain.value = bgVolume
  }
}

export function getMusicVolume() {
  return bgVolume
}

/**
 * Ajusta el volumen de la musica de fondo en caliente.
 * `fromUserGesture` debe ser true cuando se llama desde un click/gesto:
 * es cuando el navegador permite crear/reanudar el contexto de audio
 * (imprescindible en movil).
 */
export function setMusicVolume(volume, fromUserGesture = false) {
  bgVolume = Math.min(1, Math.max(0, volume))

  if (fromUserGesture && bgAudio) connectBgGain(bgAudio)

  if (bgGain) bgGain.gain.value = bgVolume
  else if (bgAudio) bgAudio.volume = bgVolume
}

function startBgAudio(src) {
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = bgGain ? 1 : bgVolume
  audio.addEventListener('error', () => {
    /* navegador sin soporte ogg/opus -> cambia al mp3 */
    if (src !== bgMusicMp3) {
      const fallback = new Audio(bgMusicMp3)
      fallback.loop = true
      fallback.volume = bgGain ? 1 : bgVolume
      if (bgAudio === audio) {
        bgAudio = fallback
        /* si el grafico de volumen estaba activo, se reconstruye */
        if (bgCtx) connectBgGain(fallback)
      }
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

  /* Al primer gesto tambien se activan los graficos de volumen
     (GainNode): asi en movil el volumen aplicado de verdad. */
  const unlockGraphs = () => {
    if (bgAudio) connectBgGain(bgAudio)
    ensureDialogueGraph()
  }
  window.addEventListener('pointerdown', unlockGraphs, { once: true })
  window.addEventListener('touchstart', unlockGraphs, { once: true })
  window.addEventListener('keydown', unlockGraphs, { once: true })
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

/* En iPhone/Safari el volumen de un <audio> tampoco se puede cambiar.
   Igual que con la musica, las voces pasan por un GainNode cuando el
   navegador ya tiene el contexto de audio desbloqueado (primer gesto). */
let dialogueCtx = null
let dialogueGain = null
const connectedDialogs = new WeakSet()

function attachDialog(audio) {
  if (!dialogueCtx || connectedDialogs.has(audio)) return

  try {
    const source = dialogueCtx.createMediaElementSource(audio)
    source.connect(dialogueGain)
    audio.volume = 1 /* el volumen lo manda el gain */
    connectedDialogs.add(audio)
  } catch {
    /* no soportado o ya conectado: queda el volumen del elemento */
  }
}

function ensureDialogueGraph() {
  const Ctx = window.AudioContext ?? window.webkitAudioContext
  if (!Ctx) return

  if (!dialogueCtx) {
    dialogueCtx = new Ctx()
    dialogueGain = dialogueCtx.createGain()
    dialogueGain.gain.value = dialogueVolume
    dialogueGain.connect(dialogueCtx.destination)
  }
  dialogueCtx.resume().catch(() => {})

  /* las voces que ya estuvieran creadas pasan tambien por el gain */
  for (const audio of activeDialogAudios) attachDialog(audio)
}

export function getDialogueVolume() {
  return dialogueVolume
}

/** Ajusta el volumen de las voces, incluso las que suenan ahora mismo */
export function setDialogueVolume(volume) {
  dialogueVolume = Math.min(1, Math.max(0, volume))

  ensureDialogueGraph()
  if (dialogueGain) dialogueGain.gain.value = dialogueVolume

  for (const audio of activeDialogAudios) {
    if (!connectedDialogs.has(audio)) audio.volume = dialogueVolume
  }
}

/**
 * Crea un Audio de dialogo (voces de los patitos, victoria...) con el
 * volumen configurado y registrado, para que la ruedita lo ajuste
 * incluso mientras suena. Se quita del registro al acabar/error.
 */
export function createDialogAudio(src) {
  const audio = new Audio(src)
  audio.volume = dialogueGain ? 1 : dialogueVolume
  activeDialogAudios.add(audio)
  if (dialogueCtx) attachDialog(audio)
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
