import React, { useEffect } from "react";
import { chatwoot } from "../static/chatwoot";

export default function CustomScripts() {
  useEffect(() => {
    chatwoot(document, "script");
  }, []);

  return <></>;
}
