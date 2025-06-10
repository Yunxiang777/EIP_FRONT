import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Profile 頁面元件
 * 顯示與編輯使用者個人資料，並呈現帳戶統計資訊
 */
const Profile: React.FC = () => {
  // 取得全域認證狀態與更新方法
  const { user, updateProfile } = useAuth();

  // 控制是否進入編輯模式
  const [isEditing, setIsEditing] = useState(false);

  // 表單狀態，預設帶入 user 資料
  const [formData, setFormData] = useState({
    user_name: user?.user_name || '',
    user_email: user?.user_email || '',
    user_mobile: user?.user_mobile || '',
  });

  /**
   * 進入編輯模式，並同步 user 資料到表單
   */
  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      user_name: user?.user_name || '',
      user_email: user?.user_email || '',
      user_mobile: user?.user_mobile || '',
    });
  };


  /**
   * 儲存編輯內容，更新全域 user 狀態
   */
  const handleSave = async () => {
    try {
      const promise = updateProfile(formData);

      toast.promise(promise, {
        loading: '儲存中...',
        success: '資料更新成功！',
        error: '資料更新失敗，請稍後再試',
      });

      const success = await promise;
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      // toast.promise 已經處理了錯誤顯示，這裡可以做額外的錯誤處理
      console.error('Save failed:', error);
    }
  };

  /**
   * 取消編輯，還原表單內容
   */
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      user_name: user?.user_name || '',
      user_email: user?.user_email || '',
      user_mobile: user?.user_mobile || '',
    });
  };

  // 若尚未取得 user 資料則不渲染內容
  if (!user) return null;

  /**
   * 計算服務年資（以入職日期為基準）
   * 若 user_crdat 格式為 yyyy-mm-dd 或 yyyy/mm/dd
   */
  const getYearsOfService = () => {
    if (!user.user_crdat) return 0;

    // 假設格式固定為 "YYYY年M月D號"
    const match = user.user_crdat.match(/^(\d{4})年(\d{1,2})月(\d{1,2})號$/);
    if (!match) return 0;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, year, month, day] = match;
    const hireDate = new Date(Number(year), Number(month) - 1, Number(day)); // 月份是 0-indexed
    if (isNaN(hireDate.getTime())) return 0;

    const diff = Date.now() - hireDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header 區塊：大頭貼、姓名、編輯按鈕 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-blue-600" />
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-white">{user.user_name}</h1>
                  <p className="text-blue-100">員工編號：{user.user_id}</p>
                  <p className="text-blue-200 text-sm">帳號代碼：{user.user_code?.trim()}</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  編輯資料
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    儲存
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    取消
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content 區塊：個人資料表單 */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  姓名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.user_name}</p>
                )}
              </div>
              {/* 電子郵件 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  電子郵件
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.user_email}</p>
                )}
              </div>
              {/* 電話號碼 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  電話號碼
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.user_mobile}
                    onChange={(e) => setFormData({ ...formData, user_mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.user_mobile || '未設定'}</p>
                )}
              </div>
              {/* 入職日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  入職日期
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {user.user_crdat || '未提供'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card：帳戶統計資訊 */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">帳戶統計</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 服務年資 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {getYearsOfService()}
              </div>
              <div className="text-sm text-gray-600">服務年資</div>
            </div>
            {/* 年假剩餘（假資料，實務請串接後端） */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-gray-600">年假剩餘</div>
            </div>
            {/* 待審核請假（假資料，實務請串接後端） */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">待審核請假</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;