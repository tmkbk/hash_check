import { useState, useCallback, useEffect } from 'react';
import { DemoExample, AnimationState } from '@/types/hash';

export const useAnimationState = (
  currentDemo: DemoExample | null,
  onInputChange: (text: string) => void
) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    speed: 'normal',
    currentStep: 0
  });

  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const getAnimationInterval = useCallback((speed: AnimationState['speed']) => {
    switch (speed) {
      case 'slow':
        return 3000; // 慢速：3秒
      case 'fast':
        return 1500; // 快速：1.5秒
      default:
        return 2000; // 正常：2秒
    }
  }, []);

  const toggleAnimation = useCallback(() => {
    if (!currentDemo?.animation) return;

    setAnimationState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
      currentStep: !prev.isPlaying ? prev.currentStep : 0
    }));
  }, [currentDemo]);

  const setAnimationSpeed = useCallback((speed: AnimationState['speed']) => {
    setAnimationState((prev) => ({ ...prev, speed }));
  }, []);

  const resetAnimation = useCallback(() => {
    if (animationTimer) {
      clearInterval(animationTimer);
      setAnimationTimer(null);
    }
    setAnimationState({
      isPlaying: false,
      speed: 'normal',
      currentStep: 0
    });
  }, [animationTimer]);

  // 更新动画序列
  const updateAnimationStep = useCallback(() => {
    if (!currentDemo?.animation) return;
    const sequence = currentDemo.animation.sequence;

    setAnimationState((prev) => {
      const nextStep = (prev.currentStep + 1) % sequence.length;
      onInputChange(sequence[nextStep]);
      return { ...prev, currentStep: nextStep };
    });
  }, [currentDemo, onInputChange]);

  useEffect(() => {
    if (!currentDemo?.animation || !animationState.isPlaying) {
      if (animationTimer) {
        clearInterval(animationTimer);
        setAnimationTimer(null);
      }
      return;
    }

    // 立即执行第一步
    updateAnimationStep();

    // 设置定时器进行后续步骤
    const interval = setInterval(
      updateAnimationStep,
      getAnimationInterval(animationState.speed)
    );
    setAnimationTimer(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
        setAnimationTimer(null);
      }
    };
  }, [
    currentDemo,
    animationState.isPlaying,
    animationState.speed,
    getAnimationInterval,
    updateAnimationStep
  ]);

  return {
    animationState,
    toggleAnimation,
    setAnimationSpeed,
    resetAnimation
  };
};
