# @configshell/contract-tests

Cross-adapter tests verify that the HTTP API and MCP server return equivalent catalog, resolution,
and setup-plan results. This test-only workspace ships no runtime output.

- Public surface: test suite in src/adapters.test.ts.
- Commands: pnpm --filter @configshell/contract-tests test, typecheck, lint.
