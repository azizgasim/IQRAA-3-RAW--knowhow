export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export const pageTransition = {
  hidden: { opacity: 0, y: 12, opacity: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const glowPulse = {
  initial: { opacity: 0.2, scale: 1 },
  animate: {
    opacity: 0.6,
    scale: 1.05,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};