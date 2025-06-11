// src/components/Schedule.tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkDays } from '@/hooks/useWorkDays';

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

const Schedule: React.FC = () => {
    const { user } = useAuth();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based
    const daysInMonth = getDaysInMonth(year, month);

    const workDays = useWorkDays(user?.user_code ?? null);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {year}年 {month + 1}月 個人班表
            </h2>
            <div className="grid grid-cols-7 gap-2 bg-white rounded-lg shadow p-4">
                {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
                    <div key={w} className="text-center font-semibold text-blue-700">{w}</div>
                ))}
                {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
                    <div key={'empty-' + i}></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isWorkDay = workDays.includes(day);
                    return (
                        <div
                            key={day}
                            className={`text-center py-2 rounded-lg border ${isWorkDay
                                ? 'bg-red-100 text-red-600 font-bold border-red-300'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 text-sm text-gray-500">
                <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 mr-2 align-middle"></span>
                紅色為上班日
            </div>
        </div>
    );
};

export default Schedule;
