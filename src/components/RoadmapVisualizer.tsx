'use client';

import { useState, useEffect, useRef } from 'react';
import { Milestone } from '@/types/project';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapVisualizerProps {
  milestones: Milestone[];
  onMilestoneClick?: (index: number) => void;
  onComplete?: (index: number) => void;
  completedMilestones?: number[];
  className?: string;
}

export default function RoadmapVisualizer({
  milestones,
  onMilestoneClick,
  onComplete,
  completedMilestones = [],
  className = '',
}: RoadmapVisualizerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const detailVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Handle click on milestone
  const handleMilestoneClick = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
      if (onMilestoneClick) onMilestoneClick(index);
    }
  };

  // Handle marking milestone as complete
  const handleComplete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) onComplete(index);
  };

  // Calculate progress percentage
  const progressPercentage = milestones.length > 0 
    ? (completedMilestones.length / milestones.length) * 100 
    : 0;

  // Set mounted state to avoid SSR hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Progress bar */}
      <div className="relative h-2 w-full bg-gray-200 dark:bg-dark-element rounded-full mb-8 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary-purple"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-purple to-accent-pink opacity-30"
          style={{ width: '100%' }}
        />
      </div>

      {/* Progress percentage */}
      <div className="text-right mb-6">
        <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
          Progress: {completedMilestones.length}/{milestones.length} (
          {Math.round(progressPercentage)}%)
        </span>
      </div>

      {/* Milestones */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {milestones.map((milestone, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`relative rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
              expandedIndex === index 
                ? 'ring-2 ring-primary-purple' 
                : 'hover:shadow-lg'
            } ${
              completedMilestones.includes(index)
                ? 'border-l-4 border-secondary-green'
                : 'border-l-4 border-gray-200 dark:border-dark-border'
            }`}
          >
            {/* Milestone header */}
            <div
              className={`p-4 cursor-pointer flex items-center justify-between ${
                completedMilestones.includes(index)
                  ? 'bg-secondary-green/10'
                  : 'bg-white dark:bg-dark-card'
              }`}
              onClick={() => handleMilestoneClick(index)}
            >
              <div className="flex items-center space-x-4">
                {/* Checkbox */}
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => handleComplete(index, e)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      completedMilestones.includes(index)
                        ? 'bg-secondary-green text-white'
                        : 'border-2 border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-element'
                    }`}
                  >
                    {completedMilestones.includes(index) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Milestone info */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text">
                    {milestone.task}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Estimated time: {milestone.estimatedTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Resource link */}
                {milestone.resourceLink && (
                  <a
                    href={milestone.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm px-3 py-1 bg-primary-blue/10 text-primary-blue dark:text-primary-blue rounded hover:bg-primary-blue/20 transition-colors"
                  >
                    Resources
                  </a>
                )}

                {/* Expand/collapse button */}
                <button
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-element transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMilestoneClick(index);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 dark:text-dark-text-secondary transition-transform ${
                      expandedIndex === index ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Milestone details */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  variants={detailVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`overflow-hidden ${
                    completedMilestones.includes(index)
                      ? 'bg-secondary-green/5'
                      : 'bg-gray-50 dark:bg-dark-element'
                  }`}
                >
                  <div className="p-4 pt-2 border-t border-gray-200 dark:border-dark-border">
                    <div className="prose dark:prose-invert max-w-none">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        Description
                      </h4>
                      <p className="text-gray-600 dark:text-dark-text-secondary">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating action button for mobile */}
      {expandedIndex !== null && (
        <motion.button
          className="md:hidden fixed bottom-6 right-6 z-10 p-3 bg-primary-purple text-white rounded-full shadow-lg hover:bg-accent-pink transition-colors"
          onClick={() => setExpandedIndex(null)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
} 