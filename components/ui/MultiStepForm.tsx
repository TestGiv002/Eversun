'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, Check } from '@phosphor-icons/react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  children,
  onSubmit,
  onCancel,
}: MultiStepFormProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    } else if (onSubmit) {
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Étape {currentStep + 1} sur {steps.length}
          </h2>
          <span className="text-sm font-semibold text-tertiary">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400"
            initial={{ width: `${(currentStep / steps.length) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                    : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-tertiary text-tertiary'
                }`}
                initial={false}
                animate={{ scale: index === currentStep ? 1.1 : 1 }}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" weight="bold" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span
                className={`text-xs mt-2 text-center font-medium transition-colors duration-300 ${
                  index === currentStep
                    ? 'text-amber-600 dark:text-amber-400'
                    : index < currentStep
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-tertiary'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-primary">
        <div className="flex-1">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg border border-primary text-secondary font-semibold hover:bg-secondary transition-all duration-200"
            >
              Annuler
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 rounded-lg border border-primary text-secondary font-semibold hover:bg-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
            Précédent
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md hover:shadow transition-all duration-200 flex items-center gap-2 hover:scale-[1.01]"
          >
            {currentStep === steps.length - 1 ? 'Soumettre' : 'Suivant'}
            <CaretRight className="w-4 h-4" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
