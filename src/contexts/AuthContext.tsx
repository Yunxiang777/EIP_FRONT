import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import axios from 'axios';

// 建立 AuthContext，提供全域認證狀態與操作
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 負責管理登入狀態與相關操作
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * 使用者登入
   * @param userId 使用者帳號
   * @param password 使用者密碼
   * @returns 登入成功回傳 true，失敗回傳 false
   */
  const login = async (userId: string, password: string): Promise<boolean> => {
    try {
      // 呼叫後端 API 進行登入
      const res = await axios.post('http://localhost:5244/api/Auth/login', {
        useR_ID: userId,
        passwd: password,
      });

      // 檢查回傳資料結構與必要欄位
      const data = res.data;

      if (!data || !data.useR_ID) return false;

      // 將後端回傳資料轉換為前端 User 型別
      const user: User = {
        user_code: data.useR_CODE?.trim() ?? '',
        user_id: data.useR_ID,
        user_name: data.useR_NAME,
        user_email: data.email,
        user_mobile: data.mobile,
        user_crdat: data.crdat,
      };
      setUser(user);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // 可根據需求記錄錯誤訊息
      return false;
    }
  };

  /**
   * 使用者登出
   */
  const logout = () => {
    setUser(null);
    // 可加上清除 localStorage、cookie 等操作
  };

  /**
   * 更新使用者資料（僅更新已登入狀態下的部分欄位）
   * @param data 欲更新的使用者資料
   */
  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 自訂 hook：取得 AuthContext
 * 僅允許在 AuthProvider 內部呼叫
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};