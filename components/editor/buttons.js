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
  size: "small",
};

const ICON_MAP = {
  bold: (props) => <Bold {...iconProps} {...props} />,
  italic: (props) => <Italic {...iconProps} {...props} />,
  strikethrough: (props) => <StrikeThrough {...iconProps} {...props} />,
  doubleQuotesL: (props) => <BlockQuote {...iconProps} {...props} />,
  h1: (props) => (
    <Text size="xsmall" color="white" {...props}>
      H1
    </Text>
  ),
  h2: (props) => (
    <Text size="xsmall" color="white" {...props}>
      H2
    </Text>
  ),
  h3: (props) => (
    <Text size="xsmall" color="white" {...props}>
      H3
    </Text>
  ),
  arrowGoBackFill: (props) => <Undo {...iconProps} {...props} />,
  arrowGoForwardFill: (props) => <Redo {...iconProps} {...props} />,
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
      label="Traços mais grossos"
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
      label="Itálico"
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
      label="Riscar"
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
      label="Bloco de citação"
    />
  );
};

export const ToggleHeadingButton = ({ attrs, ...rest }) => {
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
};

const LEVEL_1 = { level: 1 };
const LEVEL_2 = { level: 2 };
const LEVEL_3 = { level: 3 };
const LEVEL_4 = { level: 4 };
const LEVEL_5 = { level: 5 };
const LEVEL_6 = { level: 6 };

export const DropdownButton = ({
  label,
  "aria-label": ariaLabel,
  icon,
  children,
  onClose,
}) => {
  const id = useRef(uniqueId());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(
    (e, reason) => {
      setAnchorEl(null);
      onClose?.(e, reason);
    },
    [onClose]
  );

  return (
    <>
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
    </>
  );
};

export const ToggleHeadingMenuItem = ({ attrs, ...rest }) => {
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
};

export const HeadingLevelButtonGroup = ({ showAll = false, children }) => {
  return (
    <CommandButtonGroup>
      <ToggleHeadingButton attrs={LEVEL_1} />
      <ToggleHeadingButton attrs={LEVEL_2} />
      {!showAll ? (
        <ToggleHeadingButton attrs={LEVEL_3} />
      ) : (
        <DropdownButton aria-label="Mais opções de cabeçalho">
          <ToggleHeadingMenuItem attrs={LEVEL_3} />
          <ToggleHeadingMenuItem attrs={LEVEL_4} />
          <ToggleHeadingMenuItem attrs={LEVEL_5} />
          <ToggleHeadingMenuItem attrs={LEVEL_6} />
        </DropdownButton>
      )}
      {children}
    </CommandButtonGroup>
  );
};

export const RedoButton = (props) => {
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
};

export const UndoButton = (props) => {
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
};

export const HistoryButtonGroup = ({ children }) => {
  return (
    <CommandButtonGroup>
      <UndoButton />
      <RedoButton />
      {children}
    </CommandButtonGroup>
  );
};

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
