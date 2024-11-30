import { Murmur3 } from './murmur3';

export const generateHash = (serialized: string) =>
  new Murmur3(serialized).result();
