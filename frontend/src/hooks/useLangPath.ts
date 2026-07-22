import { useNavigate, useParams, type NavigateOptions } from "react-router-dom";

export function useLangPath() {
  const { lang } = useParams<{ lang?: string }>();
  const l = lang ?? "en";
  return (path: string) => `/${l}${path.startsWith("/") ? path : `/${path}`}`;
}

export function useLangNavigate() {
  const navigate = useNavigate();
  const lp = useLangPath();
  return (path: string, options?: NavigateOptions) => navigate(lp(path), options);
}
