'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface MarkerRippleProps {
  color: string;
}

const MarkerRipple: React.FC<MarkerRippleProps> = ({ color }) => {
  return (
    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className='absolute rounded-full'
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 2.5,
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
          style={{
            backgroundColor: color,
            width: '100%',
            height: '100%',
          }}
        />
      ))}
    </div>
  );
};

export default MarkerRipple;
