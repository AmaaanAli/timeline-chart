export const userEnums = [
  {
    id: 23,
    name: "Jack A",
    className: "green",
  },
  {
    id: 24,
    name: "John M",
    className: "light-blue",
  },
  {
    id: 27,
    name: "Richard M",
    className: "light-orange",
  },
];

// Enum for time ranges with corresponding units and values
export const timeEnums = {
  DAY_1: { unit: "days", value: 1 },
  DAY_2: { unit: "days", value: 2 },
  WEEK_1: { unit: "weeks", value: 1 },
  WEEK_2: { unit: "weeks", value: 2 },
  MONTH_1: { unit: "months", value: 1 },
};

// Use these enums to create the control options
export const controlsDays = [
  {
    name: "1 Day",
    value: timeEnums.DAY_1,
  },
  {
    name: "2 Days",
    value: timeEnums.DAY_2,
  },
  {
    name: "1 Week",
    value: timeEnums.WEEK_1,
  },
  {
    name: "2 Weeks",
    value: timeEnums.WEEK_2,
  },
  {
    name: "1 Month",
    value: timeEnums.MONTH_1,
  },
];
