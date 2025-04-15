// Animation variants for framer-motion
// These can be reused across different components for consistent animations

// Fade in from bottom
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Fade in from left
export const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

// Fade in from right
export const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
};

// Simple fade in
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

// Scale up effect
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

// Staggered container for children animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Card hover effect
export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.2 } }
};

// Custom transition presets
export const transitions = {
  easeIn: { duration: 0.4, ease: "easeIn" },
  easeOut: { duration: 0.4, ease: "easeOut" },
  bounce: { type: "spring", stiffness: 300, damping: 15 },
  gentle: { duration: 0.6, ease: [0.6, 0.01, -0.05, 0.95] }
}; 