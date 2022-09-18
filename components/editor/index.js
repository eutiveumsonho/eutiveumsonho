import React from "react";

import "@remirror/styles/all.css";
import md from "refractor/lang/markdown.js";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
  TrailingNodeExtension,
} from "remirror/extensions";
import { Remirror, ThemeProvider, useRemirror, Toolbar } from "@remirror/react";
import { BRAND_HEX } from "../../lib/config";
import {
  ToggleBoldButton,
  ToggleItalicButton,
  ToggleStrikeButton,
  ToggleBlockquoteButton,
  HeadingLevelButtonGroup,
  HistoryButtonGroup,
  CommandButtonGroup,
} from "./buttons";
import { css } from "@emotion/css";
import SyncManagerHook from "./sync-manager-hook";

function MarkdownToolbar() {
  return (
    <Toolbar
      style={{
        width: "100vw",
        backgroundColor: BRAND_HEX,
        padding: "1rem",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <CommandButtonGroup>
        <ToggleBoldButton />
        <ToggleItalicButton />
        <ToggleStrikeButton />
      </CommandButtonGroup>
      <HeadingLevelButtonGroup />
      <CommandButtonGroup>
        <ToggleBlockquoteButton />
      </CommandButtonGroup>
      <HistoryButtonGroup />
    </Toolbar>
  );
}

function MarkdownTextEditor(props) {
  const { manager, state, onChange, children } = props;

  return (
    <Remirror
      manager={manager}
      state={state}
      autoRender="end"
      onChange={onChange}
      placeholder="Eu tive um sonho..."
      classNames={[
        css`
          &.ProseMirror {
            box-shadow: none !important;
            overflow-y: unset !important;
          }
        `,
      ]}
    >
      <MarkdownToolbar />
      {children}
    </Remirror>
  );
}

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new BoldExtension(),
  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension(),
  new LinkExtension(),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new ListItemExtension({
    priority: 10000,
    enableCollapsible: true,
  }),
  new CodeExtension(),
  new CodeBlockExtension({ supportedLanguages: [md] }),
  new TrailingNodeExtension(),
  new MarkdownExtension({ copyAsMarkdown: false }),
  new HardBreakExtension(),
];

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
function Editor(props) {
  const { defaultValue, save } = props;

  const { manager, state, onChange } = useRemirror({
    extensions,
    stringHandler: "html",
    content: defaultValue,
  });

  return (
    <ThemeProvider>
      <MarkdownTextEditor manager={manager} state={state} onChange={onChange}>
        <SyncManagerHook state={state} save={save} />
      </MarkdownTextEditor>
    </ThemeProvider>
  );
}

export default Editor;
