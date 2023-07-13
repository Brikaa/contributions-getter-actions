const formatNumber = (no: number) => (no < 10 ? "0" : "") + no;
export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(
    date.getDate(),
  )}`;
