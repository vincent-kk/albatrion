/**
 * [Murmur3](https://en.wikipedia.org/wiki/MurmurHash) - A fast 32-bit hash algorithm optimized for browser environments
 * Implementation based on the MurmurHash3 algorithm by Austin Appleby
 * Supports string, ArrayBuffer, and Uint8Array inputs with incremental hashing
 *
 * @see https://github.com/aappleby/smhasher
 *
 * NOTE: This is a non-cryptographic hash function.
 * Do not use for security-critical applications.
 */
export class Murmur3 {
  // Common constants definition
  private static readonly __BYTES_PER_CHUNK__ = 4; // Bytes per chunk

  // Additional constants for optimization parameters
  private static readonly __CHUNK_UNROLL_SIZE__ = 4; // Number of chunks to process in one loop unrolling group
  private static readonly __DATAVIEW_CHUNK_SIZE__ = 8; // Number of chunks to process in DataView optimization
  private static readonly __DATAVIEW_THRESHOLD__ = 32; // Minimum size in bytes to use DataView optimization

  // Multiplication constants used in K1 mixing
  private static readonly __M1__ = 0x2d51;
  private static readonly __M2__ = 0xcc9e0000;
  private static readonly __M3__ = 0x3593;
  private static readonly __M4__ = 0x1b87;

  // Constants used in H1 mixing
  private static readonly __H1_ADD__ = 0xe6546b64;
  private static readonly __H1_MULTIPLY__ = 5;

  // Finalization multiplication constants
  private static readonly __F1__ = 0xca6b;
  private static readonly __F2__ = 0x85eb;
  private static readonly __F3__ = 0xae35;
  private static readonly __F4__ = 0xc2b2;

  // Bit rotation constants
  private static readonly __R1__ = 15; // For K1 mixing first rotation
  private static readonly __R2__ = 17; // For K1 mixing second rotation
  private static readonly __R3__ = 13; // For H1 mixing first rotation
  private static readonly __R4__ = 19; // For H1 mixing second rotation
  private static readonly __R5__ = 16; // For finalization first shift
  private static readonly __R6__ = 13; // For finalization second shift
  private static readonly __R7__ = 16; // For finalization third shift

  // Bit mask constants
  private static readonly __MASK_16__ = 0xffff; // Lower 16 bits mask
  private static readonly __MASK_16_SHIFT__ = 0xffff0000; // Upper 16 bits mask
  private static readonly __MASK_8__ = 0xff; // Lower 8 bits mask
  private static readonly __MASK_8_SHIFT__ = 0xff00; // Upper 8 bits mask (within 16 bits)

  // Byte position constants
  private static readonly __BYTE_POS_8__ = 8;
  private static readonly __BYTE_POS_16__ = 16;
  private static readonly __BYTE_POS_24__ = 24;

  // Endianness detection static variable
  private static readonly __isLittleEndian__ =
    new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

  /**
   * Mixes a 32-bit value (k1) according to MurmurHash3 algorithm
   *
   * @param k1 - The 32-bit value to mix
   * @returns The mixed value
   */
  private static __mixK1__(k1: number): number {
    k1 =
      ((k1 & Murmur3.__MASK_16__) * Murmur3.__M1__ +
        (((k1 >>> 16) * Murmur3.__M2__) & Murmur3.__MASK_16_SHIFT__)) >>>
      0;
    k1 = (k1 << Murmur3.__R1__) | (k1 >>> Murmur3.__R2__);
    k1 =
      ((k1 & Murmur3.__MASK_16__) * Murmur3.__M3__ +
        (((k1 >>> 16) * Murmur3.__M4__) & Murmur3.__MASK_16_SHIFT__)) >>>
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
  private static __mixH1__(h1: number, k1: number): number {
    h1 ^= k1;
    h1 = (h1 << Murmur3.__R3__) | (h1 >>> Murmur3.__R4__);
    h1 = (h1 * Murmur3.__H1_MULTIPLY__ + Murmur3.__H1_ADD__) >>> 0;
    return h1;
  }

  // Hash state variables
  private __h1__: number = 0; // Hash accumulator
  private __k1__: number = 0; // Current block being processed
  private __remainder__: number = 0; // Number of bytes remaining from previous hash call (0-3)
  private __length__: number = 0; // Total bytes processed

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
      return this.__processString__(input);
    } else if (input instanceof ArrayBuffer) {
      return this.__processBytes__(new Uint8Array(input));
    } else if (input instanceof Uint8Array) {
      return this.__processBytes__(input);
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
  private __processString__(input: string): Murmur3 {
    if (!input || input.length === 0) return this;

    // Cache frequently used constants in local variables
    const BYTES_PER_CHUNK = Murmur3.__BYTES_PER_CHUNK__;
    const BYTE_POS_8 = Murmur3.__BYTE_POS_8__;
    const BYTE_POS_16 = Murmur3.__BYTE_POS_16__;
    const BYTE_POS_24 = Murmur3.__BYTE_POS_24__;
    const MASK_16 = Murmur3.__MASK_16__;
    const MASK_8 = Murmur3.__MASK_8__;
    const MASK_8_SHIFT = Murmur3.__MASK_8_SHIFT__;
    const CHUNK_UNROLL_SIZE = Murmur3.__CHUNK_UNROLL_SIZE__;

    const length = input.length;
    let h1 = this.__h1__;
    let k1 = this.__k1__;
    let index = 0;
    let top: number;

    this.__length__ += length;

    // Process remaining bytes from previous hash call
    if (this.__remainder__ > 0) {
      // Calculate the number of bytes needed to complete a 4-byte block
      const needed = BYTES_PER_CHUNK - this.__remainder__;
      const available = Math.min(needed, length);

      // Early return optimization
      if (available <= 0) return this;

      // Use switch statement for branch optimization
      switch (this.__remainder__) {
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
      if (this.__remainder__ + available >= BYTES_PER_CHUNK) {
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);
        k1 = 0;
        this.__remainder__ = 0;
      } else {
        // Update remainder if a complete block could not be formed
        this.__remainder__ += available;
        this.__k1__ = k1;
        this.__h1__ = h1;
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
      k1 = Murmur3.__mixK1__(k1);
      h1 = Murmur3.__mixH1__(h1, k1);

      // Second chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.__mixK1__(k1);
      h1 = Murmur3.__mixH1__(h1, k1);

      // Third chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.__mixK1__(k1);
      h1 = Murmur3.__mixH1__(h1, k1);

      // Fourth chunk
      k1 =
        (input.charCodeAt(index) & MASK_16) |
        ((input.charCodeAt(index + 1) & MASK_16) << BYTE_POS_8) |
        ((input.charCodeAt(index + 2) & MASK_16) << BYTE_POS_16);
      top = input.charCodeAt(index + 3);
      k1 |=
        ((top & MASK_8) << BYTE_POS_24) | ((top & MASK_8_SHIFT) >> BYTE_POS_8);
      index += BYTES_PER_CHUNK;
      k1 = Murmur3.__mixK1__(k1);
      h1 = Murmur3.__mixH1__(h1, k1);
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
      k1 = Murmur3.__mixK1__(k1);
      h1 = Murmur3.__mixH1__(h1, k1);
    }

    // Process remaining 1-3 bytes (will be finalized in result())
    this.__remainder__ = remaining % BYTES_PER_CHUNK;
    k1 = 0;
    if (this.__remainder__ > 0) {
      // Optimize conditional branches
      const startIdx = length - this.__remainder__;
      k1 ^= input.charCodeAt(startIdx) & MASK_16;

      if (this.__remainder__ > 1) {
        k1 ^= (input.charCodeAt(startIdx + 1) & MASK_16) << BYTE_POS_8;

        if (this.__remainder__ > 2) {
          k1 ^= (input.charCodeAt(startIdx + 2) & MASK_16) << BYTE_POS_16;
        }
      }
    }

    // Update hash state
    this.__h1__ = h1;
    this.__k1__ = k1;
    return this;
  }

  /**
   * Updates the hash with binary data
   *
   * @param bytes - Uint8Array to hash
   * @returns This hash instance (for chaining)
   * @private
   */
  private __processBytes__(bytes: Uint8Array): Murmur3 {
    if (!bytes.length) return this;

    // Cache frequently used constants in local variables
    const BYTES_PER_CHUNK = Murmur3.__BYTES_PER_CHUNK__;
    const BYTE_POS_8 = Murmur3.__BYTE_POS_8__;
    const BYTE_POS_16 = Murmur3.__BYTE_POS_16__;
    const BYTE_POS_24 = Murmur3.__BYTE_POS_24__;
    const CHUNK_UNROLL_SIZE = Murmur3.__CHUNK_UNROLL_SIZE__;
    const DATAVIEW_CHUNK_SIZE = Murmur3.__DATAVIEW_CHUNK_SIZE__;
    const DATAVIEW_THRESHOLD = Murmur3.__DATAVIEW_THRESHOLD__;
    const isLittleEndian = Murmur3.__isLittleEndian__;

    let h1 = this.__h1__;
    let k1 = this.__k1__;
    const length = bytes.length;
    let index = 0;

    this.__length__ += length;

    // Process remaining bytes from previous hash call
    if (this.__remainder__ > 0) {
      // Calculate the number of bytes needed to complete a 4-byte block
      const needed = BYTES_PER_CHUNK - this.__remainder__;
      const available = Math.min(needed, length);

      // Early return optimization
      if (available <= 0) {
        return this;
      }

      // Use switch statement for branch optimization
      switch (this.__remainder__) {
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
      if (this.__remainder__ + available >= BYTES_PER_CHUNK) {
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);
        k1 = 0;
        this.__remainder__ = 0;
      } else {
        // Update remainder if a complete block could not be formed
        this.__remainder__ += available;
        this.__k1__ = k1;
        this.__h1__ = h1;
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

          k1 = Murmur3.__mixK1__(k1);
          h1 = Murmur3.__mixH1__(h1, k1);
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
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);
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
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);

        // Second chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);

        // Third chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);

        // Fourth chunk
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);
      }

      // Process remaining individual chunks
      for (; chunk < fullChunks; chunk++) {
        k1 =
          bytes[index] |
          (bytes[index + 1] << BYTE_POS_8) |
          (bytes[index + 2] << BYTE_POS_16) |
          (bytes[index + 3] << BYTE_POS_24);
        index += BYTES_PER_CHUNK;
        k1 = Murmur3.__mixK1__(k1);
        h1 = Murmur3.__mixH1__(h1, k1);
      }
    }

    // Process remaining 1-3 bytes (will be finalized in result())
    this.__remainder__ = remaining % BYTES_PER_CHUNK;
    k1 = 0;
    if (this.__remainder__ > 0) {
      // Optimize conditional branches
      const startIdx = length - this.__remainder__;
      k1 ^= bytes[startIdx];

      if (this.__remainder__ > 1) {
        k1 ^= bytes[startIdx + 1] << BYTE_POS_8;

        if (this.__remainder__ > 2) {
          k1 ^= bytes[startIdx + 2] << BYTE_POS_16;
        }
      }
    }

    // Update hash state
    this.__h1__ = h1;
    this.__k1__ = k1;
    return this;
  }

  /**
   * Finalizes the hash computation and returns the hash value
   *
   * @returns The 32-bit hash value
   */
  public result(): number {
    // Create copies of state variables (preserving original state)
    let k1 = this.__k1__;
    let h1 = this.__h1__;

    // Process any remaining bytes
    if (k1 > 0) {
      k1 = Murmur3.__mixK1__(k1);
      h1 ^= k1;
    }

    // Finalization
    h1 ^= this.__length__;

    // Avalanche bits (constant caching)
    const MASK_16 = Murmur3.__MASK_16__;
    const MASK_16_SHIFT = Murmur3.__MASK_16_SHIFT__;
    const R5 = Murmur3.__R5__;
    const R6 = Murmur3.__R6__;
    const R7 = Murmur3.__R7__;
    const F1 = Murmur3.__F1__;
    const F2 = Murmur3.__F2__;
    const F3 = Murmur3.__F3__;
    const F4 = Murmur3.__F4__;

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

    this.__h1__ = seed >>> 0;
    this.__k1__ = 0;
    this.__remainder__ = 0;
    this.__length__ = 0;
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
