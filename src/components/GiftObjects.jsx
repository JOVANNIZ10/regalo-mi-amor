/* ------------------------------------------------------------------
   Iconos de interfaz del scaperoom (llave, regalo, mochila, candado).
   Los objetos de las salas viven en WorldArt.jsx.
------------------------------------------------------------------ */

export const KeyIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <circle
      cx="8"
      cy="8"
      r="4.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M11 11.4 L19 19.4 M15.6 15.6 L13.6 17.6 M18 18 L16 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const GiftIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <rect
      x="3"
      y="9"
      width="18"
      height="12"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M3 13 H21 M12 9 V21" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 9 C8 9 6 7.4 6 5.6 C6 4.2 7.2 3.4 8.4 4 C10 4.8 12 7.4 12 9 Z M12 9 C16 9 18 7.4 18 5.6 C18 4.2 16.8 3.4 15.6 4 C14 4.8 12 7.4 12 9 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
)

export const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <path
      d="M6 8 H18 L19.4 20.2 A1.4 1.4 0 0 1 18 21.6 H6 A1.4 1.4 0 0 1 4.6 20.2 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 8 V6.4 A3 3 0 0 1 15 6.4 V8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9.5 12.5 H14.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <rect
      x="5"
      y="10.5"
      width="14"
      height="10"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M8.2 10.5 V8.2 A3.8 3.8 0 0 1 15.8 8.2 V10.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
  </svg>
)

export const UnlockIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <rect
      x="5"
      y="10.5"
      width="14"
      height="10"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M8.2 10.5 V8.2 A3.8 3.8 0 0 1 15.8 8.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
  </svg>
)

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <path
      d="M5 12.5 L10 17.5 L19 6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const SealIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <path
      d="M12 2.5 C7.2 2.5 4.2 5.4 4.2 9.2 C4.2 11.6 5.4 13.5 7.2 14.7 V21.5 H16.8 V14.7 C18.6 13.5 19.8 11.6 19.8 9.2 C19.8 5.4 16.8 2.5 12 2.5 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 9.6 L11.1 11.7 L15.4 7.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const PaperIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <path
      d="M6 3.5 H14 L18 7.5 V20.5 H6 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M14 3.5 V7.5 H18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12 H15 M9 15 H15 M9 18 H13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export const BackpackIcon = () => (
  <svg viewBox="0 0 24 24" className="gift-icon" aria-hidden="true">
    <path
      d="M8.5 7 V5.5 A3.5 3.5 0 0 1 15.5 5.5 V7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect
      x="4.5"
      y="7"
      width="15"
      height="14"
      rx="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M9 12 H15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <rect
      x="9.5"
      y="15"
      width="5"
      height="3.5"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
)
