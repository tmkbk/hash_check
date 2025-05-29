import { useState, useCallback, useEffect } from 'react';
import {
  HashBit,
  HashStats,
  HashComparison,
  BinaryAnalysis,
  ComparisonAnalysisResult
} from '../types/hash';
import {
  calculateHashStats,
  calculateHashComparison,
  generateComparisonAnalysis
} from '../utils/hashAnalysis';

const calculateSHA256 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

interface UseHashAnalysisResult {
  currentHash: string;
  comparisonHash: string;
  hashBits: HashBit[];
  hashStats: HashStats | null;
  hashComparison: HashComparison | null;
  hashAnalysis: BinaryAnalysis | null;
  comparisonAnalysis: ComparisonAnalysisResult | null;
  updateHash: (text: string, isComparison?: boolean) => Promise<void>;
}

export const useHashAnalysis = (
  inputText: string,
  comparisonText: string
): UseHashAnalysisResult => {
  const [currentHash, setCurrentHash] = useState('');
  const [comparisonHash, setComparisonHash] = useState('');
  const [hashBits, setHashBits] = useState<HashBit[]>([]);
  const [hashStats, setHashStats] = useState<HashStats | null>(null);
  const [hashComparison, setHashComparison] = useState<HashComparison | null>(
    null
  );
  const [hashAnalysis, setHashAnalysis] = useState<BinaryAnalysis | null>(null);
  const [comparisonAnalysis, setComparisonAnalysis] =
    useState<ComparisonAnalysisResult | null>(null);

  const updateHash = useCallback(async (text: string, isComparison = false) => {
    const hash = await calculateSHA256(text);
    if (isComparison) {
      setComparisonHash(hash);
    } else {
      setCurrentHash(hash);
      setHashBits(
        hash.split('').map((char: string) => ({ value: char, changed: false }))
      );
      const stats = calculateHashStats(hash);
      setHashStats(stats);
    }
  }, []);

  useEffect(() => {
    void updateHash(inputText);
  }, [inputText, updateHash]);

  useEffect(() => {
    if (comparisonText) {
      void updateHash(comparisonText, true);
    } else {
      setComparisonHash('');
    }
  }, [comparisonText, updateHash]);

  useEffect(() => {
    if (currentHash && comparisonHash) {
      const comparison = calculateHashComparison(
        currentHash,
        comparisonHash,
        inputText,
        comparisonText
      );
      setHashComparison(comparison);
      const analysis = generateComparisonAnalysis(
        currentHash,
        comparisonHash,
        comparison
      );
      setComparisonAnalysis(analysis);
    } else {
      setHashComparison(null);
      setComparisonAnalysis(null);
    }
  }, [currentHash, comparisonHash, inputText, comparisonText]);

  return {
    currentHash,
    comparisonHash,
    hashBits,
    hashStats,
    hashComparison,
    hashAnalysis,
    comparisonAnalysis,
    updateHash
  };
};
