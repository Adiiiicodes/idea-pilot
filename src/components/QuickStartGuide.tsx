'use client';

import { useState, useEffect } from 'react';

interface QuickStartGuideProps {
  onClose: () => void;
}

export default function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Enter Your Concept",
      description: "Describe what you want to learn or build. It could be anything from 'a web app that tracks habits' to 'learn machine learning by building something cool'.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-primary-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      tip: "💡 Be specific! Instead of 'learn Python', try 'build a weather app with Python'"
    },
    {
      title: "Pick Your Skill Level",
      description: "Choose your experience level so we can tailor the project complexity and provide appropriate guidance for your current skills.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-secondary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      tip: "🎯 Beginner: New to the topic | Intermediate: Some experience | Advanced: Ready for challenges"
    },
    {
      title: "Build Your Project!",
      description: "Get a personalized project with step-by-step milestones, code snippets, resources, and an AI mentor to guide you through the entire journey.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      tip: "🚀 Save your projects, chat with the AI mentor, and track your progress!"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-dark-card rounded-xl shadow-2xl max-w-md w-full border border-dark-border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-text font-cabin">Welcome to IdeaPilot AI!</h2>
              <p className="text-sm text-dark-text-secondary font-source">Let's get you started</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-dark-element rounded-lg transition-colors text-dark-text-secondary hover:text-dark-text"
            title="Skip tutorial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-text font-cabin">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-dark-text-secondary font-source">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-dark-element rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-purple to-primary-blue h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-2xl font-bold text-dark-text mb-3 font-cabin">
              {steps[currentStep].title}
            </h3>
            <p className="text-dark-text leading-relaxed font-source mb-4">
              {steps[currentStep].description}
            </p>
            <div className="bg-primary-blue bg-opacity-10 border border-primary-blue border-opacity-30 rounded-lg p-3">
              <p className="text-primary-blue text-sm font-source">
                {steps[currentStep].tip}
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary-purple scale-125'
                    : index < currentStep
                    ? 'bg-secondary-green'
                    : 'bg-dark-element'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors font-cabin ${
                currentStep === 0
                  ? 'text-dark-text-secondary cursor-not-allowed'
                  : 'text-dark-text hover:bg-dark-element'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-dark-text-secondary hover:text-dark-text transition-colors font-medium font-cabin"
              >
                Skip Tutorial
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary-purple hover:bg-accent-pink text-dark-text px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 font-cabin"
              >
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-dark-element rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-yellow bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-dark-text font-cabin">Need help?</p>
                <p className="text-xs text-dark-text-secondary font-source">
                  The AI mentor is always available to guide you through your projects!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}