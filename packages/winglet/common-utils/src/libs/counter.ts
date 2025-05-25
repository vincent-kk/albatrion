/**
 * Factory function to create a counter object
 * Provides a counter that can increment, decrement, and reset values
 * @param initialValue - Initial value (default: 0)
 * @returns Object containing counter manipulation functions
 */
export const counterFactory = (initialValue = 0) => {
  let value = initialValue;
  return {
    get value() {
      return value;
    },
    /**
     * Increments the counter value by 1 and returns the incremented value
     * @returns The incremented counter value
     */
    increment: () => ++value,
    /**
     * Decrements the counter value by 1 and returns the decremented value
     * @returns The decremented counter value
     */
    decrement: () => --value,
    /**
     * Resets the counter value to the initial value
     * @returns The reset value
     */
    reset: () => (value = initialValue),
  };
};
