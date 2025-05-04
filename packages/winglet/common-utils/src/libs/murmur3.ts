/**
 * Murmur3 - A fast 32-bit hash algorithm optimized for browser environments
 * Implementation based on the MurmurHash3 algorithm by Austin Appleby
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/aappleby/smhasher
 */
export class Murmur3 {
  // Multiplication constants used in K1 mixing
  static readonly #M1 = 0x2d51;
  static readonly #M2 = 0xcc9e0000;
  static readonly #M3 = 0x3593;
  static readonly #M4 = 0x1b87;

  // Constants used in H1 mixing
  static readonly #H1_ADD = 0xe6546b64;
  static readonly #H1_MULTIPLY = 5;

  // Finalization multiplication constants
  static readonly #F1 = 0xca6b;
  static readonly #F2 = 0x85eb;
  static readonly #F3 = 0xae35;
  static readonly #F4 = 0xc2b2;

  // Bit rotation constants
  static readonly #R1 = 15; // For K1 mixing first rotation
  static readonly #R2 = 17; // For K1 mixing second rotation
  static readonly #R3 = 13; // For H1 mixing first rotation
  static readonly #R4 = 19; // For H1 mixing second rotation
  static readonly #R5 = 16; // For finalization first shift
  static readonly #R6 = 13; // For finalization second shift
  static readonly #R7 = 16; // For finalization third shift

  // Bit mask constants
  static readonly #MASK_16 = 0xffff; // Lower 16 bits mask
  static readonly #MASK_16_SHIFT = 0xffff0000; // Upper 16 bits mask
  static readonly #MASK_8 = 0xff; // Lower 8 bits mask
  static readonly #MASK_8_SHIFT = 0xff00; // Upper 8 bits mask (within 16 bits)

  /**
   * Mixes a 32-bit value (k1) according to MurmurHash3 algorithm
   *
   * @param k1 - The 32-bit value to mix
   * @returns The mixed value
   */
  static #mixK1(k1: number): number {
    k1 =
      ((k1 & Murmur3.#MASK_16) * Murmur3.#M1 +
        (((k1 >>> 16) * Murmur3.#M2) & Murmur3.#MASK_16_SHIFT)) >>>
      0;
    k1 = (k1 << Murmur3.#R1) | (k1 >>> Murmur3.#R2);
    k1 =
      ((k1 & Murmur3.#MASK_16) * Murmur3.#M3 +
        (((k1 >>> 16) * Murmur3.#M4) & Murmur3.#MASK_16_SHIFT)) >>>
      0;
    return k1;
  }

  /**
   * Mixes the hash accumulator (h1) with a processed block (k1)
   *
   * @param h1 - Current hash accumulator value
   * @param k1 - Processed block to mix in
   * @returns The updated hash accumulator value
   */
  static #mixH1(h1: number, k1: number): number {
    h1 ^= k1;
    h1 = (h1 << Murmur3.#R3) | (h1 >>> Murmur3.#R4);
    h1 = (h1 * Murmur3.#H1_MULTIPLY + Murmur3.#H1_ADD) >>> 0;
    return h1;
  }

  // Hash state variables
  #h1: number = 0; // Hash accumulator
  #k1: number = 0; // Current block being processed
  #remainder: number = 0; // Number of bytes remaining from previous hash call (0-3)
  #length: number = 0; // Total bytes processed

  /**
   * Creates a new Murmur3 hash instance
   *
   * @param key - Optional initial string to hash
   * @param seed - Optional seed value (default: 0)
   */
  constructor(key?: string, seed: number = 0) {
    this.reset(seed);
    if (key?.length) this.hash(key);
  }

  /**
   * Updates the hash with the given string
   *
   * @param key - String to hash
   * @returns This hash instance (for chaining)
   * @throws TypeError if key is not a string
   */
  public hash(key: string): Murmur3 {
    if (typeof key !== 'string')
      throw new TypeError("Murmur3.hash: 'key' must be a string");

    if (!key) return this;

    let h1 = this.#h1;
    let k1 = this.#k1;
    const length = key.length;
    let index = 0;
    let top: number;

    this.#length += length;

    // Process remaining bytes from previous hash call
    if (this.#remainder > 0) {
      if (this.#remainder >= 1)
        k1 ^=
          length > index
            ? (key.charCodeAt(index++) & Murmur3.#MASK_16) << 8
            : 0;
      if (this.#remainder >= 2)
        k1 ^=
          length > index
            ? (key.charCodeAt(index++) & Murmur3.#MASK_16) << 16
            : 0;
      if (this.#remainder === 3 && length > index) {
        k1 ^= (key.charCodeAt(index) & Murmur3.#MASK_8) << 24;
        k1 ^= (key.charCodeAt(index++) & Murmur3.#MASK_8_SHIFT) >> 8;
      }
    }

    // Calculate new remainder
    this.#remainder = (length + this.#remainder) & 3;

    // Process complete 4-byte chunks
    const fullChunks = (length - (length & 3)) >> 2;
    if (fullChunks > 0) {
      for (let chunk = 0; chunk < fullChunks; chunk++) {
        // Combine 4 characters into one 32-bit number
        k1 =
          (key.charCodeAt(index++) & Murmur3.#MASK_16) |
          ((key.charCodeAt(index++) & Murmur3.#MASK_16) << 8) |
          ((key.charCodeAt(index++) & Murmur3.#MASK_16) << 16);

        top = key.charCodeAt(index++);
        k1 |=
          ((top & Murmur3.#MASK_8) << 24) |
          ((top & Murmur3.#MASK_8_SHIFT) >> 8);

        // Mix the block
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);
      }
    }

    // Process remaining 1-3 bytes (will be finalized in result())
    k1 = 0;
    if (this.#remainder > 0) {
      if (this.#remainder >= 3)
        k1 ^= (key.charCodeAt(index + 2) & Murmur3.#MASK_16) << 16;
      if (this.#remainder >= 2)
        k1 ^= (key.charCodeAt(index + 1) & Murmur3.#MASK_16) << 8;
      k1 ^= key.charCodeAt(index) & Murmur3.#MASK_16;
    }

    // Update hash state
    this.#h1 = h1;
    this.#k1 = k1;
    return this;
  }

  /**
   * Finalizes the hash computation and returns the hash value
   *
   * @returns The 32-bit hash value
   */
  public result(): number {
    let k1 = this.#k1;
    let h1 = this.#h1;

    // Process any remaining bytes
    if (k1 > 0) {
      k1 = Murmur3.#mixK1(k1);
      h1 ^= k1;
    }

    // Finalization
    h1 ^= this.#length;

    // Avalanche bits
    h1 ^= h1 >>> Murmur3.#R5;
    h1 =
      ((h1 & Murmur3.#MASK_16) * Murmur3.#F1 +
        (((h1 >>> 16) * Murmur3.#F2) & Murmur3.#MASK_16_SHIFT)) >>>
      0;
    h1 ^= h1 >>> Murmur3.#R6;
    h1 =
      ((h1 & Murmur3.#MASK_16) * Murmur3.#F3 +
        (((h1 >>> 16) * Murmur3.#F4) & Murmur3.#MASK_16_SHIFT)) >>>
      0;
    h1 ^= h1 >>> Murmur3.#R7;

    // Return unsigned 32-bit integer
    return h1 >>> 0;
  }

  /**
   * Resets the hash state with an optional new seed
   *
   * @param seed - New seed value (default: 0)
   * @returns This hash instance (for chaining)
   * @throws TypeError if seed is not a number
   */
  public reset(seed: number = 0): Murmur3 {
    if (typeof seed !== 'number')
      throw new TypeError("Murmur3.reset: 'seed' must be a number");

    this.#h1 = seed >>> 0;
    this.#k1 = 0;
    this.#remainder = 0;
    this.#length = 0;
    return this;
  }
}
