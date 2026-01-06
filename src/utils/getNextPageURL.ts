// Import Third-party Dependencies
import linkHeader from "http-link-header";

export function getNextPageURL(
  linkValue: string | null
): string | null {
  if (linkValue === null) {
    return null;
  }

  const { refs } = linkHeader.parse(linkValue);

  return refs.find(
    (row) => row.rel === "next" || row.rel === "last"
  )?.uri ?? null;
}
