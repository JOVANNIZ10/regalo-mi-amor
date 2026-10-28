import { useEffect, useRef, useState } from 'react'
import { createDialogAudio } from './audio'

/* ------------------------------------------------------------------
   Hook de audio de dialogo. Reproduce `src` en cuanto `active` pasa a
   true, intentandolo de forma automatica. Chrome/Safari pueden bloquear
   el autoplay sin ninguna interaccion previa (norma anti-publicidad);
   en ese caso se reintenta en la primera interaccion de CUALQUIER tipo
   (toca la pantalla, click, tecla...) sin que haga falta un click extra.

   Al cambiar `src` (siguiente linea del dialogo) se corta la voz
   anterior, para que nunca se solapen dos frases.

   NO bloquea el avanzar del dialogo por defecto: si un dialogo concreto
   quiere bloquearse hasta que su audio acabe (p.ej. el de entrada), su
   componente lo consulta con `finished`.
------------------------------------------------------------------ */
export function useDialogueAudio(src: string, active: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!active) return

    setFinished(false)

    const audio = createDialogAudio(src)
    audioRef.current = audio
    audio.addEventListener('ended', () => setFinished(true))
    audio.addEventListener('error', () => setFinished(true))

    /* limpieza de los reintentos cuando el audio ya esta sonando */
    const stopRetry = () => {
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('touchstart', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }

    const tryPlay = () => {
      if (audio.paused && !audio.ended) {
        audio.currentTime = 0
        audio.play().then(stopRetry).catch(() => {})
      }
    }

    /* intento 1: automatico */
    tryPlay()

    /* intentos 2+: primera interaccion de cualquier tipo */
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('touchstart', tryPlay)
    window.addEventListener('keydown', tryPlay)

    return () => {
      audio.pause()
      audioRef.current = null
      stopRetry()
    }
  }, [active, src])

  return {
    finished,
    /* arranca el audio manual (p.ej. al click) si el autoplay fallo */
    playIfPaused: () => {
      const audio = audioRef.current
      if (audio?.paused) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
    },
  }
}

export default useDialogueAudio
