import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Building2, AlertCircle } from 'lucide-react';

/**
 * Login 頁面元件
 * 提供使用者輸入公號與密碼並登入
 */
const Login: React.FC = () => {
  // 狀態管理：userId（公號）、password、錯誤訊息、載入狀態
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 取得 context 提供的 login 方法
  const { login } = useAuth();
  // react-router 導頁 hook
  const navigate = useNavigate();

  /**
   * 表單送出處理
   * @param e 表單事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 開啟載入動畫
    setError('');       // 清除舊的錯誤訊息

    try {
      // 呼叫 context 的 login 方法，嘗試登入
      const success = await login(userId, password);

      if (success) {
        // 登入成功，導向個人資料頁
        navigate('/profile');
      } else {
        // 登入失敗，顯示錯誤訊息
        setError('公號或密碼錯誤');
      }
    } catch (err) {
      // 例外處理（例如網路錯誤）
      setError('登入失敗，請稍後再試');
    } finally {
      setIsLoading(false); // 關閉載入動畫
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* 標題區塊 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">員工管理系統</h2>
          <p className="text-gray-600 mb-8">請登入您的帳戶以繼續</p>
        </div>

        {/* 登入表單區塊 */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 錯誤訊息顯示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 公號輸入 */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                公號
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="輸入您的公號"
                autoComplete="username"
              />
            </div>

            {/* 密碼輸入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="輸入您的密碼"
                autoComplete="current-password"
              />
            </div>

            {/* 登入按鈕 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                // 載入動畫
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  登入
                </>
              )}
            </button>
          </form>

          {/* 測試帳號資訊 */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              <p className="mb-2">測試帳號：</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p><strong>公號：</strong> KG0588</p>
                <p><strong>密碼：</strong> 0000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;