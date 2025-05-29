import { HashResult } from './hashUtils';

const HISTORY_KEY = 'hash_history';
const MAX_HISTORY_ITEMS = 100;

export interface HistoryFilter {
  algorithm?: string;
  inputType?: 'text' | 'file';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class HistoryService {
  static getHistory(): HashResult[] {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  static addToHistory(result: HashResult): void {
    try {
      const history = this.getHistory();
      history.unshift(result);

      // 限制历史记录数量
      if (history.length > MAX_HISTORY_ITEMS) {
        history.pop();
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  static clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  static searchHistory(filter: HistoryFilter): HashResult[] {
    const history = this.getHistory();

    return history.filter((item) => {
      if (filter.algorithm && item.algorithm !== filter.algorithm) {
        return false;
      }

      if (filter.inputType && item.inputType !== filter.inputType) {
        return false;
      }

      if (filter.dateRange) {
        const itemDate = new Date(item.timestamp);
        if (
          itemDate < filter.dateRange.start ||
          itemDate > filter.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  static exportHistory(): string {
    const history = this.getHistory();
    const csv = [
      ['时间', '算法', '输入类型', '文件名', '哈希值'].join(','),
      ...history.map((item) =>
        [
          new Date(item.timestamp).toLocaleString(),
          item.algorithm,
          item.inputType,
          item.filename || '-',
          item.hash
        ].join(',')
      )
    ].join('\n');

    return csv;
  }
}
