import {
  Config as ContributionsGetterConfig,
  getContributions,
} from "contributions-getter";

export type GetContributionsType = typeof getContributions;

export interface Config {
  contributionsGetterConfig?: ContributionsGetterConfig;
  headerFormat?: string;
  highlightFormat?: string;
  fileBefore?: string;
  fileAfter?: string;
  minimumStarsForHighlight?: number;
  getContributionsFn?: GetContributionsType;
}
