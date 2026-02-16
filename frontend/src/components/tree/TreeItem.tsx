import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useTreeStore } from '../../store/useTreeStore';
import type { TreeNode } from '../../types/tree';


export function TreeItem({ node }: { node: TreeNode }) {
  const { removeNode, updateLabel } = useTreeStore();

  const {
    setNodeRef: dragRef,
    listeners,
    attributes,
    transform,
  } = useDraggable({
    id: node.id,
    data: { level: node.level, type: 'node' },
  });

  const {
    setNodeRef: dropRef,
    isOver,
  } = useDroppable({
    id: node.id,
    data: { level: node.level, type: 'node' },
  });

  console.log('🔵 TreeItem render', {
    id: node.id,
    level: node.level,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    marginLeft: node.level === 1 ? 0 : 24,
    marginTop: 10,
    padding: 12,
    border: '1px solid #999',
    borderRadius: 8,
    background: isOver ? '#e3f2fd' : '#fff',
    zIndex: transform ? 1000 : 1,
  };

  return (
    <div
      ref={(el) => {
        dragRef(el);
        dropRef(el);
      }}
      style={style}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span
          {...listeners}
          {...attributes}
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          ⠿
        </span>

        <input
          value={node.label}
          onChange={(e) => updateLabel(node.id, e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            background: 'transparent',
          }}
        />

        <button onClick={() => removeNode(node.id)}>✕</button>
      </div>

      {node.children.map((child) => (
        <TreeItem key={child.id} node={child} />
      ))}
    </div>
  );
}
