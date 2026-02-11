
export const parseTimeToMs = (time: string | number): number => {
    if (typeof time === 'number') return time;

    const units: Record<string, number> = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    const match = time.match(/^(\d+)(ms|s|m|h|d)$/);

    if (!match) {
        throw new Error(`Invalid time format: ${time}. Use format like "15m", "7d", "30s"`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
};

