import React, { memo, useState } from "react";

import "@remirror/styles/all.css";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
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
  const { manager, save, defaultValue } = props;
  const [html, setHtml] = useState();

  return (
    <Remirror
      manager={manager}
      onChange={({ helpers, state }) => {
        const html = helpers.getHTML(state);
        setHtml(html);
      }}
      autoRender="end"
      placeholder="Eu tive um sonho..."
      initialContent={defaultValue}
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
      <SyncManagerHook html={html} save={save} />
    </Remirror>
  );
}

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new BoldExtension(),
  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension(),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new MarkdownExtension({ copyAsMarkdown: false }),
];

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
function Editor(props) {
  const { defaultValue, save } = props;

  const { manager } = useRemirror({
    extensions,
  });

  return (
    <ThemeProvider>
      <MarkdownTextEditor
        manager={manager}
        save={save}
        defaultValue={defaultValue}
      />
    </ThemeProvider>
  );
}

export default memo(Editor);
