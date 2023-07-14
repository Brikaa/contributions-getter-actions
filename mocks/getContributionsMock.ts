import { ContributionsInterval } from "contributions-getter";
import { GetContributions } from "../types/configTypes";

const FIRST_YEAR_CONTRIBUTION: ContributionsInterval = {
  startDate: new Date("2019-07-10T18:19:55.477Z"),
  endDate: new Date("2020-07-10T18:19:55.477Z"),
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

const SECOND_YEAR_CONTRIBUTION: ContributionsInterval = {
  startDate: new Date("2020-07-10T18:19:55.477Z"),
  endDate: new Date("2021-07-10T18:19:55.477Z"),
  repos: [],
};

const THIRD_YEAR_CONTRIBUTION: ContributionsInterval = {
  startDate: new Date("2021-07-10T18:19:55.477Z"),
  endDate: new Date("2022-07-10T18:19:55.477Z"),
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

const createMockGetContributions =
  (returnValue: ContributionsInterval[]): GetContributions =>
  async () =>
    returnValue;

export const emptyGetContributions = createMockGetContributions([]);
export const singleYearGetContributions = createMockGetContributions([
  FIRST_YEAR_CONTRIBUTION,
]);
export const multipleYearsGetContributions = createMockGetContributions([
  FIRST_YEAR_CONTRIBUTION,
  SECOND_YEAR_CONTRIBUTION,
  THIRD_YEAR_CONTRIBUTION,
]);
