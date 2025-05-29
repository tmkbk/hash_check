import { useState, ChangeEvent } from 'react';
import CryptoJS from 'crypto-js';

export default function Demo() {
  const [text, setText] = useState('Hello, World!');
  const [modifiedText, setModifiedText] = useState('Hello, World!');

  const originalHash = CryptoJS.MD5(text).toString();
  const modifiedHash = CryptoJS.MD5(modifiedText).toString();
  const isModified = originalHash !== modifiedHash;

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleModifiedTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setModifiedText(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">哈希函数演示</h2>

        <div className="space-y-8">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">什么是哈希函数？</h3>
            <p className="text-gray-700">
              哈希函数是一种将任意长度的数据转换成固定长度输出的算法。它具有以下特点：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>对于相同的输入总是产生相同的输出</li>
              <li>即使输入只改变一个字符，输出也会显著不同</li>
              <li>从输出推算出输入在计算上是不可行的</li>
              <li>不同的输入产生相同输出的概率极低</li>
            </ul>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-4">交互式演示</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  原始文本
                </label>
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  className="input-field"
                  rows={3}
                />
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700">MD5哈希值：</span>
                  <code className="text-sm bg-gray-100 p-1 rounded break-all">{originalHash}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  修改后的文本
                </label>
                <textarea
                  value={modifiedText}
                  onChange={handleModifiedTextChange}
                  className="input-field"
                  rows={3}
                />
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700">MD5哈希值：</span>
                  <code className="text-sm bg-gray-100 p-1 rounded break-all">{modifiedHash}</code>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-md ${isModified ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-sm ${isModified ? 'text-red-700' : 'text-green-700'}`}>
                {isModified ? '⚠️ 文本已被修改！哈希值不匹配' : '✅ 文本未被修改，哈希值匹配'}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">应用场景</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-base font-medium mb-2">数据安全</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>密码存储：存储密码的哈希值而不是明文</li>
                  <li>文件完整性检查：验证文件是否被篡改</li>
                </ul>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">区块链技术</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>数字签名：作为数字签名算法的一部分</li>
                  <li>区块链：用于创建交易的唯一标识符</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 