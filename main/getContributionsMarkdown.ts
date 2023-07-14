import { getContributions } from "contributions-getter";
import { Config, GET_CONTRIBUTIONS_TYPES } from "../types/configTypes";
import {
  COMMITS_URL_SYMBOL,
  DEFAULT_HEADER_FORMAT,
  DEFAULT_HIGHLIGHT_FORMAT,
  DEFAULT_MINIMUM_STARS_FOR_HIGHLIGHT,
  HEADER_SYMBOL,
  NO_COMMITS_SYMBOL,
  PRIMARY_LANGUAGE_SYMBOL,
  REPO_DESCRIPTION_SYMBOL,
  REPO_NAME_SYMBOL,
  REPO_URL_SYMBOL,
} from "./constants";
import { Environment } from "../types/envTypes";
import { readFileSync } from "fs";
import { cleanEnv, makeValidator, str } from "envalid";
import { formatDate } from "./util";
import {
  emptyGetContributions,
  multipleYearsGetContributions,
  singleYearGetContributions,
} from "../mocks/getContributionsMock";

const getContributionsMarkdown = async (
  token: string,
  userName: string,
  config: Config = {},
) => {
  const {
    contributionsGetterConfig = {},
    fileBefore,
    fileAfter,
    headerFormat = DEFAULT_HEADER_FORMAT,
    highlightFormat = DEFAULT_HIGHLIGHT_FORMAT,
    minimumStarsForHighlight = DEFAULT_MINIMUM_STARS_FOR_HIGHLIGHT,
    getContributionsFn = getContributions,
  } = config;

  const markdown: string[] = [];
  if (fileBefore !== undefined)
    markdown.push(readFileSync(fileBefore).toString());

  // Need to read the afterFile early in order to fail on error without wasting API quota
  const contentAfter =
    fileAfter === undefined ? null : readFileSync(fileAfter).toString();

  const contributionsInterval = await getContributionsFn(
    token,
    userName,
    contributionsGetterConfig,
  );

  contributionsInterval
    .filter((ci) => ci.repos.length > 0)
    .forEach((ci) => {
      markdown.push(
        `## ${formatDate(ci.startDate)} -> ${formatDate(
          ci.endDate,
        )}\n\n<details>\n`,
      );
      ci.repos
        .filter((r) => !r.isPrivate)
        .forEach((r) => {
          const header = headerFormat
            .replace(REPO_NAME_SYMBOL, r.name)
            .replace(REPO_URL_SYMBOL, r.url)
            .replace(
              NO_COMMITS_SYMBOL,
              r.commits.toString() + (r.commits === 1 ? " commit" : " commits"),
            )
            .replace(COMMITS_URL_SYMBOL, r.commitsUrl)
            .replace(
              PRIMARY_LANGUAGE_SYMBOL,
              r.primaryLanguage ?? "no primary language",
            )
            .replace(
              REPO_DESCRIPTION_SYMBOL,
              r.description ?? "no description",
            );

          const highlighted =
            r.stars >= minimumStarsForHighlight
              ? highlightFormat.replace(HEADER_SYMBOL, header)
              : header;

          markdown.push(`### ${highlighted}\n`);
        });
      markdown.push(`</details>`);
      markdown.push("");
    });

  markdown.pop();
  if (contentAfter !== null) markdown.push(contentAfter);
  return markdown.join("\n");
};

export const getContributionsMarkdownUsingEnvConfig = async () => {
  const int = makeValidator((x) => {
    const xInt = parseInt(x);
    if (isNaN(xInt)) throw new Error("Expected a number");
    else return xInt;
  });

  const validGetContributionsFn = makeValidator((x) => {
    const getContributionsType = GET_CONTRIBUTIONS_TYPES.find((c) => c === x);
    if (getContributionsType === undefined)
      throw new Error("Invalid GET_CONTRIBUTIONS_FN");
    else {
      let getContributionsFn;
      switch (getContributionsType) {
        case "EMPTY":
          getContributionsFn = emptyGetContributions;
          break;
        case "MULTIPLE":
          getContributionsFn = multipleYearsGetContributions;
          break;
        case "SINGLE":
          getContributionsFn = singleYearGetContributions;
          break;
      }
      return getContributionsFn;
    }
  });

  const env = cleanEnv<Environment>(process.env, {
    TOKEN: str(),
    USERNAME: str(),
    FILE_AFTER_PATH: str({ default: undefined }),
    FILE_BEFORE_PATH: str({ default: undefined }),
    HEADER_FORMAT: str({ default: undefined }),
    HIGHLIGHT_FORMAT: str({ default: undefined }),
    MINIMUM_STARS_FOR_HIGHLIGHT: int({ default: undefined }),
    MONTHS_INTERVAL: int({ default: undefined }),
    GET_CONTRIBUTIONS_FN: validGetContributionsFn({ default: undefined }),
  });

  const config: Config = {
    contributionsGetterConfig: {
      monthsInterval: env.MONTHS_INTERVAL,
    },
    headerFormat: env.HEADER_FORMAT,
    highlightFormat: env.HIGHLIGHT_FORMAT,
    fileBefore: env.FILE_BEFORE_PATH,
    fileAfter: env.FILE_AFTER_PATH,
    minimumStarsForHighlight: env.MINIMUM_STARS_FOR_HIGHLIGHT,
    getContributionsFn: env.GET_CONTRIBUTIONS_FN,
  };
  const markdown = await getContributionsMarkdown(
    env.TOKEN,
    env.USERNAME,
    config,
  );
  return markdown;
};
