export class HttpLinkParser {
  static parse(
    headerValue: string
  ): Map<string, string> {
    const result = new Map<string, string>();

    for (const part of headerValue.split(", ")) {
      const urlMatch = part.match(/^<([^>]+)>/);
      const relMatch = part.match(/rel="([^"]+)"/);
      if (urlMatch && relMatch) {
        result.set(relMatch[1], urlMatch[1]);
      }
    }

    return result;
  }
}
