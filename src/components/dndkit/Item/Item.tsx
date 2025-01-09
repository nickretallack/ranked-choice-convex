import React, { useEffect } from "react";
import classNames from "classnames";
import type {
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import styles from "./Item.module.css";

export type RenderItem = (args: {
  dragOverlay: boolean;
  dragging: boolean;
  sorting: boolean;
  index: number | undefined;
  fadeIn: boolean;
  listeners: DraggableSyntheticListeners;
  ref: React.Ref<HTMLElement>;
  style: React.CSSProperties | undefined;
  transform: Props["transform"];
  transition: Props["transition"];
  value: Props["value"];
  classes: Parameters<typeof classNames>;
  handleProps: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  containerId: string;
}) => React.ReactElement;

export interface Props {
  dragOverlay?: boolean;
  dragging?: boolean;
  handleProps?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  value: UniqueIdentifier;
  renderItem: RenderItem;
  containerId: string;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        dragOverlay,
        dragging,
        fadeIn,
        handleProps,
        index,
        listeners,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        containerId,
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      return renderItem({
        dragOverlay: Boolean(dragOverlay),
        dragging: Boolean(dragging),
        sorting: Boolean(sorting),
        index,
        fadeIn: Boolean(fadeIn),
        listeners,
        ref,
        style: {
          ...style,
          transition: [transition].filter(Boolean).join(", "),
          ...(transform
            ? {
                "--translate-x": `${Math.round(transform.x)}px`,
                "--translate-y": `${Math.round(transform.y)}px`,
              }
            : undefined),
        },
        classes: [styles.Item, dragging && !dragOverlay && styles.hidden],
        transform,
        transition,
        value,
        handleProps,
        containerId,
      });
    }
  )
);
