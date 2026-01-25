'use client';

import { useState } from 'react';
// We'll need to create task actions or use existing ones if available. 
// For now assuming we need to create or import logic.
// Checking schema, tasks table exists.
import { Trash2, CheckSquare, Plus } from 'lucide-react';
// Assuming we'll add task actions in event-planning.ts as well or reuse?
// Let's stub the local state for now or assume a server action we will create.
// I'll add addTask/removeTask to event-planning.ts in next step if not present.

interface Task {
    id: number;
    title: string;
    status: string | null;
    assignedTo: number | null;
}

export default function TaskManager({
    eventId,
    tasks
}: {
    eventId: number;
    tasks: Task[];
}) {
    // This is a placeholder since we haven't created task actions yet.
    // I will recommend adding the task management logic to the plan.
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckSquare size={20} className="text-success" />
                        Tasks
                    </h3>
                    <p className="text-slate-400 text-sm">Track to-dos for this event.</p>
                </div>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                    <Plus size={16} /> Add Task
                </button>
            </div>

            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500">No tasks tracked.</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-white">{task.title}</p>
                            <span className="text-xs text-slate-500 badge bg-black/20">{task.status}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
