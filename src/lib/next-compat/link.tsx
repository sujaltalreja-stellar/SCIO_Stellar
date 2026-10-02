import React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  children?: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, replace, children, className, onClick, ...rest },
  ref
) {
  // Check if href is an external link or anchor hash
  const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:");
  const isHash = href.startsWith("#");

  if (isExternal || isHash) {
    return (
      <a href={href} className={className} onClick={onClick} ref={ref} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} replace={replace} className={className} onClick={onClick} ref={ref} {...rest}>
      {children}
    </RouterLink>
  );
});

export default Link;
