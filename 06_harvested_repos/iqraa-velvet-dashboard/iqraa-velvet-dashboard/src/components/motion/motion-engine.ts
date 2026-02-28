"use client";

import { Variants } from "framer-motion";

export const RoyalPageMotion: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const RoyalDirectional = {
  left: {
    opacity: 0,
    x: -20,
  },
  right: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export const VelvetGlow = {
  initial: { opacity: 0.12, scale: 1 },
  animate: {
    opacity: 0.4,
    scale: 1.04,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1.8,
      ease: "easeInOut",
    },
  },
};
