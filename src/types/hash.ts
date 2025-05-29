export interface HashBit {
  value: string;
  changed: boolean;
}

export interface DemoExample {
  title: string;
  description: string;
  input: string;
  animation?: {
    sequence: string[];
    interval: number;
  };
}

export interface HashStats {
  distribution: Array<[string, number]>;
  zeros: number;
  ones: number;
  entropy: number;
}

export interface AnimationState {
  isPlaying: boolean;
  speed: 'slow' | 'normal' | 'fast';
  currentStep: number;
}

export interface HashComparison {
  identical: boolean;
  diffCount: number;
  diffPositions: number[];
  diffBits: number;
  diffPercentage: number;
  entropy: number;
  avalancheEffect: number;
}

export interface BinaryAnalysis {
  binaryString: string;
  zeros: number;
  ones: number;
  zeroPercentage: number;
  onePercentage: number;
}

export interface ComparisonAnalysisResult {
  frontHalfDiffs: number[];
  backHalfDiffs: number[];
  maxConsecutiveDiff: number;
  diffSegments: number;
  maxGap: number;
  charDistribution: Array<{
    char: string;
    mainCount: number;
    compCount: number;
  }>;
  frontHalfPercentage: number;
  backHalfPercentage: number;
  summary: string;
}

export type TabType = 'visualization' | 'analysis' | 'tutorial';
