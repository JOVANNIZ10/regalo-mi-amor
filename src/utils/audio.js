/* ------------------------------------------------------------------
   Modulo central de audio.

   - Audios de dialogo: voces de los patitos, victoria/derrota, con su
     propio volumen (ruedita de ajustes).
   - Tic-tac de contrarreloj para el cuestionario (sintetizado).
   - Efecto "tap" para los clicks de boton (sintetizado).

   Sin musica de fondo.
------------------------------------------------------------------ */

/* ---------- Volumen de los audios de dialogo (voces, victoria...) ---------- */
let dialogueVolume = 1
const activeDialogAudios = new Set()

export function getDialogueVolume() {
  return dialogueVolume
}

/**
 * Ajusta el volumen de las voces, incluso las que suenan ahora mismo.
 * NOTA: iOS/Safari ignora el volumen de los <audio> (lo manda el boton
 * fisico). Las voces se dejan nativas para que suenen SIEMPRE; en movil
 * el volumen de las voces se ajusta con los botones del telefono.
 */
export function setDialogueVolume(volume) {
  dialogueVolume = Math.min(1, Math.max(0, volume))
  for (const audio of activeDialogAudios) audio.volume = dialogueVolume
}

/**
 * Crea un Audio de dialogo con el volumen configurado y registrado,
 * para que la ruedita lo ajuste incluso mientras suena.
 * Se quita del registro al acabar/error.
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

/**
 * Corta todas las voces que esten sonando ahora mismo.
 * Se usa al salir de una seccion para que no se solapen con el
 * audio de la seccion siguiente.
 */
export function stopDialogAudios() {
  for (const audio of activeDialogAudios) {
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      /* da igual si el navegador no deja rebobinarlo */
    }
  }
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
const TICK_PERIOD_MS = 530 /* un tic y un tac alternados */

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
