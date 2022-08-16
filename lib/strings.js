export function stripHtml(html) {
  let doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Will be useful soon
export function truncate(targetString, indexToTruncate, useWordBoundary) {
  if (
    (targetString && targetString.length <= indexToTruncate) ||
    !targetString
  ) {
    return targetString;
  }

  const subString = targetString.substr(0, indexToTruncate - 1);

  return (
    (useWordBoundary
      ? subString.substr(0, subString.lastIndexOf(" "))
      : subString) + "&hellip;"
  );
}
