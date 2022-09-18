import React from "react";

import "@remirror/styles/all.css";
import md from "refractor/lang/markdown.js";
import { createContextState } from "create-context-state";
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

const [EditorProvider, useEditor] = createContextState(({ props }) => {
  return {
    ...props,
  };
});

function MarkdownTextEditor(props) {
  const { onChange } = props;

  const { manager, state, setState } = useEditor();

  return (
    <Remirror
      manager={manager}
      state={state}
      autoRender="end"
      onChange={({ state, helpers }) => {
        setState(state);
        onChange(helpers.getHTML(state));
      }}
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
  const { onChange, defaultValue } = props;

  const { manager, state, setState } = useRemirror({
    extensions,
    stringHandler: "html",
    content: defaultValue,
  });

  return (
    <EditorProvider manager={manager} state={state} setState={setState}>
      <ThemeProvider>
        <MarkdownTextEditor onChange={onChange} />
      </ThemeProvider>
    </EditorProvider>
  );
}

export default Editor;
