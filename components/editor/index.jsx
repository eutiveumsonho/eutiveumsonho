import React, { memo, useState } from "react";

import "@remirror/styles/all.css";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  TableExtension,
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
import { ExtensionPriority } from "remirror";
import { CommandsExtension } from "@remirror/core";
import { Box } from "grommet";
import { useTranslation } from "next-i18next";

const extensions = (placeholder) => [
  new CommandsExtension(),
  new PlaceholderExtension({ placeholder }),
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
    priority: ExtensionPriority.High,
    enableCollapsible: true,
  }),
  new CodeExtension(),
  new TrailingNodeExtension(),
  new TableExtension(),
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
function Editor(props) {
  const { defaultValue, save, color } = props;
  const { t, ready } = useTranslation("editor");

  const { manager } = useRemirror({
    extensions: extensions(ready ? t("i-had-a-dream") : ""),
    stringHandler: "html",
  });

  return (
    <>
      <ThemeProvider>
        <MarkdownTextEditor
          manager={manager}
          save={save}
          defaultValue={defaultValue}
          t={t}
          ready={ready}
          color={color}
        />
      </ThemeProvider>
    </>
  );
}

function MarkdownToolbar(props) {
  const { t, ready, color } = props;

  return (
    <Toolbar
      style={{
        width: "100vw",
        backgroundColor: color ? color : BRAND_HEX,
        padding: "1rem",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <CommandButtonGroup>
        <ToggleBoldButton t={t} ready={ready} />
        <ToggleItalicButton t={t} ready={ready} />
        <ToggleStrikeButton t={t} ready={ready} />
      </CommandButtonGroup>
      <HeadingLevelButtonGroup t={t} ready={ready} />
      <CommandButtonGroup>
        <ToggleBlockquoteButton t={t} ready={ready} />
      </CommandButtonGroup>
      <HistoryButtonGroup t={t} ready={ready} />
    </Toolbar>
  );
}

function MarkdownTextEditor(props) {
  const { manager, save, defaultValue, t, ready, color } = props;
  const [html, setHtml] = useState();

  return (
    <>
      <Remirror
        attributes={{ spellcheck: "false" }}
        manager={manager}
        onChange={({ helpers, state }) => {
          const html = helpers.getHTML(state);
          setHtml(html);
        }}
        autoRender="end"
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
        <MarkdownToolbar t={t} ready={ready} color={color} />
        <SyncManagerHook html={html} save={save} />
      </Remirror>
      <Box
        style={{
          position: "absolute",
          height: "22rem",
          width: "100vw",
        }}
      />
    </>
  );
}

export default memo(Editor);
