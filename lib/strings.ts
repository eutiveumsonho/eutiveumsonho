export function stripHtml(html: string): string {
  let doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function truncate(
  targetString: string | null | undefined,
  indexToTruncate: number,
  useWordBoundary: boolean
): string {
  if (
    (targetString && targetString.length <= indexToTruncate) ||
    !targetString
  ) {
    return targetString || "";
  }
  const subString = targetString.substr(0, indexToTruncate - 1);
  return (
    (useWordBoundary
      ? subString.substr(0, subString.lastIndexOf(" "))
      : subString) + "&hellip;"
  );
}