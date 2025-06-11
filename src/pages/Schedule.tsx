import React from 'react';

// 取得當月的天數
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

// 假設這些是本月有上班的日期（可改成從API取得）
const workDays = [1, 2, 3, 6, 7, 10, 13, 15, 18, 20, 22, 25, 27, 28];

const Schedule: React.FC = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based
    const daysInMonth = getDaysInMonth(year, month);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {year}年 {month + 1}月 個人班表
            </h2>
            <div className="grid grid-cols-7 gap-2 bg-white rounded-lg shadow p-4">
                {/* 星期標題 */}
                {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
                    <div key={w} className="text-center font-semibold text-blue-700">{w}</div>
                ))}
                {/* 空白填充（本月第一天是星期幾） */}
                {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
                    <div key={'empty-' + i}></div>
                ))}
                {/* 日期格子 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isWorkDay = workDays.includes(day);
                    return (
                        <div
                            key={day}
                            className={`text-center py-2 rounded-lg border ${isWorkDay ? 'bg-red-100 text-red-600 font-bold border-red-300' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
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