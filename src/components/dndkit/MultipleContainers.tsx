import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  Modifiers,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import DroppableContainer from "./DroppableContainer";
import { Item } from "./Item";
import SortableItem from "./SortableItem";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0",
      },
    },
  }),
};

import { RenderItem } from "./Item/Item";

type ContainerViews = { [containerId: string]: React.ReactNode };
export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface Props {
  items: Items;
  setItems: Dispatch<SetStateAction<Items>>;
  renderItem: RenderItem;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  itemsChanged?: (containerId: UniqueIdentifier, items: Items) => void;
  children: (args: { containerViews: ContainerViews }) => React.ReactNode;
  containerFallbacks?: Record<UniqueIdentifier, React.ReactNode>;
}

export function MultipleContainers({
  items,
  setItems,
  renderItem,
  itemsChanged,
  children,
  containerFallbacks,
}: Props) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const [theOverId, setTheOverId] = useState<UniqueIdentifier | null>(null);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items,
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id),
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items],
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  // const getIndex = (id: UniqueIdentifier) => {
  //   const container = findContainer(id);

  //   if (!container) {
  //     return -1;
  //   }

  //   const index = items[container].indexOf(id);

  //   return index;
  // };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  function makeContainer(containerId: string) {
    const fallback = containerFallbacks?.[containerId];
    const theItems = items[containerId];
    return (
      <DroppableContainer key={containerId} id={containerId} items={theItems}>
        <SortableContext
          items={theItems}
          strategy={verticalListSortingStrategy}
        >
          {theItems.map((value, index) => {
            return (
              <SortableItem
                key={value}
                id={value}
                index={index}
                containerId={containerId}
                renderItem={renderItem}
              />
            );
          })}
          {theItems.length === 0 && fallback}
        </SortableContext>
      </DroppableContainer>
    );
  }

  const containerViews: ContainerViews = {};
  for (const containerId in items) {
    containerViews[containerId] = makeContainer(containerId);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        if (overId == null || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (overContainer) {
          const overIndex = items[overContainer].indexOf(overId);
          setTheOverId(overIndex);
        }

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = overItems.indexOf(overId);
            const activeIndex = activeItems.indexOf(active.id);

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top >
                  over.rect.top + over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (item) => item !== active.id,
              ),
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(
                  newIndex,
                  items[overContainer].length,
                ),
              ],
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            setItems((items) => {
              const newItems = {
                ...items,
                [overContainer]: arrayMove(
                  items[overContainer],
                  activeIndex,
                  overIndex,
                ),
              };
              itemsChanged?.(overContainer, newItems);
              return newItems;
            });
          } else {
            itemsChanged?.(overContainer, items);
          }
        }

        setActiveId(null);
      }}
      onDragCancel={onDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      {children({ containerViews })}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? renderSortableItemDragOverlay(activeId) : null}
      </DragOverlay>
    </DndContext>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return (
      <Item
        value={id}
        index={Number(theOverId)}
        containerId={findContainer(id) as string}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }
}
