import {
  HashStats,
  HashComparison,
  ComparisonAnalysisResult
} from '../types/hash';

export const hexToBinary = (hex: string): string => {
  return hex
    .split('')
    .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('');
};

export const getAvalancheEffectDescription = (effect: number): string => {
  if (effect > 45) return '优秀';
  if (effect > 35) return '良好';
  if (effect > 25) return '一般';
  return '较弱';
};

export const getDiffDescription = (percentage: number): string => {
  if (percentage > 75) return '差异显著';
  if (percentage > 50) return '差异较大';
  if (percentage > 25) return '存在差异';
  return '差异较小';
};

export const getEntropyQuality = (entropy: number): string => {
  if (entropy > 7) return '高';
  if (entropy > 5) return '中';
  return '低';
};

export const calculateHashStats = (hash: string): HashStats => {
  const hexCount = hash.split('').reduce((acc, char) => {
    acc[char] = (acc[char] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distribution = Object.entries(hexCount).sort((a, b) => b[1] - a[1]);
  const zeros = distribution.find(([k]) => k === '0')?.[1] || 0;
  const ones = distribution.reduce((acc, [_, v]) => acc + v, 0) - zeros;

  // 计算香农熵
  const entropy = distribution.reduce((acc, [_, count]) => {
    const p = count / hash.length;
    return acc - p * Math.log2(p);
  }, 0);

  return { distribution, zeros, ones, entropy };
};

export const calculateHashComparison = (
  currentHash: string,
  comparisonHash: string,
  inputText: string,
  comparisonText: string
): HashComparison => {
  const diffPositions: number[] = [];
  let diffCount = 0;
  let diffBits = 0;

  for (let i = 0; i < currentHash.length; i++) {
    if (currentHash[i] !== comparisonHash[i]) {
      diffPositions.push(i);
      diffCount++;

      const bin1 = parseInt(currentHash[i], 16).toString(2).padStart(4, '0');
      const bin2 = parseInt(comparisonHash[i], 16).toString(2).padStart(4, '0');
      for (let j = 0; j < 4; j++) {
        if (bin1[j] !== bin2[j]) diffBits++;
      }
    }
  }

  // 计算输入文本的差异位数
  const inputDiffBits = Array.from(inputText).reduce((count, char, i) => {
    return count + (char !== comparisonText[i] ? 1 : 0);
  }, 0);

  // 计算哈希值的差异位数（二进制级别）
  const mainBinary = hexToBinary(currentHash);
  const compBinary = hexToBinary(comparisonHash);
  const hashDiffBits = mainBinary.split('').reduce((count, bit, i) => {
    return count + (bit !== compBinary[i] ? 1 : 0);
  }, 0);

  // 计算雪崩效应：哈希值变化位数与输入变化位数的比率
  const avalancheEffect =
    inputDiffBits > 0 ? (hashDiffBits / mainBinary.length) * 100 : 0;

  return {
    identical: diffCount === 0,
    diffCount,
    diffPositions,
    diffBits,
    diffPercentage: (diffBits / (currentHash.length * 4)) * 100,
    entropy: calculateHashStats(currentHash).entropy,
    avalancheEffect
  };
};

export const generateComparisonAnalysis = (
  currentHash: string,
  comparisonHash: string,
  hashComparison: HashComparison
): ComparisonAnalysisResult => {
  const frontHalfDiffs = hashComparison.diffPositions.filter(
    (pos) => pos < currentHash.length / 2
  );
  const backHalfDiffs = hashComparison.diffPositions.filter(
    (pos) => pos >= currentHash.length / 2
  );

  const maxConsecutiveDiff = hashComparison.diffPositions.reduce(
    (max, pos, i, arr) => {
      if (i === 0) return 1;
      const curr = pos - arr[i - 1] === 1 ? max + 1 : 1;
      return Math.max(max, curr);
    },
    1
  );

  const diffSegments = hashComparison.diffPositions.reduce(
    (count, pos, i, arr) => {
      if (i === 0) return 1;
      return pos - arr[i - 1] > 1 ? count + 1 : count;
    },
    1
  );

  const maxGap = Math.max(
    ...hashComparison.diffPositions.map((pos, i, arr) =>
      i > 0 ? pos - arr[i - 1] : 0
    )
  );

  const charDistribution = Array.from(
    new Set([...currentHash.split(''), ...comparisonHash.split('')])
  )
    .sort()
    .map((char) => ({
      char,
      mainCount: currentHash.split(char).length - 1,
      compCount: comparisonHash.split(char).length - 1
    }));

  const frontHalfPercentage =
    (frontHalfDiffs.length / (currentHash.length / 2)) * 100;
  const backHalfPercentage =
    (backHalfDiffs.length / (currentHash.length / 2)) * 100;

  const summary = hashComparison.identical
    ? '两个哈希值完全相同，表明输入内容未发生任何改变。'
    : `两个哈希值存在 ${
        hashComparison.diffBits
      } 位差异（${hashComparison.diffPercentage.toFixed(1)}%）。` +
      `${
        hashComparison.avalancheEffect > 45
          ? ' 表现出良好的雪崩效应，微小的输入改变导致了显著的输出差异。'
          : ' 雪崩效应不够理想，可能需要进一步分析输入差异。'
      }` +
      `差异主要集中在${
        frontHalfDiffs.length > backHalfDiffs.length ? '前半部分' : '后半部分'
      }，` +
      `最长连续差异为 ${maxConsecutiveDiff} 位。`;

  return {
    frontHalfDiffs,
    backHalfDiffs,
    maxConsecutiveDiff,
    diffSegments,
    maxGap,
    charDistribution,
    frontHalfPercentage,
    backHalfPercentage,
    summary
  };
};
