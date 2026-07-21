export const dateParse = (input: string) => {
  if (input.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const [day, month, year] = input.split(".");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};
