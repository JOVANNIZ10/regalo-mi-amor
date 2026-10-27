import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { playClickSfx } from "../utils/audio";
import "./GlassButton.css";

export type GlassButtonVariant = "default" | "accent" | "ghost";
export type GlassButtonSize = "sm" | "md" | "lg";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  /** Nodo opcional (por ejemplo un <svg />) que se muestra antes del texto */
  icon?: ReactNode;
}

/**
 * Botón glassmorphism.
 * Requiere importar index.css una sola vez en la raíz (tokens + clase .glass).
 */
const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    { variant = "default", size = "md", icon, className, children, type = "button", onClick, ...props },
    ref
  ) {
    const classes = [
      "glass",
      "glass-btn",
      variant !== "default" && `glass-btn--${variant}`,
      size !== "md" && `glass-btn--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        onClick={(event) => {
          playClickSfx();
          onClick?.(event);
        }}
        {...props}
      >
        {icon && (
          <span className="glass-btn__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);

export default GlassButton;

/* ---------- Ejemplo de uso ----------

import GlassButton from "./GlassButton";

<GlassButton variant="accent" onClick={() => navigator.clipboard.writeText(code)}>
  Copiar código
</GlassButton>

<GlassButton variant="ghost" size="sm">Cancelar</GlassButton>
<GlassButton size="lg" disabled>Invitar amigos</GlassButton>

*/