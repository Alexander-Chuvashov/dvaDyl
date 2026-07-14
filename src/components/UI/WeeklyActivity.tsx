import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { DatabaseService } from '../../services/DatabaseService';

const WeeklyActivity: React.FC = () => {
    const { userId } = useAppStore();
    const [data, setData] = useState<{ date: string; xp: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        DatabaseService.getWeeklyXp(userId)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return <div className="text-sm text-secondary">Загрузка...</div>;
    }

    const maxXP = Math.max(...data.map(d => d.xp), 1);

    return (
        <div className="w-full h-16">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, maxXP]} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'var(--text-primary)' }}
                        formatter={value => [`${value} XP`, '']}
                    />
                    <Bar
                        dataKey="xp"
                        fill="var(--gold)"
                        radius={[2, 2, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyActivity;
