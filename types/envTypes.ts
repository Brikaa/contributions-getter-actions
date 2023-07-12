// Default values for some optional properties can be found in constants.ts
export interface Environment {
  TOKEN: string; // GitHub token
  USERNAME: string; // GitHub username

  // The format that is used in the repo header
  // You can use special keywords in this header that are replaced at runtime, check constants.ts
  // Default value exists in constants.ts
  HEADER_FORMAT?: string;

  // The format that is used in the highlighted repo header, special keywords in constants.ts can be used
  // Default value exists in constants.ts
  HIGHLIGHT_FORMAT?: string;

  FILE_BEFORE_PATH?: string; // The markdown file to put its content before the contributions content
  FILE_AFTER_PATH?: string; // The markdown file to put its content after the contributions content
  MINIMUM_STARS_FOR_HIGHLIGHT?: number; // The minimum number of stars required for a repo to be highlighted
  MONTHS_INTERVAL?: number; // The interval at which to get the contributions
}
