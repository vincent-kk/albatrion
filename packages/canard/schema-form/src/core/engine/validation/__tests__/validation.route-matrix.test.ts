import { expect, it } from 'vitest';

import {
  type RoutingClass,
  observeRouting,
} from './fixtures/routeOracle/observeRouting';
import { routeMatrixClassification } from './fixtures/routeOracle/routeMatrixClassification';
import {
  routeOracleScenarios,
  routeOracleShapes,
} from './fixtures/routeOracle/routeOracleShapes';
import { routeOracleValidators } from './fixtures/routeOracle/routeOracleValidators';

it.each(routeOracleValidators)(
  'classifies every shape and scenario under $name as the table records',
  async (config) => {
    const observed: Record<
      string,
      Record<string, readonly RoutingClass[]>
    > = {};
    for (const shape of routeOracleShapes) {
      const row = (observed[shape.name] ??= {});
      if (shape.dialects && !shape.dialects.includes(config.dialect)) continue;
      const classes: RoutingClass[] = [];
      for (const scenario of routeOracleScenarios)
        classes.push(
          (await observeRouting(shape.schema(), shape.value(scenario), config))
            .routing,
        );
      row[config.name] = classes;
    }
    const expected: Record<
      string,
      Record<string, readonly RoutingClass[]>
    > = {};
    for (const [name, row] of Object.entries(routeMatrixClassification)) {
      const classes = row[config.name];
      expected[name] = classes ? { [config.name]: classes } : {};
    }
    expect(observed).toEqual(expected);
  },
);
