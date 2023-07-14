import {
  Config as ContributionsGetterConfig,
  getContributions,
} from "contributions-getter";

export type GetContributions = typeof getContributions;

export interface Config {
  contributionsGetterConfig?: ContributionsGetterConfig;
  headerFormat?: string;
  highlightFormat?: string;
  fileBefore?: string;
  fileAfter?: string;
  minimumStarsForHighlight?: number;
  getContributionsFn?: GetContributions;
}

export const GET_CONTRIBUTIONS_TYPES = ["EMPTY", "SINGLE", "MULTIPLE"] as const;

export type GetContributionsType = (typeof GET_CONTRIBUTIONS_TYPES)[number];
