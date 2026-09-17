export const settle = [0.22, 1, 0.36, 1] as const;
export const instrument = [0.4, 0, 0.2, 1] as const;

export const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const revealTransition = (delay = 0) => ({
  duration: 0.64,
  ease: settle,
  delay,
});

export const staggerChildren = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
