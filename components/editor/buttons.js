import React, { useCallback } from "react";
import { isString } from "@remirror/core";
import { useCommandOptionValues } from "./use-command-option-values";
import { useCommands, useActive } from "@remirror/react";
import { Button, Tip } from "grommet";
import { BlockQuote, Bold, Italic, StrikeThrough } from "grommet-icons";

const ICON_MAP = {
  bold: <Bold />,
  italic: <Italic />,
  strikethrough: <StrikeThrough />,
  doubleQuotesL: <BlockQuote />,
};

export const CommandButton = ({
  commandName,
  active = false,
  enabled,
  attrs,
  onSelect,
  onChange,
  displayShortcut = true,
  "aria-label": ariaLabel,
  label,
  ...rest
}) => {
  const handleChange = useCallback(
    (e, value) => {
      onSelect();
      onChange?.(e, value);
    },
    [onSelect, onChange]
  );

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  const commandOptions = useCommandOptionValues({
    commandName,
    active,
    enabled,
    attrs,
  });

  let fallbackIcon = null;

  if (commandOptions.icon) {
    fallbackIcon = isString(commandOptions.icon)
      ? commandOptions.icon
      : commandOptions.icon.name;
  }

  const labelText = ariaLabel ?? commandOptions.label ?? "";
  const tooltipText = label ?? labelText;
  const shortcutText =
    displayShortcut && commandOptions.shortcut
      ? ` (${commandOptions.shortcut})`
      : "";

  return (
    <Tip content={`${tooltipText}${shortcutText}`}>
      <Button
        aria-label={labelText}
        onMouseDown={handleMouseDown}
        icon={ICON_MAP[fallbackIcon]}
        primary={active}
        disabled={!enabled}
        value={commandName}
        onChange={handleChange}
        size="small"
      />
    </Tip>
  );
};

export const ToggleBoldButton = (props) => {
  const { toggleBold } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleBold.enabled()) {
      toggleBold();
    }
  }, [toggleBold]);

  const active = useActive().bold();
  const enabled = toggleBold.enabled();

  return (
    <CommandButton
      {...props}
      commandName="toggleBold"
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};

export const ToggleItalicButton = (props) => {
  const { toggleItalic } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleItalic.enabled()) {
      toggleItalic();
    }
  }, [toggleItalic]);

  const active = useActive().italic();
  const enabled = toggleItalic.enabled();

  return (
    <CommandButton
      {...props}
      commandName="toggleItalic"
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};

export const ToggleStrikeButton = (props) => {
  const { toggleStrike } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleStrike.enabled()) {
      toggleStrike();
    }
  }, [toggleStrike]);

  const active = useActive().strike();
  const enabled = toggleStrike.enabled();

  return (
    <CommandButton
      {...props}
      commandName="toggleStrike"
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};

export const ToggleBlockquoteButton = (props) => {
  const { toggleBlockquote } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleBlockquote.enabled()) {
      toggleBlockquote();
    }
  }, [toggleBlockquote]);

  const active = useActive().blockquote();
  const enabled = toggleBlockquote.enabled();

  return (
    <CommandButton
      {...props}
      commandName="toggleBlockquote"
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
