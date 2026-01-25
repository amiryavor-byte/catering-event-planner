import { Users, ChefHat, Truck, Box, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ResourceSidebar() {
    const staff = [
        { name: 'Sarah Miller', role: 'Event Lead', status: 'available' },
        { name: 'Mike Chen', role: 'Head Chef', status: 'busy' },
        { name: 'Jessica Davis', role: 'Server', status: 'on_leave' },
        { name: 'Tom Wilson', role: 'Logistics', status: 'available' },
        { name: 'Alex Johnson', role: 'Bartender', status: 'available' },
    ];

    const equipment = [
        { name: 'Chafing Dishes', total: 10, inUse: 8 },
        { name: 'Banquet Tables', total: 20, inUse: 15 },
        { name: 'Linen Sets', total: 50, inUse: 42 },
        { name: 'Serving Platters', total: 30, inUse: 12 },
    ];

    return (
        <div className="glass-panel p-6 h-full flex flex-col gap-6 overflow-y-auto">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Staff Availability
                </h3>
                <div className="space-y-3">
                    {staff.map((person, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                            <div>
                                <div className="font-medium text-slate-200">{person.name}</div>
                                <div className="text-xs text-slate-400">{person.role}</div>
                            </div>
                            <div title={person.status}>
                                {person.status === 'available' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                {person.status === 'busy' && <Clock className="w-4 h-4 text-amber-400" />}
                                {person.status === 'on_leave' && <XCircle className="w-4 h-4 text-rose-400" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-primary" />
                    Equipment Status
                </h3>
                <div className="space-y-4">
                    {equipment.map((item, idx) => {
                        const usagePercent = item.total > 0 ? (item.inUse / item.total) * 100 : 0;
                        let progressColor = 'bg-emerald-500';
                        if (usagePercent > 80) progressColor = 'bg-rose-500';
                        else if (usagePercent > 50) progressColor = 'bg-amber-500';

                        return (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">{item.name}</span>
                                    <span className="text-slate-400">{item.inUse} / {item.total}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${progressColor} transition-all duration-500`}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="text-sm text-primary-200 font-medium">System Note</div>
                <div className="text-xs text-primary-200/70 mt-1">
                    Resource tracking is currently in simulation mode. Connect to Inventory for live updates.
                </div>
            </div>
        </div>
    );
}
