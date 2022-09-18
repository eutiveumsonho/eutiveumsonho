import { useRemirrorContext } from "@remirror/react";
import { useEffect, useState } from "react";

const SYNC_DELAY = 3000;

export default function SyncManagerHook(props) {
  const { html, save } = props;

  useEffect(() => {
    const debouncTimer = setTimeout(() => {
      if (!html || html === "<p></p>") {
        return;
      }

      save(html);
    }, SYNC_DELAY);

    return () => clearTimeout(debouncTimer);
  }, [html]);

  return <></>;
}
