
// src/api/workTime.ts
import axios from 'axios';

/**
 * 根據使用者代碼取得該月的上班日清單
 * @param userCode 使用者 user_code
 */
export const getWorkTimeDates = async (userCode: string): Promise<string[]> => {
    const res = await axios.get(
        `http://localhost:5244/api/WorkTime/${userCode}`
    );
    return res.data;
};
