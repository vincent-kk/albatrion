/** Low bits identify controls; flags 16, 32, 64 and 128 mark string, component, opening and URL states. */
export const CSS_POSITION_CLASS = new Uint8Array(128);
CSS_POSITION_CLASS[92] = 1 | 16 | 32 | 64 | 128;
CSS_POSITION_CLASS[34] = 2 | 16 | 32 | 64;
CSS_POSITION_CLASS[39] = 3 | 16 | 32 | 64;
CSS_POSITION_CLASS[47] = 4 | 32 | 64;
CSS_POSITION_CLASS[40] = 5 | 32 | 64;
CSS_POSITION_CLASS[91] = 6 | 32 | 64;
CSS_POSITION_CLASS[123] = 7 | 32;
CSS_POSITION_CLASS[41] = 8 | 32 | 128;
CSS_POSITION_CLASS[93] = 9 | 32;
CSS_POSITION_CLASS[125] = 10 | 32;
for (const code of [10, 12, 13]) CSS_POSITION_CLASS[code] = 11 | 16;
