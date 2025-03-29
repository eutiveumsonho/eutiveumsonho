import tinycolor from "tinycolor2";
import { DEFAULT_THEME, NAMESPACE, CalendarTheme } from "./constants";

export function createCalendarTheme(
  baseColor: string,
  textColor = "inherit",
  emptyCellColor = tinycolor("white").darken(8).toHslString(),
  background = "transparent"
): CalendarTheme {
  const base = tinycolor(baseColor);
  if (!base.isValid()) {
    return DEFAULT_THEME;
  }
  
  const text = tinycolor(textColor).isValid()
    ? String(tinycolor(textColor))
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

export function getClassName(name: string, extra?: string): string {
  if (extra) {
    return `${NAMESPACE}__${name} ${extra}`;
  }
  return `${NAMESPACE}__${name}`;
}