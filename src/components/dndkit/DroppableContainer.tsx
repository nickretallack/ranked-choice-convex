import React from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  useSortable,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Container, ContainerProps } from "./Container";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function DroppableContainer({
  children,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    >
      {children}
    </Container>
  );
}
