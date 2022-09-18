import React, { useCallback, useRef, useState } from "react";
import { isString, uniqueId } from "@remirror/core";
import { useCommandOptionValues } from "./use-command-option-values";
import { useCommands, useActive, useHelpers } from "@remirror/react";
import { Box, Button, DropButton, Tip, Text } from "grommet";
import {
  BlockQuote,
  Bold,
  Down,
  Italic,
  Redo,
  StrikeThrough,
  Undo,
} from "grommet-icons";
import { BRAND_HEX } from "../../lib/config";

const iconProps = {
  size: "15px",
};

const ICON_MAP = {
  bold: (props) => <Bold {...iconProps} {...props} />,
  italic: (props) => <Italic {...iconProps} {...props} />,
  strikethrough: (props) => <StrikeThrough {...iconProps} {...props} />,
  doubleQuotesL: (props) => <BlockQuote {...iconProps} {...props} />,
  h1: (props) => (
    <Text size="11px" color="white" {...props}>
      <strong>H1</strong>
    </Text>
  ),
  h2: (props) => (
    <Text size="11px" color="white" {...props}>
      <strong>H2</strong>
    </Text>
  ),
  h3: (props) => (
    <Text size="11px" color="white" {...props}>
      <strong>H3</strong>
    </Text>
  ),
  arrowGoBackFill: (props) => <Undo {...iconProps} {...props} />,
  arrowGoForwardFill: (props) => <Redo {...iconProps} {...props} />,
};

export function CommandButton(props) {
  const {
    commandName,
    active = false,
    enabled,
    attrs,
    onSelect,
    onChange,
    displayShortcut = true,
    "aria-label": ariaLabel,
    label,
  } = props;

  const handleChange = useCallback(
    (event, value) => {
      onSelect();
      onChange?.(event, value);
    },
    [onSelect, onChange]
  );

  const handleMouseDown = useCallback((event) => {
    event.preventDefault();
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
    <Tip
      content={`${tooltipText}${shortcutText}`}
      plain
      dropProps={{
        background: "white",
        elevation: "large",
        style: {
          padding: "0.4rem",
          borderRadius: "0.25rem",
        },
      }}
    >
      <Button
        aria-label={labelText}
        onMouseDown={handleMouseDown}
        icon={ICON_MAP[fallbackIcon]({ color: active ? BRAND_HEX : "white" })}
        disabled={!enabled}
        value={commandName}
        onClick={handleChange}
        size="small"
        hoverIndicator
        style={{
          backgroundColor: active ? "white" : BRAND_HEX,
        }}
      />
    </Tip>
  );
}

export function ToggleBoldButton(props) {
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
      label="Traços mais grossos"
    />
  );
}

export function ToggleItalicButton(props) {
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
      label="Itálico"
    />
  );
}

export function ToggleStrikeButton(props) {
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
      label="Riscar"
    />
  );
}

export function ToggleBlockquoteButton(props) {
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
      label="Bloco de citação"
    />
  );
}

export function ToggleHeadingButton(props) {
  const { attrs, ...rest } = props;
  const { toggleHeading } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleHeading.enabled(attrs)) {
      toggleHeading(attrs);
    }
  }, [toggleHeading, attrs]);

  const active = useActive().heading(attrs);
  const enabled = toggleHeading.enabled(attrs);

  return (
    <CommandButton
      {...rest}
      commandName="toggleHeading"
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
      label={`Cabeçalho ${attrs.level}`}
    />
  );
}

const LEVEL_1 = { level: 1 };
const LEVEL_2 = { level: 2 };
const LEVEL_3 = { level: 3 };

export function DropdownButton(props) {
  const { label, "aria-label": ariaLabel, children, onClose } = props;

  const id = useRef(uniqueId());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMouseDown = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  return (
    <Tip
      content={label ?? ariaLabel}
      plain
      dropProps={{
        background: "white",
        elevation: "large",
        style: {
          padding: "0.4rem",
          borderRadius: "0.25rem",
        },
      }}
    >
      <DropButton
        aria-label={ariaLabel}
        aria-controls={open ? id.current : undefined}
        aria-haspopup
        aria-expanded={open ? "true" : undefined}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        size="small"
        dropContent={children}
        icon={<Down {...iconProps} />}
      />
    </Tip>
  );
}

export function ToggleHeadingMenuItem(props) {
  const { attrs, ...rest } = props;
  const { toggleHeading } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleHeading.enabled(attrs)) {
      toggleHeading(attrs);
    }
  }, [toggleHeading, attrs]);

  const active = useActive().heading(attrs);
  const enabled = toggleHeading.enabled(attrs);

  return (
    <CommandMenuItem
      {...rest}
      commandName="toggleHeading"
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
}

export function HeadingLevelButtonGroup(props) {
  const { children } = props;

  return (
    <CommandButtonGroup>
      <ToggleHeadingButton attrs={LEVEL_1} />
      <ToggleHeadingButton attrs={LEVEL_2} />
      <ToggleHeadingButton attrs={LEVEL_3} />
      {children}
    </CommandButtonGroup>
  );
}

export function RedoButton(props) {
  const { redo } = useCommands();
  const { redoDepth } = useHelpers(true);

  const handleSelect = useCallback(() => {
    if (redo.enabled()) {
      redo();
    }
  }, [redo]);

  const enabled = redoDepth() > 0;

  return (
    <CommandButton
      {...props}
      commandName="redo"
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
      label="Refazer"
    />
  );
}

export function UndoButton(props) {
  const { undo } = useCommands();
  const { undoDepth } = useHelpers(true);

  const handleSelect = useCallback(() => {
    if (undo.enabled()) {
      undo();
    }
  }, [undo]);

  const enabled = undoDepth() > 0;

  return (
    <CommandButton
      {...props}
      commandName="undo"
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
      label="Desfazer"
    />
  );
}

export function HistoryButtonGroup(props) {
  const { children } = props;

  return (
    <CommandButtonGroup>
      <UndoButton />
      <RedoButton />
      {children}
    </CommandButtonGroup>
  );
}

export function CommandButtonGroup(props) {
  const { children } = props;

  return (
    <Box
      direction="row"
      style={{
        alignItems: "center",
        width: "fit-content",
      }}
    >
      {children}
    </Box>
  );
}
