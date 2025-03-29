import {
  capitalize,
  getShortcutSymbols,
  includes,
  isArray,
  isEqual,
  isFunction,
  isString,
} from "@remirror/core";

interface CommandProps {
  active?: boolean;
  attrs?: Record<string, any>;
  enabled?: boolean;
  t: (key: string) => string;
  [key: string]: any;
}

/**
 * Get the value from the option passed into the command.
 */
export function getCommandOptionValue<T>(value: any, commandProps: CommandProps): T {
  return isFunction(value) ? value(commandProps) : value;
}

/**
 * Checks whether the first element in an array is a string and assumes the
 * whole array is a string array.
 */
function isStringArray(array: any[]): array is string[] {
  return isString(array[0]);
}

interface ShortcutAttrs {
  attrs: Record<string, any>;
  shortcut: string;
}

type UiShortcut = string | ShortcutAttrs | string[] | ShortcutAttrs[];

/**
 * Get the string value from the available UI Shortcut.
 */
export function getUiShortcutString(uiShortcut: UiShortcut, attrs: Record<string, any>): string {
  if (isString(uiShortcut)) {
    return uiShortcut;
  }
  
  if (!isArray(uiShortcut)) {
    return uiShortcut.shortcut;
  }
  
  if (isStringArray(uiShortcut)) {
    return uiShortcut[0] ?? "";
  }
  
  return (
    (
      (uiShortcut as ShortcutAttrs[]).find((shortcut) => isEqual(shortcut.attrs, attrs)) ??
      (uiShortcut as ShortcutAttrs[])[0]
    )?.shortcut ?? ""
  );
}

interface ShortcutStringOptions {
  casing?: 'title' | 'upper' | 'lower';
  namedAsSymbol?: boolean | string[];
  modifierAsSymbol?: boolean | string[];
  separator?: string;
  t: (key: string) => string;
}

const CASINGS: Record<string, (value: string) => string> = {
  title: (value) => capitalize(value),
  upper: (value) => value.toLocaleUpperCase(),
  lower: (value) => value.toLocaleLowerCase(),
};

/**
 * Get a normalized shortcut as a string.
 */
export function getShortcutString(shortcut: string, options: ShortcutStringOptions): string {
  const {
    casing = "title",
    namedAsSymbol = false,
    modifierAsSymbol = true,
    separator = " ",
    t,
  } = options;
  
  const symbols = getShortcutSymbols(shortcut);
  const stringSymbols: string[] = [];
  const transform = CASINGS[casing];
  
  for (const sym of symbols) {
    if (sym.type === "char") {
      stringSymbols.push(transform(sym.key));
      continue;
    }
    
    if (sym.type === "named") {
      const value =
        namedAsSymbol === true ||
        (isArray(namedAsSymbol) && includes(namedAsSymbol, sym.key))
          ? sym.symbol ?? t(sym.i18n.message)
          : t(sym.i18n.message);
      stringSymbols.push(transform(value));
      continue;
    }
    
    const value =
      modifierAsSymbol === true ||
      (isArray(modifierAsSymbol) && includes(modifierAsSymbol, sym.key))
        ? sym.symbol
        : t(sym.i18n.message);
    stringSymbols.push(transform(value));
  }
  
  return stringSymbols.join(separator);
}