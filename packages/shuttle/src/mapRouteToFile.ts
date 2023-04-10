export function mapRouteToFile(
  baseUrl: string,
  method: string,
  extension: string,
  handlerFiles: string[]
) {
  for (let path of handlerFiles) {
    const fullPathRegex = new RegExp(
      path.replace(/.(t|j)s$/, "").replace(/\[[a-z0-9]+\]/, "([a-z0-9]+)")
    );
    const matches = fullPathRegex.exec(
      `src/routes${baseUrl}/${method}${extension}`
    );
    if (matches) {
      const paramsWithValues: Record<string, string> = {};
      for (let i = 1; i < matches.length; i++) {
        const key = path.match(/\[([a-z0-9]+)\]/g)[i - 1].slice(1, -1);
        paramsWithValues[key] = matches[i];
      }
      return { path, params: { ...paramsWithValues } };
    }
  }
  return null;
}
