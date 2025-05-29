export const INTERACTIVE_DEMOS = [
  {
    title: '单字符变化',
    description: '演示如何一个字符的改变会导致整个哈希值的剧烈变化',
    input: 'Hello World',
    animation: {
      sequence: [
        'Hello World',
        'Hello World!',
        'Hello World.',
        'Hello World,',
        'Hello World'
      ],
      interval: 1500
    }
  },
  {
    title: '空白字符',
    description: '展示空格和不可见字符对哈希值的影响',
    input: 'Hello  World',
    animation: {
      sequence: [
        'Hello World',
        'Hello  World',
        'Hello   World',
        'HelloWorld',
        'Hello World'
      ],
      interval: 1500
    }
  },
  {
    title: '大小写敏感',
    description: '展示大小写变化对哈希值的影响',
    input: 'Password123',
    animation: {
      sequence: [
        'Password123',
        'password123',
        'PASSWORD123',
        'PaSsWoRd123',
        'Password123'
      ],
      interval: 1500
    }
  },
  {
    title: '长文本测试',
    description: '验证无论输入多长，输出始终是固定长度',
    input:
      '这是一段很长的文本，用来测试哈希函数的特性。无论输入文本有多长，哈希值的长度都是固定的。这就是哈希函数的一个重要特性。'
  },
  {
    title: '特殊字符',
    description: '测试特殊字符和Unicode字符对哈希值的影响',
    input: '你好，世界！@#¥%……&*',
    animation: {
      sequence: [
        '你好，世界！@#¥%……&*',
        'Hello, World!@#$%^&*',
        '🌍🌎🌏👋😊',
        '你好，世界！@#¥%……&*'
      ],
      interval: 2000
    }
  },
  {
    title: '零值测试',
    description: '测试全零输入的哈希分布特性',
    input: '0000000000',
    animation: {
      sequence: ['0000000000', '1111111111', 'aaaaaaaaaa', '0000000000'],
      interval: 1500
    }
  }
];
