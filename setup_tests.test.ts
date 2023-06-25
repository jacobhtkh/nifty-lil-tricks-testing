// Copyright 2023-2023 the Nifty li'l' tricks authors. All rights reserved. MIT license.

import { beforeEach, describe, it } from "std/testing/bdd.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { setupTestsFactory } from "./setup_tests.ts";
import type { SetupTestsFn, SetupTestsPlugin } from "./setup_tests.type.ts";

describe("setupTestsFactory", () => {
  let setupTests: SetupTestsFn<Plugins>;

  beforeEach(() => {
    teardownCalls = [];
    const { setupTests: setupTestsFn } = setupTestsFactory({
      plugin1,
      plugin2,
    });
    setupTests = setupTestsFn;
  });

  describe("setupTests", () => {
    it("should run activated plugins and return the results", async () => {
      // Arrange
      const plugin1Config: Plugin1Config = { data1: ["1"] };

      // Act
      const result = await setupTests({
        plugin1: plugin1Config,
      });

      // Assert
      assertEquals(result.data, { plugin1: { plugin1Result: plugin1Config } });
    });

    it("should run plugins and return the results when all plugins are activated", async () => {
      // Arrange
      const plugin1Config: Plugin1Config = { data1: ["1"] };
      const plugin2Config: Plugin2Config = { data2: [2] };

      // Act
      const result = await setupTests({
        plugin1: plugin1Config,
        plugin2: plugin2Config,
      });

      // Assert
      assertEquals(result.data, {
        plugin1: { plugin1Result: plugin1Config },
        plugin2: { plugin2Result: plugin2Config },
      });
    });
  });

  describe("teardown", () => {
    it("should run the teardown function of activated plugins", async () => {
      // Arrange
      const plugin1Config: Plugin1Config = { data1: ["1"] };
      const plugin2Config: Plugin2Config = { data2: [2] };
      const { teardownTests } = await setupTests({
        plugin1: plugin1Config,
        plugin2: plugin2Config,
      });

      // Act
      await teardownTests();

      // Assert
      assertEquals(teardownCalls, ["plugin2.teardown", "plugin1.teardown"]);
    });

    it("should run the teardown function of all plugins when all plugins are activated", async () => {
      // Arrange
      const plugin1Config: Plugin1Config = { data1: ["1"] };
      const { teardownTests } = await setupTests({
        plugin1: plugin1Config,
      });

      // Act
      await teardownTests();

      // Assert
      assertEquals(teardownCalls, ["plugin1.teardown"]);
    });
  });
});

type Plugins = {
  plugin1: SetupTestsPlugin<Plugin1Config, Plugin1Result>;
  plugin2: SetupTestsPlugin<Plugin2Config, Plugin2Result>;
};

interface Plugin1Config {
  data1: string[];
}

interface Plugin1Result {
  plugin1Result: Plugin1Config;
}

interface Plugin2Config {
  data2: number[];
}

interface Plugin2Result {
  plugin2Result: Plugin2Config;
}

let teardownCalls: string[] = [];

const plugin1: SetupTestsPlugin<Plugin1Config, Plugin1Result> = {
  setup(config: Plugin1Config) {
    return { plugin1Result: config };
  },
  teardown() {
    teardownCalls.push("plugin1.teardown");
  },
};

const plugin2: SetupTestsPlugin<Plugin2Config, Plugin2Result> = {
  setup(config: Plugin2Config) {
    return { plugin2Result: config };
  },
  teardown() {
    teardownCalls.push("plugin2.teardown");
  },
};