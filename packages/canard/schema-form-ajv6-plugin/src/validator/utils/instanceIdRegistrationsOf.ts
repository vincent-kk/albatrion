/// <reference lib="es2021.weakref" />
import type Ajv from 'ajv';

import type { SchemaRootRegistration } from './registerSchemaRoot';

/** `$id` registrations placed on each base instance by every registry that uses it. */
const registrationsByInstance = new WeakMap<
  Ajv.Ajv,
  WeakRef<SchemaRootRegistration>[]
>();

/**
 * Return the live list of `$id` registrations held on one base instance, so registries
 * that share an instance (several per-instance validators, or one beside `bind`) see each
 * other's ids when deciding whether a root needs a sibling instance.
 * @param instance - Base AJV instance the registrations were added to
 * @returns The mutable list for that instance; callers push on registration and prune on release
 */
export const instanceIdRegistrationsOf = (
  instance: Ajv.Ajv,
): WeakRef<SchemaRootRegistration>[] => {
  let list = registrationsByInstance.get(instance);
  if (!list) {
    list = [];
    registrationsByInstance.set(instance, list);
  }
  return list;
};
