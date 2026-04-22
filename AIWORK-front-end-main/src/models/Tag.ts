import { ModelBase } from "./ModelBase";

export interface Tag extends ModelBase {
  userId?: string;
  parentId?: string | null;
  name: string;
  type: string;
  color: string;
  priorityWeight: number;
}
