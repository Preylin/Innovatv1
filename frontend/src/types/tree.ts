export type ItemLevel = 1 | 2 | 3;

export interface TreeNode {
  id: string;
  level: ItemLevel;
  children: TreeNode[];
}