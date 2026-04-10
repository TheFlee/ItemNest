export function getApiOrigin(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
  return baseUrl.replace("/api", "");
}

export function buildFileUrl(relativePath: string): string {
  if (!relativePath) {
    return "";
  }

  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  return `${getApiOrigin()}${relativePath}`;
}