import { Murmur3 } from '@/common-utils/libs/murmur3';

export const generateHash = (serialized: string) =>
  new Murmur3(serialized).result();
