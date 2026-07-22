import { Link, NavLink, Navigate, useParams, type LinkProps, type NavLinkProps, type NavigateProps } from "react-router-dom";

type LLinkProps = Omit<LinkProps, "to"> & { to: string };
type LNavLinkProps = Omit<NavLinkProps, "to"> & { to: string };
type LNavigateProps = Omit<NavigateProps, "to"> & { to: string };

function useLang() {
  const { lang } = useParams<{ lang?: string }>();
  return lang ?? "en";
}

export function LLink({ to, ...props }: LLinkProps) {
  const lang = useLang();
  return <Link to={`/${lang}${to}`} {...props} />;
}

export function LNavLink({ to, ...props }: LNavLinkProps) {
  const lang = useLang();
  return <NavLink to={`/${lang}${to}`} {...props} />;
}

export function LNavigate({ to, ...props }: LNavigateProps) {
  const lang = useLang();
  return <Navigate to={`/${lang}${to}`} {...props} />;
}
