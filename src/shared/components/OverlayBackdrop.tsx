import React from "react";
import { useOverlayThemeColor } from "../hooks/useOverlayThemeColor";

interface OverlayBackdropProps {
  className?: string;
  onClick?: () => void;
}

export default function OverlayBackdrop({
  className = "",
  onClick,
}: OverlayBackdropProps) {
  useOverlayThemeColor(true);
  return (
    <div
      className={`overlay-backdrop ${className}`}
      onClick={onClick}
      aria-hidden
    />
  );
}
