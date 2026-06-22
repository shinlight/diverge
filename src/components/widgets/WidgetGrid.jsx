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
import { useI18n } from "../../lib/i18n/LanguageContext";

export default function WidgetGrid({
  order,
  titles = {},
  pinnedSet,
  canPin = true,
  onReorder,
  onRemove,
  onRename,
  onTogglePin,
  onAdd,
}) {
  const { t } = useI18n();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id);
      const newIndex = order.indexOf(over.id);
      onReorder(arrayMove(order, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {order.map((id) => {
              const pinned = pinnedSet?.has(id) ?? false;
              return (
                <motion.div
                  key={id}
                  layout
                  className="aspect-square"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <WidgetCard
                    id={id}
                    titleOverride={titles[id]}
                    pinned={pinned}
                    pinDisabled={!pinned && !canPin}
                    onRemove={onRemove}
                    onRename={onRename}
                    onTogglePin={onTogglePin}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          <motion.button
            layout
            onClick={onAdd}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex aspect-square flex-col items-center justify-center gap-2
              rounded-2xl border border-dashed border-line text-muted
              transition-colors hover:border-accent hover:text-content"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">{t("dashboard.addWidget")}</span>
          </motion.button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
