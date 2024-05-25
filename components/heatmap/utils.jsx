import color from "tinycolor2";

import { DEFAULT_THEME, NAMESPACE } from "./constants";

export function createCalendarTheme(
  baseColor,
  textColor = "inherit",
  emptyCellColor = color("white").darken(8).toHslString(),
  background = "transparent"
) {
  const base = color(baseColor);

  if (!base.isValid()) {
    return DEFAULT_THEME;
  }

  const text = color(textColor).isValid()
    ? String(color(textColor))
    : DEFAULT_THEME.text;

  return {
    background,
    text,
    grade4: base.setAlpha(1).toHslString(),
    grade3: base.setAlpha(0.9).toHslString(),
    grade2: base.setAlpha(0.85).toHslString(),
    grade1: base.setAlpha(0.75).toHslString(),
    grade0: emptyCellColor,
  };
}

export function getClassName(name, extra) {
  if (extra) {
    return `${NAMESPACE}__${name} ${extra}`;
  }

  return `${NAMESPACE}__${name}`;
}
