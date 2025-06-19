export type ClassObject = {
  [key: string]: ClassValue;
};

export type ClassArray = Array<ClassValue>;

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassArray
  | ClassObject;
