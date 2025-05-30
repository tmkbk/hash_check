import { useState, useEffect, useCallback } from 'react';
import { AnimationState, DemoExample } from '@/types/hash';

interface UseAnimationStateResult {
  animationState: AnimationState;
  toggleAnimation: () => void;
  setAnimationSpeed: (speed: AnimationState['speed']) => void;
  resetAnimation: () => void;
}

export const useAnimationState = (
  currentDemo: DemoExample | null,
  onStepChange: (text: string) => void
): UseAnimationStateResult => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    speed: 'normal',
    currentStep: 0
  });

  const toggleAnimation = useCallback(() => {
    setAnimationState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setAnimationSpeed = useCallback((speed: AnimationState['speed']) => {
    setAnimationState((prev) => ({ ...prev, speed }));
  }, []);

  const resetAnimation = useCallback(() => {
    setAnimationState({
      isPlaying: false,
      speed: 'normal',
      currentStep: 0
    });
  }, []);

  useEffect(() => {
    if (!currentDemo?.animation || !animationState.isPlaying) return;

    const speeds = { slow: 2000, normal: 1500, fast: 1000 };
    const interval = setInterval(() => {
      setAnimationState((prev) => {
        const nextStep =
          (prev.currentStep + 1) % currentDemo.animation!.sequence.length;
        onStepChange(currentDemo.animation!.sequence[nextStep]);
        return { ...prev, currentStep: nextStep };
      });
    }, speeds[animationState.speed]);

    return () => clearInterval(interval);
  }, [
    currentDemo,
    animationState.isPlaying,
    animationState.speed,
    onStepChange
  ]);

  return {
    animationState,
    toggleAnimation,
    setAnimationSpeed,
    resetAnimation
  };
};
