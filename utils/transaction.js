function countTax(amount) {
  return (amount * 5) / 100;
}

function countFees(amount) {
  return (amount * 1) / 100;
}

function getWeekday(day) {
  return day >= 1 && day <= 5;
}

function getTransactionTime(hour) {
  return hour >= 8 && hour < 15;
}

function getNextWeekday(date) {
  const resultDate = new Date(date);
  if (resultDate.getDay() === 0 || resultDate.getDay() === 5 || resultDate.getDay() === 6) {
    // Jika di hari Jumat > 15.00, Sabtu, Minggu, menjadi hari senin
    // resultDate.setDate(resultDate.getDate() + ((1 + 7 - resultDate.getDay()) % 7));
    resultDate.setDate(resultDate.getDate() + (8 - resultDate.getDay()));
    resultDate.setHours(8, 0, 0, 0);
  } else if (resultDate.getHours() >= 15) {
    // Jika di hari senin - kamis > 15.00, menjadi hari berikutnya
    resultDate.setDate(resultDate.getDate() + 1);
    resultDate.setHours(8, 0, 0, 0);
  }
  return resultDate;
}

function getTransactionDate() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentHour = currentDate.getHours();
  const isWeekday = getWeekday(currentDay);
  const isTransactionTime = getTransactionTime(currentHour);
  const transactionDate = isWeekday && isTransactionTime ? currentDate : getNextWeekday(currentDate);

  return transactionDate;
}

function getUnits(amount, fundNav) {
  const units = amount / fundNav;
  return units;
}

function switchUnits(units, sourceFundNav, targetFundNav) {
  const amount = units * sourceFundNav;
  const newUnits = amount / targetFundNav;
  return newUnits;
}

module.exports = {
  countTax,
  countFees,
  getTransactionDate,
  getUnits,
  switchUnits,
};
