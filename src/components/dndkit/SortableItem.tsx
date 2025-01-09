import { useEffect, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

import { Item } from "./Item";
import { RenderItem } from "./Item/Item";

interface SortableItemProps {
  id: UniqueIdentifier;
  index: number;
  containerId: string;
  renderItem: RenderItem;
}

export default function SortableItem({
  id,
  index,
  containerId,
  renderItem,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    overIndex,
    activeIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  // Modify the index to account for where it's actually rendering
  let theIndex = index;
  if (activeIndex != -1) {
    if (activeIndex < index && overIndex >= index) theIndex = index - 1;
    if (activeIndex > index && overIndex <= index) theIndex = index + 1;
  }

  return (
    <Item
      ref={setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handleProps={{ ref: setActivatorNodeRef }}
      index={theIndex}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      containerId={containerId}
      renderItem={renderItem}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
