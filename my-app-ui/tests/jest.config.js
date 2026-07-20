"use strict";
globalThis.ngJest = {
  skipNgcc: true,
};
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/tests/setup-jest.ts"],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage/sonarQube",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/*.module.ts",
    "!<rootDir>/src/main.ts",
    "!<rootDir>/src/environments/**"
  ],
  testResultsProcessor: "jest-sonar-reporter",
  globalSetup: "<rootDir>/tests/global-setup-jest.js",
  roots: ["src"],
  prettierPath: null, // prettier 3 does not yet work with jest and inline snapshots
  transformIgnorePatterns: [
    "node_modules/(?!.*\\.mjs$|@quadrel-enterprise-ui|@angular|@ngrx|@ngx-translate|ngx-translate-multi-http-loader|rxjs)"
  ],
};
