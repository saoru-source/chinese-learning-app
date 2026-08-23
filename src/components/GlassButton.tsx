"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
  type?: "button" | "submit";
};

const PAD = { sm: "9px 20px", md: "13px 28px", lg: "16px 36px" };
const FONT_SIZE = { sm: 12, md: 14, lg: 15 };

export default function GlassButton({
  onClick,
  disabled,
  children,
  style,
  fullWidth,
  size = "md",
  variant = "primary",
  type = "button",
}: Props) {
  const isPrimary = variant === "primary" && !disabled;

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: "relative",
        overflow: "hidden",
        background: isPrimary ? "var(--grad)" : disabled ? "#E5E7EB" : "#ffffff",
        color: isPrimary ? "#fff" : disabled ? "#9CA3AF" : "var(--ink)",
        border: variant === "white" ? "1px solid var(--line)" : "none",
        borderRadius: 50,
        padding: PAD[size],
        fontSize: FONT_SIZE[size],
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: fullWidth ? "100%" : "auto",
        boxShadow: isPrimary
          ? "0 6px 24px color-mix(in srgb, var(--seal) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.08)"
          : disabled
            ? "none"
            : "0 4px 14px rgba(0,0,0,0.09)",
        transition: "box-shadow 0.2s ease",
        ...style,
      }}
    >
      {isPrimary && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
            borderRadius: "inherit",
            pointerEvents: "none",
          }}
        />
      )}
      <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        {children}
      </span>
    </motion.button>
  );
}
