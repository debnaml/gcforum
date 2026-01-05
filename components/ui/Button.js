"use client";

import { forwardRef } from "react";
import { cx } from "../../lib/utils";

const styles = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50",
  secondary:
    "bg-secondary text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50",
  ghost: "text-primary hover:text-primary/80",
};

const sizes = {
  md: "h-11 px-6 text-base",
  sm: "h-9 px-4 text-sm",
};

const Button = forwardRef(function Button(
  { as: Component = "button", variant = "primary", size = "md", className, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-none font-medium transition-colors",
        styles[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Button;
