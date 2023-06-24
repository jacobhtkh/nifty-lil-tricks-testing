// Copyright 2023-2023 the Nifty li'l' tricks authors. All rights reserved. MIT license.

import { createGraph, Module } from "x/deno_graph/mod.ts";
import { walk } from "std/fs/walk.ts";

const ROOT = new URL("../", import.meta.url);
const EXTS = [".mjs", ".ts"];
const SKIP = [/(test|bench)/];
const BAD_IMPORT = new URL("../testing/asserts.ts", import.meta.url);

async function getFilePaths(): Promise<string[]> {
  const paths: string[] = [];
  for await (const { path } of walk(ROOT, { exts: EXTS, skip: SKIP })) {
    paths.push("file://" + path);
  }
  return paths;
}

function hasBadImports({ dependencies }: Module): boolean {
  return Object.values(dependencies!).some(({ code }) =>
    code?.specifier?.includes(BAD_IMPORT.href)
  );
}

async function getFilePathsWithBadImports(): Promise<string[]> {
  const paths = await getFilePaths();
  const { modules } = await createGraph(paths);
  return modules.filter(hasBadImports).map(({ specifier }: Module) =>
    specifier
  );
}

const paths = await getFilePathsWithBadImports();
if (paths.length > 0) {
  console.error(
    "Non-test code must use `_util/assert.ts` for assertions. Please fix:",
  );
  paths.forEach((path) => console.error("- " + path));
  Deno.exit(1);
}
