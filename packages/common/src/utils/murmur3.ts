/**
 * @description Murmur3 32-bit Hash Algorithm by JavaScript
 * @see https://en.wikipedia.org/wiki/MurmurHash
 */
export class Murmur3 {
  #h1: number = 0;
  #rem: number = 0;
  #k1: number = 0;
  #len: number = 0;

  constructor(key?: string, seed?: number) {
    this.reset(seed);
    if (typeof key === 'string' && key.length > 0) {
      this.hash(key);
    }
  }

  public hash(key: string): Murmur3 {
    let h1 = this.#h1;
    let k1 = this.#k1;
    let i = 0;
    let len = key.length;
    let top;

    this.#len += len;
    switch (this.#rem) {
      // @ts-expect-error Intentional fallthrough
      case 0:
        k1 ^= len > i ? key.charCodeAt(i++) & 0xffff : 0;
      // @ts-expect-error Intentional fallthrough
      case 1:
        k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 8 : 0;
      // @ts-expect-error Intentional fallthrough
      case 2:
        k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 16 : 0;
      case 3:
        if (len > i) {
          k1 ^= (key.charCodeAt(i) & 0xff) << 24;
          k1 ^= (key.charCodeAt(i++) & 0xff00) >> 8;
        }
    }

    this.#rem = (len + this.#rem) & 3;
    len -= this.#rem;

    if (len > 0) {
      while (true) {
        k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff;

        if (i >= len) {
          break;
        }

        k1 =
          (key.charCodeAt(i++) & 0xffff) ^
          ((key.charCodeAt(i++) & 0xffff) << 8) ^
          ((key.charCodeAt(i++) & 0xffff) << 16);
        top = key.charCodeAt(i++);
        k1 ^= ((top & 0xff) << 24) ^ ((top & 0xff00) >> 8);
      }

      k1 = 0;

      switch (this.#rem) {
        // @ts-expect-error Intentional fallthrough
        case 3:
          k1 ^= (key.charCodeAt(i + 2) & 0xffff) << 16;
        // @ts-expect-error Intentional fallthrough
        case 2:
          k1 ^= (key.charCodeAt(i + 1) & 0xffff) << 8;
        case 1:
          k1 ^= key.charCodeAt(i) & 0xffff;
      }
    }

    this.#h1 = h1;
    this.#k1 = k1;
    return this;
  }

  public result(): number {
    let k1 = this.#k1;
    let h1 = this.#h1;

    if (k1 > 0) {
      k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;
      h1 ^= k1;
    }

    h1 ^= this.#len;
    h1 ^= h1 >>> 16;
    h1 = (h1 * 0xca6b + (h1 & 0xffff) * 0x85eb0000) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = (h1 * 0xae35 + (h1 & 0xffff) * 0xc2b20000) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  public reset(seed?: number): Murmur3 {
    this.#h1 = typeof seed === 'number' ? seed : 0;
    this.#rem = this.#k1 = this.#len = 0;
    return this;
  }
}
