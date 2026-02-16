import { create } from 'zustand';
import type { TreeNode } from '../types/tree';

interface TreeState {
  nodes: TreeNode[];

  addLevel1: () => void;
  addLevel2: (parentId: string) => void;
  addLevel3: (parentId: string) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  nodes: [],

  addLevel1: () =>
    set(state => ({
      nodes: [
        ...state.nodes,
        {
          id: crypto.randomUUID(),
          level: 1,
          children: [],
        },
      ],
    })),

  addLevel2: (parentId) =>
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === parentId
          ? {
              ...node,
              children: [
                ...node.children,
                {
                  id: crypto.randomUUID(),
                  level: 2,
                  children: [],
                },
              ],
            }
          : node
      ),
    })),

  addLevel3: (parentId) =>
    set(state => ({
      nodes: state.nodes.map(node => ({
        ...node,
        children: node.children.map(child =>
          child.id === parentId
            ? {
                ...child,
                children: [
                  ...child.children,
                  {
                    id: crypto.randomUUID(),
                    level: 3,
                    children: [],
                  },
                ],
              }
            : child
        ),
      })),
    })),
}));
