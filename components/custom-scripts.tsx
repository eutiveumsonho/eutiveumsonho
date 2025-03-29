import React, { useEffect } from "react";
import dynamic from "next/dynamic";

export default function CustomScripts(): JSX.Element {
  useEffect(() => {
    dynamic(() => import("../lib/o11y/web-vitals"));
  }, []);
  
  return <></>;
}