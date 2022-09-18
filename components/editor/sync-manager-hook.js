import { useRemirrorContext } from "@remirror/react";
import { useEffect, useState } from "react";

const SYNC_DELAY = 3000;

export default function SyncManagerHook(props) {
  const { state, save } = props;
  const { helpers } = useRemirrorContext();
  const [prevHtml, setPrevHtml] = useState(helpers.getHTML(state));

  useEffect(() => {
    const debouncTimer = setTimeout(() => {
      const html = helpers.getHTML(state);

      if (html === prevHtml || !html || html === "<p></p>") {
        return;
      }

      save(html);
      setPrevHtml(html);
    }, SYNC_DELAY);

    return () => clearTimeout(debouncTimer);
  }, [state]);

  return <></>;
}
