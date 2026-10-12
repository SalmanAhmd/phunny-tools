import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { sfx, type SoundName } from "../lib/sound";

export type ButtonVariant = "primary" | "purple" | "lime" | "yellow" | "ghost" | "danger";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  purple: "btn-purple",
  lime: "btn-lime",
  yellow: "btn-yellow",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Sound played on press. Defaults to a soft click. */
  sound?: SoundName | null;
  pop?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  { variant = "primary", sound = "click", pop = true, size = "md", className = "", onClick, children, ...rest },
  ref,
) {
  const sizeClass =
    size === "sm" ? "px-3 py-2 text-sm" : size === "lg" ? "px-7 py-4 text-lg" : "";
  return (
    <button
      ref={ref}
      className={`btn ${VARIANT_CLASS[variant]} ${pop ? "btn-pop" : ""} ${sizeClass} ${className}`}
      onClick={(event) => {
        if (sound) sfx(sound);
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});
