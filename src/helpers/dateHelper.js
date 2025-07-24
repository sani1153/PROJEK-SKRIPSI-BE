function getTodayDateStr() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  function getTomorrowDateStr() {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return now.toISOString().split('T')[0];
  }
  
  function isSameDate(date1, date2) {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }
  
  module.exports = { getTodayDateStr, getTomorrowDateStr, isSameDate };