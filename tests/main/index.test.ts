import {
  COMMITS_URL_SYMBOL,
  HEADER_SYMBOL,
  NO_COMMITS_SYMBOL,
  PRIMARY_LANGUAGE_SYMBOL,
  REPO_DESCRIPTION_SYMBOL,
  REPO_NAME_SYMBOL,
  REPO_URL_SYMBOL,
} from "../../main/constants";
import { expect, jest } from "@jest/globals";
import { getContributionsMarkdownUsingEnvConfig } from "../../main/getContributionsMarkdown";
import path from "path";
import { writeFileSync } from "fs";

type Environment = { [key: string]: string | undefined };
const MONTHS_INTERVAL = "11";
const MINIMUM_STARS_FOR_HIGHLIGHT = "500";
const INVALID_MINIMUM_STARS_FOR_HIGHLIGHT = "asd";
const HEADER_FORMAT = `[${NO_COMMITS_SYMBOL}](${COMMITS_URL_SYMBOL}) in [${REPO_NAME_SYMBOL}](${REPO_URL_SYMBOL}) \
using ${PRIMARY_LANGUAGE_SYMBOL}\n${REPO_DESCRIPTION_SYMBOL}`;
const HIGHLIGHT_FORMAT = `[COOL] ${HEADER_SYMBOL}`;
const FILE_BEFORE_PATH = path.join(__dirname, "before.md");
const FILE_AFTER_PATH = path.join(__dirname, "after.md");
const TOKEN = "MOCK_TOKEN";
const USERNAME = "Brikaa";
const EMPTY_GET_CONTRIBUTION_FN = "EMPTY";
const SINGLE_YEAR_GET_CONTRIBUTION_FN = "SINGLE";
const MULTIPLE_YEARS_GET_CONTRIBUTION_FN = "MULTIPLE";
const INVALID_GET_CONTRIBUTIONS_FN = "INVALID";

const setProcessEnv = (env: Environment) => {
  process.env = { TOKEN, USERNAME, ...env };
};

afterAll(async () => {
  // Output result of all modified configs to a file which will be used while testing the GitHub action
  const env: Environment = {
    HEADER_FORMAT,
    HIGHLIGHT_FORMAT,
    FILE_BEFORE_PATH,
    FILE_AFTER_PATH,
    MINIMUM_STARS_FOR_HIGHLIGHT,
    MONTHS_INTERVAL,
    GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
  };
  setProcessEnv(env);
  let envStr = "";
  for (const key in process.env) {
    const value = process.env[key];
    if (value !== undefined) {
      envStr += `${key}=${value.replace(/\n/g, "\\n")}\n`;
    }
  }
  const markdown = await getContributionsMarkdownUsingEnvConfig();
  writeFileSync(path.join(__dirname, "/outputs/unit.md"), markdown);
  writeFileSync(path.join(__dirname, "/outputs/.env"), envStr);
});

const testAgainstEnv = async (env: Environment, expectedMarkdown: string) => {
  setProcessEnv(env);
  const markdown = await getContributionsMarkdownUsingEnvConfig();
  expect(markdown).toBe(expectedMarkdown);
};

const testAgainstProcessExitEnv = async (env: Environment) => {
  class ProcessExitError extends Error {}

  const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
    throw new ProcessExitError();
  });
  const mockError = jest
    .spyOn(process.stdout, "write")
    .mockImplementation(() => true);

  await expect(() => testAgainstEnv(env, "")).rejects.toThrow(ProcessExitError);

  mockExit.mockRestore();
  mockError.mockRestore();
};

describe("Full path till returning the markdown", () => {
  it("returns correct markdown with all defaults", async () => {
    const env = {
      GET_CONTRIBUTIONS_FN: SINGLE_YEAR_GET_CONTRIBUTION_FN,
    };
    const expected = `## 2019-07-10 -> 2020-07-10

<details>

### [First repo](https://www.google.com) - [123 commits](https://www.youtube.com) - Python
It's a cool repo

### ⭐ [second-repo](https://www.fast.com) - [1 commit](https://github.com) - no primary language
no description

</details>`;
    testAgainstEnv(env, expected);
  });

  it("returns correct markdown with combination 1", async () => {
    const env = {
      GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
      HIGHLIGHT_FORMAT,
      FILE_AFTER_PATH,
      MINIMUM_STARS_FOR_HIGHLIGHT,
      MONTHS_INTERVAL,
    };
    const expected = `## 2019-07-10 -> 2020-07-10

<details>

### [First repo](https://www.google.com) - [123 commits](https://www.youtube.com) - Python
It's a cool repo

### [COOL] [second-repo](https://www.fast.com) - [1 commit](https://github.com) - no primary language
no description

</details>

## 2021-07-10 -> 2022-07-10

<details>

### [COOL] [fourth-repo](https://www.github.com/microsoft/vscode) - [600 commits](https://www.github.com/microsoft) - no primary language
no description

</details>

Generated by [brikaa/contributions-getter-actions](https://www.google.com)
`;
    testAgainstEnv(env, expected);
  });

  it("returns correct markdown with combination 2", async () => {
    const env = {
      GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
      HEADER_FORMAT,
      FILE_BEFORE_PATH,
    };
    const expected = `# Repositories I have contributed to

## 2019-07-10 -> 2020-07-10

<details>

### [123 commits](https://www.youtube.com) in [First repo](https://www.google.com) using Python
It's a cool repo

### ⭐ [1 commit](https://github.com) in [second-repo](https://www.fast.com) using no primary language
no description

</details>

## 2021-07-10 -> 2022-07-10

<details>

### [600 commits](https://www.github.com/microsoft) in [fourth-repo](https://www.github.com/microsoft/vscode) using \
no primary language
no description

</details>`;
    testAgainstEnv(env, expected);
  });

  it("returns correct markdown with combination 3", async () => {
    const env = {
      GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
      HEADER_FORMAT,
      HIGHLIGHT_FORMAT,
      FILE_AFTER_PATH,
      FILE_BEFORE_PATH,
    };
    const expected = `# Repositories I have contributed to

## 2019-07-10 -> 2020-07-10

<details>

### [123 commits](https://www.youtube.com) in [First repo](https://www.google.com) using Python
It's a cool repo

### [COOL] [1 commit](https://github.com) in [second-repo](https://www.fast.com) using no primary language
no description

</details>

## 2021-07-10 -> 2022-07-10

<details>

### [600 commits](https://www.github.com/microsoft) in [fourth-repo](https://www.github.com/microsoft/vscode) using \
no primary language
no description

</details>

Generated by [brikaa/contributions-getter-actions](https://www.google.com)
`;
    testAgainstEnv(env, expected);
  });

  it("exits when the minimum number of stars is not a valid number", async () => {
    const env = {
      MINIMUM_STARS_FOR_HIGHLIGHT: INVALID_MINIMUM_STARS_FOR_HIGHLIGHT,
    };
    testAgainstProcessExitEnv(env);
  });

  it("returns empty markdown when there are no contributions", async () => {
    const env = {
      GET_CONTRIBUTIONS_FN: EMPTY_GET_CONTRIBUTION_FN,
    };
    const expected = "";
    testAgainstEnv(env, expected);
  });

  it("exits when the GET_CONTRIBUTIONS_FN is invalid", async () => {
    const env = {
      GET_CONTRIBUTIONS_FN: INVALID_GET_CONTRIBUTIONS_FN,
    };
    testAgainstProcessExitEnv(env);
  });
});
