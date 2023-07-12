import "dotenv/config";
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
import { Contribution } from "contributions-getter";
import { getContributionsMarkdownUsingEnvConfig } from "../../main/getContributionsMarkdown";
import { GetContributionsType } from "../../types/configTypes";
import path from "path";

type Environment = { [key: string]: string | undefined };
const MONTHS_INTERVAL = "11";
const MINIMUM_STARS_FOR_HIGHLIGHT = "500";
const INVALID_MINIMUM_STARS_FOR_HIGHLIGHT = "asd";
const HEADER_FORMAT = `[${NO_COMMITS_SYMBOL}](${COMMITS_URL_SYMBOL}) in [${REPO_NAME_SYMBOL}](${REPO_URL_SYMBOL}) \
using ${PRIMARY_LANGUAGE_SYMBOL}\n${REPO_DESCRIPTION_SYMBOL}`;
const HIGHLIGHT_FORMAT = `[COOL] ${HEADER_SYMBOL}`;
const FILE_BEFORE_PATH = path.join(__dirname, "before.md");
const FILE_AFTER_PATH = path.join(__dirname, "after.md");
const TOKEN = process.env.TOKEN;
const USERNAME = process.env.USERNAME;

/*
Combinations
- Single year, HEADER_FORMAT: default, HIGHLIGHT_FORMAT: default,
  FILE_BEFORE_PATH: default, FILE_AFTER_PATH: default, MINIMUM_STARS_FOR_HIGHLIGHT: default, MONTHS_INTERVAL: default
- Multiple years, HEADER_FORMAT: default, HIGHLIGHT_FORMAT: modified,
  FILE_BEFORE_PATH: default, FILE_AFTER_PATH: modified, MINIMUM_STARS_FOR_HIGHLIGHT: modified, MONTHS_INTERVAL: modified
- Multiple years, HEADER_FORMAT: modified, HIGHLIGHT_FORMAT: default,
  FILE_BEFORE_PATH: modified, FILE_AFTER_PATH: default, MINIMUM_STARS_FOR_HIGHLIGHT: default, MONTHS_INTERVAL: default
- Multiple years, HEADER_FORMAT: modified, HIGHLIGHT_FORMAT: modified,
  FILE_BEFORE_PATH: modified, FILE_AFTER_PATH: modified, MINIMUM_STARS_FOR_HIGHLIGHT: default, MONTHS_INTERVAL: default
- Empty, first
*/
const ENV_COMBINATIONS: Environment[] = [
  { TOKEN, USERNAME },
  {
    TOKEN,
    USERNAME,
    HIGHLIGHT_FORMAT,
    FILE_AFTER_PATH,
    MINIMUM_STARS_FOR_HIGHLIGHT,
    MONTHS_INTERVAL,
  },
  {
    TOKEN,
    USERNAME,
    HEADER_FORMAT,
    FILE_BEFORE_PATH,
  },
  {
    TOKEN,
    USERNAME,
    HEADER_FORMAT,
    HIGHLIGHT_FORMAT,
    FILE_AFTER_PATH,
    FILE_BEFORE_PATH,
  },
  {
    TOKEN,
    USERNAME,
    MINIMUM_STARS_FOR_HIGHLIGHT: INVALID_MINIMUM_STARS_FOR_HIGHLIGHT,
  },
];

const FIRST_YEAR_CONTRIBUTION: Contribution = {
  startDate: new Date("2019-07-08T18:19:55.477Z"),
  endDate: new Date("2020-07-08T18:19:55.477Z"),
  repos: [
    {
      name: "First repo",
      description: "It's a cool repo",
      commits: 123,
      commitsUrl: "https://www.youtube.com",
      isPrivate: false,
      primaryLanguage: "Python",
      stars: 33,
      url: "https://www.google.com",
    },
    {
      name: "second-repo",
      description: null,
      commits: 1,
      commitsUrl: "https://github.com",
      isPrivate: false,
      primaryLanguage: null,
      stars: 3000,
      url: "https://www.fast.com",
    },
  ],
};

const SECOND_YEAR_CONTRIBUTION: Contribution = {
  startDate: new Date("2020-07-08T18:19:55.477Z"),
  endDate: new Date("2021-07-08T18:19:55.477Z"),
  repos: [],
};

const THIRD_YEAR_CONTRIBUTION: Contribution = {
  startDate: new Date("2021-07-08T18:19:55.477Z"),
  endDate: new Date("2022-07-08T18:19:55.477Z"),
  repos: [
    {
      name: "third-repo",
      description: "It's a repo",
      commits: 450,
      commitsUrl: "https://www.github.com/new",
      isPrivate: true,
      primaryLanguage: "Java",
      stars: 550,
      url: "https://www.github.com/brikaa",
    },
    {
      name: "fourth-repo",
      description: null,
      commits: 600,
      commitsUrl: "https://www.github.com/microsoft",
      isPrivate: false,
      primaryLanguage: null,
      stars: 520,
      url: "https://www.github.com/microsoft/vscode",
    },
  ],
};

const createMockGetContributions = (
  returnValue: Contribution[],
): GetContributionsType =>
  jest.fn<GetContributionsType>().mockResolvedValue(returnValue);

/*
- One empty
- One single year
- One multiple years with empty periods, non private repos
*/
const emptyGetContributions = createMockGetContributions([]);
const singleYearGetContributions = createMockGetContributions([
  FIRST_YEAR_CONTRIBUTION,
]);
const multipleYearsGetContributions = createMockGetContributions([
  FIRST_YEAR_CONTRIBUTION,
  SECOND_YEAR_CONTRIBUTION,
  THIRD_YEAR_CONTRIBUTION,
]);

const COMB0_EXPECTED_MARKDOWN = `## 2019 - 2020

<details>

### [First repo](https://www.google.com) - [123 commits](https://www.youtube.com) - Python
It's a cool repo

### ⭐ [second-repo](https://www.fast.com) - [1 commit](https://github.com) - no primary language
no description

</details>`;

const COMB1_EXPECTED_MARKDOWN = `## 2019 - 2020

<details>

### [First repo](https://www.google.com) - [123 commits](https://www.youtube.com) - Python
It's a cool repo

### [COOL] [second-repo](https://www.fast.com) - [1 commit](https://github.com) - no primary language
no description

</details>

## 2021 - 2022

<details>

### [COOL] [fourth-repo](https://www.github.com/microsoft/vscode) - [600 commits](https://www.github.com/microsoft) - no primary language
no description

</details>

Generated by [brikaa/contributions-getter-actions](https://www.google.com)
`;

const COMB2_EXPECTED_MARKDOWN = `# Repositories I have contributed to

## 2019 - 2020

<details>

### [123 commits](https://www.youtube.com) in [First repo](https://www.google.com) using Python
It's a cool repo

### ⭐ [1 commit](https://github.com) in [second-repo](https://www.fast.com) using no primary language
no description

</details>

## 2021 - 2022

<details>

### [600 commits](https://www.github.com/microsoft) in [fourth-repo](https://www.github.com/microsoft/vscode) using \
no primary language
no description

</details>`;

const COMB3_EXPECTED_MARKDOWN = `# Repositories I have contributed to

## 2019 - 2020

<details>

### [123 commits](https://www.youtube.com) in [First repo](https://www.google.com) using Python
It's a cool repo

### [COOL] [1 commit](https://github.com) in [second-repo](https://www.fast.com) using no primary language
no description

</details>

## 2021 - 2022

<details>

### [600 commits](https://www.github.com/microsoft) in [fourth-repo](https://www.github.com/microsoft/vscode) using \
no primary language
no description

</details>

Generated by [brikaa/contributions-getter-actions](https://www.google.com)
`;

const testAgainstCombination = async (
  getContributionsFn: GetContributionsType,
  combinationNumber: number,
  expectedMarkdown: string,
) => {
  process.env = ENV_COMBINATIONS[combinationNumber];
  const markdown = await getContributionsMarkdownUsingEnvConfig(
    getContributionsFn,
  );
  expect(markdown).toBe(expectedMarkdown);
};
describe("Full path till returning the markdown", () => {
  it("returns correct markdown with combination 0", async () => {
    testAgainstCombination(
      singleYearGetContributions,
      0,
      COMB0_EXPECTED_MARKDOWN,
    );
  });

  it("returns correct markdown with combination 1", async () => {
    testAgainstCombination(
      multipleYearsGetContributions,
      1,
      COMB1_EXPECTED_MARKDOWN,
    );
  });

  it("returns correct markdown with combination 2", async () => {
    testAgainstCombination(
      multipleYearsGetContributions,
      2,
      COMB2_EXPECTED_MARKDOWN,
    );
  });

  it("returns correct markdown with combination 3", async () => {
    testAgainstCombination(
      multipleYearsGetContributions,
      3,
      COMB3_EXPECTED_MARKDOWN,
    );
  });

  it("exits when the minimum number of stars is not a valid number (combination 4)", async () => {
    class ProcessExitError extends Error {}

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new ProcessExitError();
    });
    const mockError = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    await expect(() =>
      testAgainstCombination(multipleYearsGetContributions, 4, ""),
    ).rejects.toThrow(ProcessExitError);

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  it("returns empty markdown when there are no contributions", async () => {
    testAgainstCombination(emptyGetContributions, 0, "");
  });
});
