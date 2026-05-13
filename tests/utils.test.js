const { calculateStreak, getCurrentWeek, calculateWeekFromDate } = require('../js/utils.js');

describe('Utils testing', () => {

  describe('calculateStreak', () => {
    it('should return 0 for empty logs', () => {
      expect(calculateStreak([])).toBe(0);
      expect(calculateStreak(null)).toBe(0);
    });

    it('should handle single day streak if logged today', () => {
      const today = new Date().toISOString().split('T')[0];
      const logs = [{ date: today }];
      expect(calculateStreak(logs)).toBe(1);
    });

    it('should ignore multiple logs on the same day', () => {
      const today = new Date().toISOString().split('T')[0];
      const logs = [
        { date: today, id: 1 },
        { date: today, id: 2 }
      ];
      expect(calculateStreak(logs)).toBe(1);
    });

    it('should calculate consecutive days properly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const logs = [
        { date: today.toISOString().split('T')[0] },
        { date: yesterday.toISOString().split('T')[0] },
        { date: twoDaysAgo.toISOString().split('T')[0] }
      ];
      expect(calculateStreak(logs)).toBe(3);
    });

    it('should return 0 if the last log was more than 1 day ago', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const logs = [
        { date: threeDaysAgo.toISOString().split('T')[0] }
      ];
      expect(calculateStreak(logs)).toBe(0);
    });
  });

  describe('Date tracking functions', () => {
    it('should calculate week correctly from a given date', () => {
      // Assuming start date is 2025-12-29 as hardcoded in the codebase
      const firstDay = new Date('2025-12-29');
      expect(calculateWeekFromDate(firstDay)).toBe(1);
      
      const eighthDay = new Date('2026-01-05');
      expect(calculateWeekFromDate(eighthDay)).toBe(2);
    });
  });
});
