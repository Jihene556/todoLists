export interface IItem {
  id : string;
  description: string;
  state : 'PENDING' | 'IN-PROGRESS' | 'DONE';
}

export interface ITodoList {
  id: string;
  description: string;
  items: IItem[]
}

