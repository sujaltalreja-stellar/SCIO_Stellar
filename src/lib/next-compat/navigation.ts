import React from "react";
import { useNavigate, useLocation, useParams, useSearchParams as useRRD广SearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
    pathname: location.pathname,
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  const [searchParams] = useRRD广SearchParams();
  return searchParams;
}

export { useParams };
