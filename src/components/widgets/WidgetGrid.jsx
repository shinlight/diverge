import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import WidgetCard from "./WidgetCard";

export default function WidgetGrid({
  layout,
  titles = {},
  onReorder,
  onRemove,
  onRename,
  onAdd,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layout.indexOf(active.id);
      const newIndex = layout.indexOf(over.id);
      onReorder(arrayMove(layout, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={layout} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {layout.map((id) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              >
                <WidgetCard
                  id={id}
                  titleOverride={titles[id]}
                  onRemove={onRemove}
                  onRename={onRename}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            layout
            onClick={onAdd}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2
              rounded-2xl border border-dashed border-line text-muted
              transition-colors hover:border-accent hover:text-content"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">Aggiungi widget</span>
          </motion.button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
