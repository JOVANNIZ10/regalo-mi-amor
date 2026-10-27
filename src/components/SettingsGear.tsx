import { useEffect, useState } from 'react'
import {
  getMusicVolume,
  getDialogueVolume,
  setMusicVolume,
  setDialogueVolume,
} from '../utils/audio'
import './SettingsGear.css'

/* ------------------------------------------------------------------
   Ruedita de ajustes: volumen de la musica de fondo y de los
   dialogos (voces de los patitos, victoria...).
   Guarda los valores en localStorage para recordarlos.
------------------------------------------------------------------ */

const STORAGE_KEYS = {
  music: 'vrg-vol-musica',
  dialogs: 'vrg-vol-dialogos',
}

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const value = Number(raw)
    if (Number.isNaN(value)) return fallback
    return Math.min(100, Math.max(0, value))
  } catch {
    return fallback
  }
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function SettingsGear() {
  const [open, setOpen] = useState(false)
  const [music, setMusic] = useState(() => Math.round(getMusicVolume() * 100))
  const [dialogs, setDialogs] = useState(() => Math.round(getDialogueVolume() * 100))

  /* Al montar, aplican y sobreescriben con lo guardado (por si la
     sesion anterior usaba otros valores) */
  useEffect(() => {
    const storedMusic = readStored(STORAGE_KEYS.music, Math.round(getMusicVolume() * 100))
    const storedDialogs = readStored(STORAGE_KEYS.dialogs, Math.round(getDialogueVolume() * 100))
    setMusicVolume(storedMusic / 100)
    setDialogueVolume(storedDialogs / 100)
    setMusic(storedMusic)
    setDialogs(storedDialogs)
  }, [])

  const changeMusic = (value) => {
    setMusic(value)
    /* true: viene de un gesto del usuario, se puede crear el
       GainNode de Web Audio (necesario para que funcione en movil) */
    setMusicVolume(value / 100, true)
    try {
      localStorage.setItem(STORAGE_KEYS.music, String(value))
    } catch {
      /* storage bloqueado: no pasa nada */
    }
  }

  const changeDialogs = (value) => {
    setDialogs(value)
    setDialogueVolume(value / 100)
    try {
      localStorage.setItem(STORAGE_KEYS.dialogs, String(value))
    } catch {
      /* storage bloqueado: no pasa nada */
    }
  }

  return (
    <div className="settings-gear">
      <button
        type="button"
        className="settings-gear__button glass"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar ajustes' : 'Abrir ajustes'}
        aria-expanded={open}
      >
        <GearIcon />
      </button>

      {open && (
        <div className="settings-gear__panel glass">
          <p className="settings-gear__title">Ajustes</p>

          <label className="settings-gear__row">
            <span className="settings-gear__label">Música</span>
            <input
              type="range"
              min="0"
              max="100"
              value={music}
              onChange={(event) => changeMusic(Number(event.target.value))}
            />
            <span className="settings-gear__value">{music}%</span>
          </label>

          <label className="settings-gear__row">
            <span className="settings-gear__label">Diálogos</span>
            <input
              type="range"
              min="0"
              max="100"
              value={dialogs}
              onChange={(event) => changeDialogs(Number(event.target.value))}
            />
            <span className="settings-gear__value">{dialogs}%</span>
          </label>
        </div>
      )}
    </div>
  )
}
