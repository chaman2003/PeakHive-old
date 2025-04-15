import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { fadeInUp, transitions } from '../../utils/animationVariants';

// A reusable component that adds animations to any section
const AnimatedSection = ({
  children,
  className = "",
  variants = fadeInUp,
  transition = transitions.easeOut,
  delay = 0,
  viewportOnce = true,
  threshold = 0.1,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, amount: threshold }}
      variants={variants}
      transition={{ ...transition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection; 