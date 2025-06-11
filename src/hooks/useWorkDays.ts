// src/hooks/useWorkDays.ts
import { useEffect, useState } from 'react';
import { getWorkTimeDates } from '@/api/workTime';

export const useWorkDays = (userCode: string | null) => {
    const [workDays, setWorkDays] = useState<number[]>([]);

    useEffect(() => {
        const fetchWorkDays = async () => {
            if (!userCode) return;
            const dates = await getWorkTimeDates(userCode);
            const dayList = dates
                .map(d => new Date(d))
                .filter(d => d.getMonth() === new Date().getMonth()) // 本月
                .map(d => d.getDate());
            setWorkDays(dayList);
        };

        fetchWorkDays();
    }, [userCode]);

    return workDays;
};
