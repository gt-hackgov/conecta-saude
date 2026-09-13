export const A11Y_KEYS = {
  fontScale: "saudeA11yFontScale",
  spacing: "saudeA11ySpacing",
  contrast: "saudeA11yContrast",
  reduceMotion: "saudeA11yReduceMotion",
  colorblind: "saudeA11yColorblind",
};

export function applyAccessibilityPreferences() {
  if (typeof window === "undefined") return;

  const fontScale = localStorage.getItem(A11Y_KEYS.fontScale) ?? "100";
  document.documentElement.style.fontSize = `${fontScale}%`;

  const spacing = localStorage.getItem(A11Y_KEYS.spacing) ?? "padrao";
  document.documentElement.setAttribute("data-spacing", spacing);

  const contrast = localStorage.getItem(A11Y_KEYS.contrast) ?? "padrao";
  document.documentElement.classList.toggle("high-contrast", contrast === "alto-contraste");

  const reduceMotion = localStorage.getItem(A11Y_KEYS.reduceMotion) === "true";
  document.documentElement.classList.toggle("reduce-motion", reduceMotion);

  const colorblind = localStorage.getItem(A11Y_KEYS.colorblind) ?? "nenhum";
  document.documentElement.setAttribute("data-colorblind", colorblind);
}
