'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, Plus, Check } from 'lucide-react';

function timeAgo(date: number) {
    const seconds = Math.floor((new Date().getTime() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' años';
    interval = seconds / 2592000;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' meses';
    interval = seconds / 86400;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' días';
    interval = seconds / 3600;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' horas';
    interval = seconds / 60;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' minutos';
    return 'hace unos segundos';
}

export default function ActivityFeed() {
    const { items, members } = useStore();

    // Generate recent activities based on items (mocking a feed)
    const activities = useMemo(() => {
        const feed = [];
        const now = new Date().getTime();
        
        // Items added recently
        for (const item of items) {
            if (!item.deleted_at && item.created_at) {
                feed.push({
                    id: `add-${item.id}`,
                    type: 'add',
                    item: item.name,
                    userId: item.created_by,
                    timestamp: new Date(item.created_at).getTime(),
                });
            }
            
            // Items bought recently (if in pantry and has bought_by OR updated_at)
            // Note: Since we don't have exact buy time, we estimate it with updated_at if bought_by exists
            if (item.in_pantry && (item.bought_by || item.updated_at)) {
                // If it has updated_at, use it. Else fallback to created_at + a bit
                const t = item.updated_at ? new Date(item.updated_at).getTime() : new Date(item.created_at).getTime() + 1000;
                feed.push({
                    id: `buy-${item.id}`,
                    type: 'buy',
                    item: item.name,
                    userId: item.bought_by || item.created_by,
                    timestamp: t,
                });
            }
        }

        // Sort by timestamp desc and take top 5
        return feed
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
    }, [items]);

    if (activities.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mt-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Actividad Reciente</h2>
            </div>
            
            <div className="space-y-4">
                {activities.map((activity) => {
                    const member = members.find(m => m.id === activity.userId);
                    const name = member?.full_name?.split(' ')[0] || 'Alguien';
                    
                    return (
                        <div key={activity.id} className="flex gap-3">
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                activity.type === 'add' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                            }`}>
                                {activity.type === 'add' ? <Plus size={14} /> : <Check size={14} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-700 leading-tight">
                                    <span className="font-bold">{name}</span>{' '}
                                    {activity.type === 'add' ? 'agregó' : 'compró'}{' '}
                                    <span className="font-medium text-slate-900">{activity.item}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1 capitalize">
                                    {timeAgo(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
