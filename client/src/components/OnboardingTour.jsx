import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Play, Upload, MessageSquare, CheckCircle2, BookOpen } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Welcome to SkyCuts Studio',
    description: 'Your video editing workspace. Let us show you around so you can get the most out of your experience.',
    icon: <Play size={32} />,
    position: 'center',
  },
  {
    id: 2,
    title: 'Your Projects',
    description: 'View all your active projects here. Each card shows the project status, deadline, and quick actions.',
    icon: <CheckCircle2 size={32} />,
    position: 'top',
  },
  {
    id: 3,
    title: 'Submitting Assets',
    description: 'Click on any project to upload your raw footage. We support video files, images, and audio. The editor will review and start working on your cut.',
    icon: <Upload size={32} />,
    position: 'top',
  },
  {
    id: 4,
    title: 'Review & Feedback',
    description: 'When your video is ready, you can review it frame-by-frame. Add timestamped comments to request specific changes.',
    icon: <MessageSquare size={32} />,
    position: 'top',
  },
  {
    id: 5,
    title: 'Real-time Chat',
    description: 'Communicate directly with your editor through the built-in chat. Get instant updates and clarify any questions.',
    icon: <MessageSquare size={32} />,
    position: 'top',
  },
  {
    id: 6,
    title: 'You\'re All Set!',
    description: 'You can always access this tutorial later by clicking the help icon in the top right corner.',
    icon: <BookOpen size={32} />,
    position: 'center',
  },
];

export default function OnboardingTour({ onComplete, isOpen }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const spotlightRef = useRef(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
        }}
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 480,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: 32,
          zIndex: 9999,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4,
            borderRadius: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={20} />
        </button>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            gap: 6,
            marginBottom: 8,
          }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i <= currentStep ? 'var(--accent-purple)' : 'var(--border-subtle)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                {step.icon}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 8 }}>
                  {step.title}
                </h2>
              </div>
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 32,
          paddingTop: 20,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              background: 'none',
              border: 'none',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>

        {/* Skip Link */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 12,
              padding: 4,
            }}
          >
            Skip tour
          </button>
        )}
      </motion.div>
    </>
  );
}
