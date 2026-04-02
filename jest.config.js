// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolve } = require("path");
const root = resolve(__dirname);

module.exports = {
  rootDir: root,
  displayName: "root-tests",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  testEnvironment: "node",
  clearMocks: true,
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  moduleNameMapper: {
    "@src/(.*)": "<rootDir>/src/$1",
    "@test/(.*)": "<rootDir>/test/$1",
  },
};
