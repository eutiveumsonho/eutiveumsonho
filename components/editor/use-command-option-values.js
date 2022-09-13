import { useMemo } from "react";
import { useHelpers, useI18n } from "@remirror/react-core";

import {
  getCommandOptionValue,
  getShortcutString,
  getUiShortcutString,
} from "./react-component-utils";

export const useCommandOptionValues = ({
  commandName,
  active,
  enabled,
  attrs,
}) => {
  const { t } = useI18n();
  const { getCommandOptions } = useHelpers();
  const options = getCommandOptions(commandName);

  const { description, label, icon, shortcut } = options || {};
  const commandProps = useMemo(() => {
    return { active, attrs, enabled, t };
  }, [active, attrs, enabled, t]);

  const shortcutString = useMemo(() => {
    if (!shortcut) {
      return;
    }

    return getShortcutString(getUiShortcutString(shortcut, attrs ?? {}), {
      t,
      separator: "",
    });
  }, [shortcut, attrs, t]);

  return useMemo(() => {
    return {
      description: getCommandOptionValue(description, commandProps),
      label: getCommandOptionValue(label, commandProps),
      icon: getCommandOptionValue(icon, commandProps),
      shortcut: shortcutString,
    };
  }, [commandProps, description, label, icon, shortcutString]);
};
