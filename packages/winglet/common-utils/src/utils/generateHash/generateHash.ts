import { Murmur3 } from '../../libs/murmur3';

export const generateHash = (serialized: string) =>
  new Murmur3(serialized).result();
