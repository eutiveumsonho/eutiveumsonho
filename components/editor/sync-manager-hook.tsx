import { useEffect } from "react";

const SYNC_DELAY = 3000;

interface SyncManagerHookProps {
  html: string;
  save: (html: string) => void;
}

export default function SyncManagerHook(props: SyncManagerHookProps) {
  const { html, save } = props;
  
  useEffect(() => {
    const debouncTimer = setTimeout(() => {
      if (!html || html === "<p></p>") {
        return;
      }
      save(html);
    }, SYNC_DELAY);
    
    return () => clearTimeout(debouncTimer);
  }, [html, save]); // Added save to dependency array as it's used in the effect
  
  return <></>;
}