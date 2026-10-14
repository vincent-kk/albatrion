import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('real-world computed property patterns', () => {
    describe('visibility (visible) patterns', () => {
      it('should evaluate simple visibility condition', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'visible',
          '/category === "premium"',
          true,
        );
        expect(fn?.(['premium'])).toBe(true);
        expect(fn?.(['basic'])).toBe(false);
      });

      it('should evaluate compound visibility condition', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'visible',
          '/isLoggedIn && /userLevel >= 5',
          true,
        );
        expect(fn?.([true, 10])).toBe(true);
        expect(fn?.([true, 3])).toBe(false);
        expect(fn?.([false, 10])).toBe(false);
      });

      it('should evaluate array-based visibility', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'visible',
          'dependencies[0].length > 0',
          true,
        );
        expect(fn?.([{ length: 5 }])).toBe(true);
        expect(fn?.([{ length: 0 }])).toBe(false);
      });
    });

    describe('active patterns', () => {
      it('should evaluate active state', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'active',
          '/status !== "archived"',
          true,
        );
        expect(fn?.(['active'])).toBe(true);
        expect(fn?.(['archived'])).toBe(false);
      });
    });

    describe('readOnly patterns', () => {
      it('should evaluate readOnly state', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'readOnly',
          '/locked === true',
          true,
        );
        expect(fn?.([true])).toBe(true);
        expect(fn?.([false])).toBe(false);
      });

      it('should evaluate complex readOnly condition', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'readOnly',
          '{ if (/status === "approved") return true; if (/role !== "admin") return true; return false; }',
          true,
        );
        expect(fn?.(['approved', 'user'])).toBe(true);
        expect(fn?.(['pending', 'user'])).toBe(true);
        expect(fn?.(['pending', 'admin'])).toBe(false);
      });
    });

    describe('disabled patterns', () => {
      it('should evaluate disabled state', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'disabled',
          '/isProcessing || /isSubmitted',
          true,
        );
        expect(fn?.([true, false])).toBe(true);
        expect(fn?.([false, true])).toBe(true);
        expect(fn?.([false, false])).toBe(false);
      });
    });

    describe('derived value patterns', () => {
      it('should calculate derived value from multiple fields', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'derivedValue',
          '/price * /quantity * (1 - /discount / 100)',
        );
        expect(fn?.([100, 2, 10])).toBe(180);
      });

      it('should calculate derived string value', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'derivedValue',
          '/firstName + " " + /lastName',
        );
        expect(fn?.(['John', 'Doe'])).toBe('John Doe');
      });

      it('should handle complex block-based derivation', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          'derivedValue',
          `{
            const items = /items;
            if (!items || items.length === 0) return 0;
            return items.reduce((sum, item) => sum + item.price, 0);
          }`,
        );
        expect(fn?.([[{ price: 10 }, { price: 20 }, { price: 30 }]])).toBe(60);
        expect(fn?.([[]])).toBe(0);
        expect(fn?.([null])).toBe(0);
      });
    });

    describe('conditional schema (&if) patterns', () => {
      it('should evaluate oneOf condition', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          '&if',
          "./type === 'premium'",
          true,
        );
        expect(fn?.(['premium'])).toBe(true);
        expect(fn?.(['basic'])).toBe(false);
      });

      it('should evaluate complex oneOf condition', () => {
        const pathManager = getPathManager();
        const fn = createDynamicFunction(
          pathManager,
          '&if',
          "{ if (./category === 'subscription') return ./plan !== 'free'; return false; }",
          true,
        );
        expect(fn?.(['subscription', 'premium'])).toBe(true);
        expect(fn?.(['subscription', 'free'])).toBe(false);
        expect(fn?.(['one-time', 'premium'])).toBe(false);
      });
    });
  });
});
