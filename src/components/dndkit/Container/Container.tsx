import React, { forwardRef } from "react";
import classNames from "classnames";

import styles from "./Container.module.css";

export interface Props {
  children: React.ReactNode;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  shadow?: boolean;
  unstyled?: boolean;
  onClick?(): void;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      handleProps,
      horizontal,
      hover,
      onClick,
      label,
      style,
      shadow,
      unstyled,
      ...props
    }: Props,
    ref
  ) => {
    return (
      <div
        {...props}
        ref={ref}
        style={
          {
            ...style,
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </div>
    );
  }
);
