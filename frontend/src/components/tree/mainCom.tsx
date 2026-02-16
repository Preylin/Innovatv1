import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { TreeNode } from '../../types/tree';
import { useTreeStore } from '../../store/useTreeStore';



/* ---------- TEMPLATE ---------- */

function Template({ id, label }: { id: string; label: string }) {
  const { setNodeRef, listeners, attributes, transform } =
    useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        padding: 12,
        marginBottom: 8,
        border: '1px solid #333',
        background: '#fff',
        cursor: 'grab',
      }}
    >
      {label}
    </div>
  );
}

/* ---------- LEVEL 3 ---------- */

function Level3Item() {
  return (
    <div
      style={{
        marginTop: 6,
        marginLeft: 40,
        padding: 6,
        border: '1px solid #bbb',
        background: '#f1f1f1',
      }}
    >
      Nivel 3
    </div>
  );
}

/* ---------- LEVEL 2 ---------- */

function Level2Item({ node }: { node: TreeNode }) {
  const { setNodeRef, listeners, attributes, transform } =
    useDraggable({ id: node.id });

  const { setNodeRef: dropRef, isOver } =
    useDroppable({ id: node.id });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        dropRef(el);
      }}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        marginTop: 8,
        marginLeft: 20,
        padding: 10,
        border: '1px solid #888',
        background: isOver ? '#e8f5e9' : '#fafafa',
      }}
    >
      Nivel 2

      {node.children.map(child => (
        <Level3Item key={child.id} />
      ))}
    </div>
  );
}

/* ---------- LEVEL 1 ---------- */

function Level1Item({ node }: { node: TreeNode }) {
  const { setNodeRef, listeners, attributes, transform } =
    useDraggable({ id: node.id });

  const { setNodeRef: dropRef, isOver } =
    useDroppable({ id: node.id });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        dropRef(el);
      }}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        marginTop: 10,
        padding: 12,
        border: '1px solid #555',
        background: isOver ? '#e3f2fd' : '#fff',
      }}
    >
      Nivel 1

      {node.children.map(child => (
        <Level2Item key={child.id} node={child} />
      ))}
    </div>
  );
}

/* ---------- WORKSPACE ---------- */

function Workspace({ nodes }: { nodes: TreeNode[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'workspace' });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 300,
        padding: 20,
        border: '2px dashed #666',
        background: isOver ? '#e3f2fd' : '#fafafa',
      }}
    >
      <strong>Workspace</strong>

      {nodes.map(node => (
        <Level1Item key={node.id} node={node} />
      ))}
    </div>
  );
}

/* ---------- APP ---------- */

export default function ExampleKit() {
  const { nodes, addLevel1, addLevel2, addLevel3 } = useTreeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === 'template-l1' && over.id === 'workspace') {
      addLevel1();
    }

    if (active.id === 'template-l2') {
      const parent = nodes.find(n => n.id === over.id);
      if (parent && parent.level === 1) {
        addLevel2(parent.id);
      }
    }

    if (active.id === 'template-l3') {
      for (const l1 of nodes) {
        const l2 = l1.children.find(c => c.id === over.id);
        if (l2 && l2.level === 2) {
          addLevel3(l2.id);
          break;
        }
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={onDragEnd}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 20,
          padding: 20,
        }}
      >
        <aside>
          <h3>Templates</h3>
          <Template id="template-l1" label="Template Nivel 1" />
          <Template id="template-l2" label="Template Nivel 2" />
          <Template id="template-l3" label="Template Nivel 3" />
        </aside>

        
        <Workspace nodes={nodes} />
      </div>
    </DndContext>
  );
}
