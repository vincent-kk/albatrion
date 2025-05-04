/**
 * Murmur3 - A fast 32-bit hash algorithm optimized for browser environments
 * Implementation based on the MurmurHash3 algorithm by Austin Appleby
 * Supports string, ArrayBuffer, and Uint8Array inputs with incremental hashing
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/aappleby/smhasher
 *
 * Note: This is a non-cryptographic hash function.
 * Do not use for security-critical applications.
 */
export class Murmur3 {
  // Common constants definition
  static readonly #BYTES_PER_CHUNK = 4; // Bytes per chunk

  // Additional constants for optimization parameters
  static readonly #CHUNK_UNROLL_SIZE = 4; // Number of chunks to process in one loop unrolling group
  static readonly #DATAVIEW_CHUNK_SIZE = 8; // Number of chunks to process in DataView optimization
  static readonly #DATAVIEW_THRESHOLD = 32; // Minimum size in bytes to use DataView optimization

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

  // Byte position constants
  static readonly #BYTE_POS_8 = 8;
  static readonly #BYTE_POS_16 = 16;
  static readonly #BYTE_POS_24 = 24;

  // Endianness detection static variable
  static readonly #isLittleEndian =
    new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

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
   * @param data - Optional initial data to hash (string, ArrayBuffer, or Uint8Array)
   * @param seed - Optional seed value (default: 0)
   */
  constructor(data?: string | ArrayBuffer | Uint8Array, seed: number = 0) {
    this.reset(seed);
    if (data) this.hash(data);
  }

  /**
   * Updates the hash with the given data
   *
   * @param data - Data to hash (string, ArrayBuffer, or Uint8Array)
   * @returns This hash instance (for chaining)
   * @throws TypeError if data is not a supported type
   */
  public hash(input: string | ArrayBuffer | Uint8Array): Murmur3 {
    if (typeof input === 'string') {
      return this.#processString(input);
    } else if (input instanceof ArrayBuffer) {
      return this.#processBytes(new Uint8Array(input));
    } else if (input instanceof Uint8Array) {
      return this.#processBytes(input);
    } else
      throw new TypeError(
        "Murmur3.hash: 'input' must be a string, ArrayBuffer, or Uint8Array",
      );
  }

  /**
   * Updates the hash with a string
   *
   * @param input - String to hash
   * @returns This hash instance (for chaining)
   * @private
   */
  #processString(input: string): Murmur3 {
    if (!input || input.length === 0) return this;

    // Cache frequently used constants in local variables
    const BYTES_PER_CHUNK = Murmur3.#BYTES_PER_CHUNK;
    const BYTE_POS_8 = Murmur3.#BYTE_POS_8;
    const BYTE_POS_16 = Murmur3.#BYTE_POS_16;
    const BYTE_POS_24 = Murmur3.#BYTE_POS_24;
    const MASK_16 = Murmur3.#MASK_16;
    const MASK_8 = Murmur3.#MASK_8;
    const MASK_8_SHIFT = Murmur3.#MASK_8_SHIFT;
    const CHUNK_UNROLL_SIZE = Murmur3.#CHUNK_UNROLL_SIZE;

    const length = input.length;
    let h1 = this.#h1;
    let k1 = this.#k1;
    let index = 0;
    let top: number;

    this.#length += length;

    // Process remaining bytes from previous hash call
    if (this.#remainder > 0) {
      // Calculate the number of bytes needed to complete a 4-byte block
      const needed = BYTES_PER_CHUNK - this.#remainder;
      const available = Math.min(needed, length);

      // Early return optimization
      if (available <= 0) return this;

      // Use switch statement for branch optimization
      switch (this.#remainder) {
        case 1:
          k1 ^= (input.charCodeAt(index++) & MASK_16) << BYTE_POS_8;
          if (available > 1) {
            k1 ^= (input.charCodeAt(index++) & MASK_16) << BYTE_POS_16;
            if (available > 2) {
              top = input.charCodeAt(index++);
              k1 ^= (top & MASK_8) << BYTE_POS_24;
              k1 ^= (top & MASK_8_SHIFT) >> BYTE_POS_8;
            }
          }
          break;
        case 2:
          k1 ^= (input.charCodeAt(index++) & MASK_16) << BYTE_POS_16;
          if (available > 1) {
            top = input.charCodeAt(index++);
            k1 ^= (top & MASK_8) << BYTE_POS_24;
            k1 ^= (top & MASK_8_SHIFT) >> BYTE_POS_8;
          }
          break;
        case 3:
          top = input.charCodeAt(index++);
          k1 ^= (top & MASK_8) << BYTE_POS_24;
          k1 ^= (top & MASK_8_SHIFT) >> BYTE_POS_8;
          break;
      }

      // Process the completed 4-byte block
      if (this.#remainder + available >= BYTES_PER_CHUNK) {
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);
        k1 = 0;
        this.#remainder = 0;
      } else {
        // Update remainder if a complete block could not be formed
        this.#remainder += available;
        this.#k1 = k1;
        this.#h1 = h1;
        return this;
      }
    }

    // Process the remaining bytes in 4-byte chunks
    const remaining = length - index;
    const fullChunks = Math.floor(remaining / BYTES_PER_CHUNK);

    // Apply loop unrolling optimization - process chunks at a time
    const chunkLimit = fullChunks - (fullChunks % CHUNK_UNROLL_SIZE);
    let chunk = 0;

    // Process chunks at a time (unrolling)
    for (; chunk < chunkLimit; chunk += CHUNK_UNROLL_SIZE) {
      // First chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.#mixK1(k1);
      h1 = Murmur3.#mixH1(h1, k1);

      // Second chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.#mixK1(k1);
      h1 = Murmur3.#mixH1(h1, k1);

      // Third chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.#mixK1(k1);
      h1 = Murmur3.#mixH1(h1, k1);

      // Fourth chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.#mixK1(k1);
      h1 = Murmur3.#mixH1(h1, k1);
    }

    // Process remaining individual chunks
    for (; chunk < fullChunks; chunk++) {
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.#mixK1(k1);
      h1 = Murmur3.#mixH1(h1, k1);
    }

    // Process remaining 1-3 bytes (will be finalized in result())
    this.#remainder = remaining % BYTES_PER_CHUNK;
    k1 = 0;
    if (this.#remainder > 0) {
      // Optimize conditional branches
      const startIdx = length - this.#remainder;
      k1 ^= input.charCodeAt(startIdx) & MASK_16;

      if (this.#remainder > 1) {
        k1 ^= (input.charCodeAt(startIdx + 1) & MASK_16) << BYTE_POS_8;

        if (this.#remainder > 2) {
          k1 ^= (input.charCodeAt(startIdx + 2) & MASK_16) << BYTE_POS_16;
        }
      }
    }

    // Update hash state
    this.#h1 = h1;
    this.#k1 = k1;
    return this;
  }

  /**
   * Updates the hash with binary data
   *
   * @param bytes - Uint8Array to hash
   * @returns This hash instance (for chaining)
   * @private
   */
  #processBytes(bytes: Uint8Array): Murmur3 {
    if (!bytes.length) return this;

    // Cache frequently used constants in local variables
    const BYTES_PER_CHUNK = Murmur3.#BYTES_PER_CHUNK;
    const BYTE_POS_8 = Murmur3.#BYTE_POS_8;
    const BYTE_POS_16 = Murmur3.#BYTE_POS_16;
    const BYTE_POS_24 = Murmur3.#BYTE_POS_24;
    const CHUNK_UNROLL_SIZE = Murmur3.#CHUNK_UNROLL_SIZE;
    const DATAVIEW_CHUNK_SIZE = Murmur3.#DATAVIEW_CHUNK_SIZE;
    const DATAVIEW_THRESHOLD = Murmur3.#DATAVIEW_THRESHOLD;
    const isLittleEndian = Murmur3.#isLittleEndian;

    let h1 = this.#h1;
    let k1 = this.#k1;
    const length = bytes.length;
    let index = 0;

    this.#length += length;

    // Process remaining bytes from previous hash call
    if (this.#remainder > 0) {
      // Calculate the number of bytes needed to complete a 4-byte block
      const needed = BYTES_PER_CHUNK - this.#remainder;
      const available = Math.min(needed, length);

      // Early return optimization
      if (available <= 0) {
        return this;
      }

      // Use switch statement for branch optimization
      switch (this.#remainder) {
        case 1:
          k1 ^= bytes[index++] << BYTE_POS_8;
          if (available > 1) {
            k1 ^= bytes[index++] << BYTE_POS_16;
            if (available > 2) k1 ^= bytes[index++] << BYTE_POS_24;
          }
          break;
        case 2:
          k1 ^= bytes[index++] << BYTE_POS_16;
          if (available > 1) k1 ^= bytes[index++] << BYTE_POS_24;
          break;
        case 3:
          k1 ^= bytes[index++] << BYTE_POS_24;
          break;
      }

      // Process the completed 4-byte block
      if (this.#remainder + available >= BYTES_PER_CHUNK) {
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);
        k1 = 0;
        this.#remainder = 0;
      } else {
        // Update remainder if a complete block could not be formed
        this.#remainder += available;
        this.#k1 = k1;
        this.#h1 = h1;
        return this;
      }
    }

    // Process the remaining bytes in 4-byte chunks
    const remaining = length - index;
    const fullChunks = Math.floor(remaining / BYTES_PER_CHUNK);

    // Apply DataView optimization for aligned and sufficiently large data
    const isAligned =
      index % BYTES_PER_CHUNK === 0 && bytes.byteOffset % BYTES_PER_CHUNK === 0;

    if (isAligned && remaining >= DATAVIEW_THRESHOLD) {
      // Use DataView to read 32-bit integers directly
      const dataView = new DataView(
        bytes.buffer,
        bytes.byteOffset + index,
        remaining,
      );
      const alignedChunks =
        Math.floor(fullChunks / DATAVIEW_CHUNK_SIZE) * DATAVIEW_CHUNK_SIZE; // Process in multiples of 8

      // Apply loop unrolling (process chunks at a time)
      for (let i = 0; i < alignedChunks; i += DATAVIEW_CHUNK_SIZE) {
        // Process chunks (unrolled)
        for (let j = 0; j < DATAVIEW_CHUNK_SIZE; j++) {
          k1 = isLittleEndian
            ? dataView.getUint32((i + j) * BYTES_PER_CHUNK, true)
            : bytes[index + (i + j) * BYTES_PER_CHUNK] |
              (bytes[index + (i + j) * BYTES_PER_CHUNK + 1] << BYTE_POS_8) |
              (bytes[index + (i + j) * BYTES_PER_CHUNK + 2] << BYTE_POS_16) |
              (bytes[index + (i + j) * BYTES_PER_CHUNK + 3] << BYTE_POS_24);

          k1 = Murmur3.#mixK1(k1);
          h1 = Murmur3.#mixH1(h1, k1);
        }
      }

      index += alignedChunks * BYTES_PER_CHUNK;

      // Process remaining chunks (after multiples of DATAVIEW_CHUNK_SIZE)
      for (let i = alignedChunks; i < fullChunks; i++) {
        k1 = isLittleEndian
          ? dataView.getUint32((i - alignedChunks) * BYTES_PER_CHUNK, true)
          : bytes[index] |
            (bytes[index + 1] << BYTE_POS_8) |
            (bytes[index + 2] << BYTE_POS_16) |
            (bytes[index + 3] << BYTE_POS_24);

        index += BYTES_PER_CHUNK;
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);
      }
    } else {
      // Standard chunk processing (for unaligned or small data)
      // Apply loop unrolling (process CHUNK_UNROLL_SIZE chunks at a time)
      const chunkLimit = fullChunks - (fullChunks % CHUNK_UNROLL_SIZE);
      let chunk = 0;

      for (; chunk < chunkLimit; chunk += CHUNK_UNROLL_SIZE) {
        // First chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);

        // Second chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);

        // Third chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);

        // Fourth chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);
      }

      // Process remaining individual chunks
      for (; chunk < fullChunks; chunk++) {
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.#mixK1(k1);
        h1 = Murmur3.#mixH1(h1, k1);
      }
    }

    // Process remaining 1-3 bytes (will be finalized in result())
    this.#remainder = remaining % BYTES_PER_CHUNK;
    k1 = 0;
    if (this.#remainder > 0) {
      // Optimize conditional branches
      const startIdx = length - this.#remainder;
      k1 ^= bytes[startIdx];

      if (this.#remainder > 1) {
        k1 ^= bytes[startIdx + 1] << BYTE_POS_8;

        if (this.#remainder > 2) {
          k1 ^= bytes[startIdx + 2] << BYTE_POS_16;
        }
      }
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
    // Create copies of state variables (preserving original state)
    let k1 = this.#k1;
    let h1 = this.#h1;

    // Process any remaining bytes
    if (k1 > 0) {
      k1 = Murmur3.#mixK1(k1);
      h1 ^= k1;
    }

    // Finalization
    h1 ^= this.#length;

    // Avalanche bits (constant caching)
    const MASK_16 = Murmur3.#MASK_16;
    const MASK_16_SHIFT = Murmur3.#MASK_16_SHIFT;
    const R5 = Murmur3.#R5;
    const R6 = Murmur3.#R6;
    const R7 = Murmur3.#R7;
    const F1 = Murmur3.#F1;
    const F2 = Murmur3.#F2;
    const F3 = Murmur3.#F3;
    const F4 = Murmur3.#F4;

    h1 ^= h1 >>> R5;
    h1 = ((h1 & MASK_16) * F1 + (((h1 >>> 16) * F2) & MASK_16_SHIFT)) >>> 0;
    h1 ^= h1 >>> R6;
    h1 = ((h1 & MASK_16) * F3 + (((h1 >>> 16) * F4) & MASK_16_SHIFT)) >>> 0;
    h1 ^= h1 >>> R7;

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

  /**
   * Convenience static method to compute a hash in one call
   *
   * @param data - Data to hash (string, ArrayBuffer, or Uint8Array)
   * @param seed - Optional seed value (default: 0)
   * @returns The 32-bit hash value
   */
  public static hash(
    data: string | ArrayBuffer | Uint8Array,
    seed: number = 0,
  ): number {
    return new Murmur3(data, seed).result();
  }
}
