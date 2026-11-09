export const MOTION_TOKENS = {
  durations: {
    fast: 0.12,
    normal: 0.24,
    medium: 0.48,
    slow: 0.9,
  },
  easeOut: [0.16, 1, 0.3, 1] as const,
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
};
