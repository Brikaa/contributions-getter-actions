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
import { generateRandomString } from "../../main/util";
import { Environment } from "../../main/types";

type NonExhaustiveEnvironment = {
  [key in keyof Environment]?: string | undefined;
};
type ExhaustiveEnvironment = {
  [key in keyof Omit<Environment, "USERNAME" | "TOKEN">]: string;
};

const MONTHS_INTERVAL = "11" as const;
const MINIMUM_STARS_FOR_HIGHLIGHT = "500" as const;
const INVALID_MINIMUM_STARS_FOR_HIGHLIGHT = "asd" as const;
const HEADER_FORMAT =
  `[${NO_COMMITS_SYMBOL}](${COMMITS_URL_SYMBOL}) in [${REPO_NAME_SYMBOL}](${REPO_URL_SYMBOL}) \
using ${PRIMARY_LANGUAGE_SYMBOL}\n${REPO_DESCRIPTION_SYMBOL}` as const;
const HIGHLIGHT_FORMAT = `[COOL] ${HEADER_SYMBOL}` as const;
const cwd = process.cwd();
const FILE_BEFORE_PATH = path.relative(cwd, path.join(__dirname, "before.md"));
const FILE_AFTER_PATH = path.relative(cwd, path.join(__dirname, "after.md"));
const TOKEN = "MOCK_TOKEN" as const;
const USERNAME = "SomeGuy" as const;
const EMPTY_GET_CONTRIBUTION_FN = "EMPTY" as const;
const SINGLE_YEAR_GET_CONTRIBUTION_FN = "SINGLE" as const;
const MULTIPLE_YEARS_GET_CONTRIBUTION_FN = "MULTIPLE" as const;
const INVALID_MOCK_GET_CONTRIBUTIONS_FN = "INVALID" as const;
const SORT_REPOS_FN = "STARS" as const;
const REPOS_TO_IGNORE = "fourth-repo" as const;

const setProcessEnv = (env: NonExhaustiveEnvironment) => {
  process.env = { TOKEN, USERNAME, ...env };
};

afterAll(async () => {
  // Output result of different configs and their env varas to a file which will be used while testing the GitHub action
  setProcessEnv({
    MOCK_GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
  });
  const allDefaultMarkdown = await getContributionsMarkdownUsingEnvConfig();
  const allModifiedEnv: ExhaustiveEnvironment = {
    HEADER_FORMAT,
    HIGHLIGHT_FORMAT,
    FILE_BEFORE_PATH,
    FILE_AFTER_PATH,
    MINIMUM_STARS_FOR_HIGHLIGHT,
    MONTHS_INTERVAL,
    MOCK_GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
    SORT_REPOS_FN,
    REPOS_TO_IGNORE,
  };
  setProcessEnv(allModifiedEnv); // We do this last because we want to write the all-modified config to the env file
  const allModifiedMarkdown = await getContributionsMarkdownUsingEnvConfig();
  let envStr = "";
  const randomString = generateRandomString();
  for (const key in process.env) {
    const value = process.env[key];
    if (value !== undefined) {
      envStr += `${key}<<${randomString}\n${value}\n${randomString}\n`;
    }
  }
  writeFileSync(path.join(__dirname, "/outputs/.env"), envStr);
  writeFileSync(
    path.join(__dirname, "/outputs/all-default-unit.md"),
    allDefaultMarkdown + "\n",
  );
  writeFileSync(
    path.join(__dirname, "/outputs/all-modified-unit.md"),
    allModifiedMarkdown + "\n",
  );
});

const testAgainstEnv = async (
  env: NonExhaustiveEnvironment,
  expectedMarkdown: string,
) => {
  setProcessEnv(env);
  const markdown = await getContributionsMarkdownUsingEnvConfig();
  expect(markdown).toBe(expectedMarkdown);
};

const testAgainstProcessExitEnv = async (env: NonExhaustiveEnvironment) => {
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
      MOCK_GET_CONTRIBUTIONS_FN: SINGLE_YEAR_GET_CONTRIBUTION_FN,
    };
    const expected = `## 2019-07-10 -> 2020-07-10

<details>

### [SomeGuy-12](https://www.google.com) - [123 commits](https://www.youtube.com) - Python
It's a cool repo

### ⭐ [second-repo](https://www.fast.com) - [1 commit](https://github.com) - no primary language
no description

</details>`;
    testAgainstEnv(env, expected);
  });

  it("returns correct markdown with combination 1", async () => {
    const env = {
      MOCK_GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
      HIGHLIGHT_FORMAT,
      FILE_AFTER_PATH,
      MINIMUM_STARS_FOR_HIGHLIGHT,
      MONTHS_INTERVAL,
    };
    const expected = `## 2019-07-10 -> 2020-07-10

<details>

### [SomeGuy-11](https://www.google.com) - [123 commits](https://www.youtube.com) - Python
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
      MOCK_GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
      HEADER_FORMAT,
      FILE_BEFORE_PATH,
      REPOS_TO_IGNORE,
      SORT_REPOS_FN,
    };
    const expected = `# Repositories I have contributed to

## 2019-07-10 -> 2020-07-10

<details>

### ⭐ [1 commit](https://github.com) in [second-repo](https://www.fast.com) using no primary language
no description

### [123 commits](https://www.youtube.com) in [SomeGuy-12](https://www.google.com) using Python
It's a cool repo

</details>`;
    testAgainstEnv(env, expected);
  });

  it("returns correct markdown with combination 3", async () => {
    const env = {
      MOCK_GET_CONTRIBUTIONS_FN: MULTIPLE_YEARS_GET_CONTRIBUTION_FN,
      HEADER_FORMAT,
      HIGHLIGHT_FORMAT,
      FILE_AFTER_PATH,
      FILE_BEFORE_PATH,
    };
    const expected = `# Repositories I have contributed to

## 2019-07-10 -> 2020-07-10

<details>

### [123 commits](https://www.youtube.com) in [SomeGuy-12](https://www.google.com) using Python
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
      MOCK_GET_CONTRIBUTIONS_FN: EMPTY_GET_CONTRIBUTION_FN,
    };
    const expected = "";
    testAgainstEnv(env, expected);
  });

  it("exits when the MOCK_GET_CONTRIBUTIONS_FN is invalid", async () => {
    const env = {
      MOCK_GET_CONTRIBUTIONS_FN: INVALID_MOCK_GET_CONTRIBUTIONS_FN,
    };
    testAgainstProcessExitEnv(env);
  });
});
