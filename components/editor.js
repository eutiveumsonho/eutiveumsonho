import React, { useState } from "react";

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
import { BRAND_HEX } from "../lib/config";
import {
  ToggleBoldButton,
  ToggleItalicButton,
  ToggleStrikeButton,
  ToggleBlockquoteButton,
  HeadingLevelButtonGroup,
  HistoryButtonGroup,
  CommandButtonGroup,
} from "./editor/buttons";
import { css } from "@emotion/css";

export const MarkdownToolbar = () => {
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
};

const [EditorProvider, useEditor] = createContextState(({ props }) => {
  return {
    ...props,
    setMarkdown: (text) => {
      return props.markdown.getContext()?.setContent({
        type: "doc",
        content: [
          {
            type: "codeBlock",
            attrs: { language: "markdown" },
            content: text ? [{ type: "text", text }] : undefined,
          },
        ],
      });
    },
  };
});

const MarkdownTextEditor = (props) => {
  const { html, setHtml } = props;
  const { markdown } = useEditor();

  return (
    <Remirror
      manager={markdown.manager}
      autoRender="end"
      onChange={({ helpers, state }) => {
        setHtml(helpers.getHTML(state));
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
};

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
  /**
   * `HardBreakExtension` allows us to create a newline inside paragraphs.
   * e.g. in a list item
   */
  new HardBreakExtension(),
];

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
export const Editor = () => {
  const [html, setHtml] = useState("");
  const markdown = useRemirror({
    extensions,
    stringHandler: "html",
    content: "",
  });

  return (
    <EditorProvider markdown={markdown}>
      <ThemeProvider>
        <MarkdownTextEditor setHtml={setHtml} html={html} />
      </ThemeProvider>
    </EditorProvider>
  );
};

export default Editor;
