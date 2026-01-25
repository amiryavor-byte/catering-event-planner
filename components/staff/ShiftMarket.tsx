'use client';

import { OpenShift, ShiftBid } from '@/lib/data/types';
import { bidOnShift } from '@/lib/actions/availability';
import { GlassModal } from '@/components/ui/GlassModal';
import { Loader2, Briefcase, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface MarketShift extends OpenShift {
    eventName: string;
    eventDate: string | Date | null | undefined;
}

interface ShiftMarketProps {
    shifts: MarketShift[];
    myBids: ShiftBid[];
    userId: number;
}

export default function ShiftMarket({ shifts, myBids, userId }: ShiftMarketProps) {
    const [isLoading, setIsLoading] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<MarketShift | null>(null);
    const [notes, setNotes] = useState('');

    const bidsMap = new Map(myBids.map(b => [b.shiftId, b]));

    const openBidModal = (shift: MarketShift) => {
        setSelectedShift(shift);
        setNotes('');
        setIsDialogOpen(true);
    };

    const handleBid = async () => {
        if (!selectedShift) return;
        setIsLoading(selectedShift.id);
        try {
            await bidOnShift(selectedShift.id, notes);
            window.location.reload();
        } catch (error) {
            alert("Failed to place bid");
        } finally {
            setIsLoading(null);
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shifts.map((shift) => {
                    const myBid = bidsMap.get(shift.id);
                    const eventDate = shift.eventDate ? new Date(shift.eventDate) : new Date();

                    return (
                        <div key={shift.id} className="glass-panel p-5 flex flex-col justify-between hover:bg-white/5 transition-colors group relative overflow-hidden">
                            {myBid && myBid.status === 'approved' && (
                                <div className="absolute top-0 right-0 bg-green-500/20 p-2 rounded-bl-xl border-l border-b border-green-500/20">
                                    <CheckCircle size={16} className="text-green-400" />
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/20">
                                        {shift.role}
                                    </span>
                                </div>

                                <h4 className="font-bold text-white text-lg mb-1 truncate" title={shift.eventName}>
                                    {shift.eventName}
                                </h4>

                                <div className="text-slate-400 text-sm space-y-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-500" />
                                        {format(eventDate, 'MMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-slate-500" />
                                        {shift.startTime || 'Start TBD'} - {shift.endTime || 'End TBD'}
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm mb-4 line-clamp-2 min-h-[2.5em]">{shift.description}</p>
                            </div>

                            <button
                                onClick={() => openBidModal(shift)}
                                disabled={!!myBid || isLoading === shift.id || shift.status === 'filled'}
                                className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${myBid
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                                        : 'btn-primary'
                                    }`}
                            >
                                {isLoading === shift.id ? <Loader2 className="animate-spin" size={16} /> :
                                    myBid ? (myBid.status === 'approved' ? <CheckCircle size={16} /> : <AlertCircle size={16} />) : <Briefcase size={16} />}
                                {myBid ? (myBid.status === 'approved' ? 'Assigned' : 'Applied') : 'Apply for Shift'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {shifts.length === 0 && (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No open shifts available at the moment.</p>
                </div>
            )}

            <GlassModal
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={`Apply for ${selectedShift?.role}`}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-200">
                        <p className="mb-1">You are applying for:</p>
                        <p className="font-bold text-lg text-white mb-1">{selectedShift?.role}</p>
                        <p className="text-blue-300">at {selectedShift?.eventName}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Why are you a good fit? (Optional)</label>
                        <textarea
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. I have experience with this venue..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBid}
                            className="btn-primary px-6"
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
