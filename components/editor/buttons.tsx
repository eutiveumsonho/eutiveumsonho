import React, { useCallback, useRef, useState, ReactNode } from "react";
import { isString, uniqueId } from "@remirror/core";
import { useCommandOptionValues } from "./use-command-option-values";
import { useCommands, useActive, useHelpers } from "@remirror/react";
import { Box, Button, DropButton, Text } from "grommet";
import Tip from "../tip";
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

interface IconProps {
  color?: string;
  [key: string]: any;
}

interface IconMap {
  [key: string]: (props: IconProps) => JSX.Element;
}

const ICON_MAP: IconMap = {
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

interface CommandButtonProps {
  commandName: string;
  active?: boolean;
  enabled: boolean;
  attrs?: Record<string, any>;
  onSelect: () => void;
  onChange?: (event: React.MouseEvent, value: string) => void;
  displayShortcut?: boolean;
  "aria-label"?: string;
  label?: string;
}

export function CommandButton(props: CommandButtonProps): JSX.Element {
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
    (event: React.MouseEvent, value: string) => {
      onSelect();
      onChange?.(event, value);
    },
    [onSelect, onChange]
  );

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
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
    <Tip content={`${tooltipText}${shortcutText}`}>
      <Button
        aria-label={labelText}
        onMouseDown={handleMouseDown}
        icon={ICON_MAP[fallbackIcon as string]?.({ color: active ? BRAND_HEX : "white" })}
        disabled={!enabled}
        value={commandName}
        onClick={(e) => handleChange(e, commandName)}
        size="small"
        hoverIndicator
        style={{
          backgroundColor: active ? "white" : BRAND_HEX,
        }}
      />
    </Tip>
  );
}

interface EditorButtonProps {
  t: (key: string) => string;
  ready: boolean;
}

export function ToggleBoldButton(props: EditorButtonProps): JSX.Element {
  const { t, ready } = props;
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
      label={ready ? t("thicker") : ""}
    />
  );
}

export function ToggleItalicButton(props: EditorButtonProps): JSX.Element {
  const { toggleItalic } = useCommands();
  const { t, ready } = props;
  
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
      label={ready ? t("italic") : ""}
    />
  );
}

export function ToggleStrikeButton(props: EditorButtonProps): JSX.Element {
  const { toggleStrike } = useCommands();
  const { t, ready } = props;
  
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
      label={ready ? t("strike") : ""}
    />
  );
}

export function ToggleBlockquoteButton(props: EditorButtonProps): JSX.Element {
  const { toggleBlockquote } = useCommands();
  const { t, ready } = props;
  
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
      label={ready ? t("quote") : ""}
    />
  );
}

interface ToggleHeadingButtonProps extends EditorButtonProps {
  attrs: { level: number };
}

export function ToggleHeadingButton(props: ToggleHeadingButtonProps): JSX.Element {
  const { attrs, t, ready, ...rest } = props;
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
      label={`${ready ? t("heading") : ""} ${attrs.level}`}
    />
  );
}

const LEVEL_1 = { level: 1 };
const LEVEL_2 = { level: 2 };
const LEVEL_3 = { level: 3 };

interface DropdownButtonProps {
  label?: string;
  "aria-label"?: string;
  children: ReactNode;
}

export function DropdownButton(props: DropdownButtonProps): JSX.Element {
  const { label, "aria-label": ariaLabel, children } = props;
  const id = useRef(uniqueId());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);
  
  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  
  return (
    <Tip content={label ?? ariaLabel}>
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

interface ButtonGroupProps {
  children?: ReactNode;
  t: (key: string) => string;
  ready: boolean;
}

export function HeadingLevelButtonGroup(props: ButtonGroupProps): JSX.Element {
  const { children, t, ready } = props;
  
  return (
    <CommandButtonGroup>
      <ToggleHeadingButton attrs={LEVEL_1} t={t} ready={ready} />
      <ToggleHeadingButton attrs={LEVEL_2} t={t} ready={ready} />
      <ToggleHeadingButton attrs={LEVEL_3} t={t} ready={ready} />
      {children}
    </CommandButtonGroup>
  );
}

export function RedoButton(props: EditorButtonProps): JSX.Element {
  const { redo } = useCommands();
  const { redoDepth } = useHelpers(true);
  const { t, ready } = props;
  
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
      label={ready ? t("redo") : ""}
    />
  );
}

export function UndoButton(props: EditorButtonProps): JSX.Element {
  const { undo } = useCommands();
  const { undoDepth } = useHelpers(true);
  const { t, ready } = props;
  
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
      label={ready ? t("undo") : ""}
    />
  );
}

export function HistoryButtonGroup(props: ButtonGroupProps): JSX.Element {
  const { children, t, ready } = props;
  
  return (
    <CommandButtonGroup>
      <UndoButton t={t} ready={ready} />
      <RedoButton t={t} ready={ready} />
      {children}
    </CommandButtonGroup>
  );
}

interface CommandButtonGroupProps {
  children?: ReactNode;
}

export function CommandButtonGroup(props: CommandButtonGroupProps): JSX.Element {
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