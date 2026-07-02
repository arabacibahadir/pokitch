const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");

const source = readFileSync(
  require.resolve("../src/pages/collections/index.tsx"),
  "utf8",
);

test("the public collections query selects only publicly readable columns", () => {
  assert.match(
    source,
    /\.select\("id,poke,user,channel,created_at"\)/,
  );
  assert.doesNotMatch(source, /\.select\(\)/);
});

test("collection filters do not serialize absent values as undefined", () => {
  assert.doesNotMatch(
    source,
    /\.or\(`user\.eq\.\$\{user\},channel\.eq\.\$\{channel\},poke\.eq\.\$\{poke\}`\)/,
  );
  assert.match(source, /if \(user\)/);
  assert.match(source, /else if \(channel\)/);
  assert.match(source, /else if \(poke\)/);
});
