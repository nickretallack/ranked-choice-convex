import classNames from "classnames";
import React, { forwardRef } from "react";

import styles from "./Container.module.css";

export interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  unstyled?: boolean;
  onClick?: () => void;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  ({ children, onClick, style, unstyled, ...props }: Props, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        style={
          {
            ...style,
          } as React.CSSProperties
        }
        className={classNames(styles.Container, unstyled && styles.unstyled)}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </div>
    );
  },
);
