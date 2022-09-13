import {
  capitalize,
  getShortcutSymbols,
  includes,
  isArray,
  isEqual,
  isFunction,
  isString,
} from "@remirror/core";

/**
 * Get the value from the option passed into the command.
 */

export function getCommandOptionValue(value, commandProps) {
  return isFunction(value) ? value(commandProps) : value;
}

/**
 * Checks whether the first element in an array is a string and assumes the
 * whole array is a string array.
 */
function isStringArray(array) {
  return isString(array[0]);
}
/**
 * Get the string value from the available UI Shortcut.
 */

export function getUiShortcutString(uiShortcut, attrs) {
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
      uiShortcut.find((shortcut) => isEqual(shortcut.attrs, attrs)) ??
      uiShortcut[0]
    )?.shortcut ?? ""
  );
}

const CASINGS = {
  title: (value) => capitalize(value),
  upper: (value) => value.toLocaleUpperCase(),
  lower: (value) => value.toLocaleLowerCase(),
};

/**
 * Get a normalized shortcut as a string.
 */
export function getShortcutString(shortcut, options) {
  const {
    casing = "title",
    namedAsSymbol = false,
    modifierAsSymbol = true,
    separator = " ",
    t,
  } = options;

  const symbols = getShortcutSymbols(shortcut);
  const stringSymbols = [];

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
          ? sym.symbol ?? t(sym.i18n)
          : t(sym.i18n);
      stringSymbols.push(transform(value));

      continue;
    }

    const value =
      modifierAsSymbol === true ||
      (isArray(modifierAsSymbol) && includes(modifierAsSymbol, sym.key))
        ? sym.symbol
        : t(sym.i18n);
    stringSymbols.push(transform(value));
  }

  return stringSymbols.join(separator);
}
