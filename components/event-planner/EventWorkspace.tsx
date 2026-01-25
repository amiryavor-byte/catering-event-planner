'use client';

import { useState } from 'react';
import { Calendar, Users, Utensils, Box, CheckSquare } from 'lucide-react';
import StaffManager from './StaffManager';
import EquipmentManager from './EquipmentManager';
import MenuManager from './MenuManager';
import TaskManager from './TaskManager';

import OpenShiftManager from '@/components/event-planner/OpenShiftManager';
import QuoteBuilder from '@/components/event-planner/QuoteBuilder';

export default function EventWorkspace({
    event,
    assignedStaff,
    allStaff,
    assignedEquipment,
    allEquipment,
    assignedMenu,
    allMenuItems,
    tasks,
    openShifts = [],
    ...props // Capture rest props like allAvailability
}: any) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Calendar },
        { id: 'menu', label: 'Menu', icon: Utensils },
        { id: 'staff', label: 'Staff', icon: Users },
        { id: 'equipment', label: 'Equipment', icon: Box },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'shifts', label: 'Open Shifts', icon: Users },
        { id: 'quotes', label: 'Quotes', icon: Box }, // Placeholder icon
    ];

    return (
        <div>
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card">
                            <h3 className="text-lg font-bold text-white mb-4">Financial Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Estimated Budget</span>
                                    <span className="text-white font-medium">${event.estimatedBudget?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/10">
                                    <span className="text-slate-400">Food Cost (Est)</span>
                                    <span className="text-white font-medium">
                                        ${(assignedMenu.reduce((sum: any, i: any) => sum + ((i.priceOverride ?? i.item?.basePrice ?? 0) * i.quantity), 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Labor Cost (Est)</span>
                                    <span className="text-white font-medium">
                                        ${(assignedStaff.reduce((sum: any, s: any) => sum + (s.user.hourlyRate || 0), 0) * 5).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Equipment Rentals</span>
                                    <span className="text-warning font-medium">
                                        ${(assignedEquipment.reduce((sum: any, e: any) => sum + ((e.rentalCostOverride ?? e.item?.defaultRentalCost ?? 0) * e.quantity), 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-white">{assignedStaff.length}</p>
                                    <p className="text-xs text-slate-400">Staff Assigned</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-white">{assignedMenu.length}</p>
                                    <p className="text-xs text-slate-400">Menu Items</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-white">{tasks.length}</p>
                                    <p className="text-xs text-slate-400">Tasks</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-white">{openShifts.length}</p>
                                    <p className="text-xs text-slate-400">Open Shifts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <MenuManager
                        eventId={event.id}
                        assignedMenu={assignedMenu}
                        allMenuItems={allMenuItems}
                    />
                )}

                {activeTab === 'staff' && (
                    <StaffManager
                        eventId={event.id}
                        assignedStaff={assignedStaff}
                        allStaff={allStaff}
                        allAvailability={props.allAvailability}
                        blackoutDates={props.blackoutDates}
                        eventDate={event.date || event.startDate}
                    />
                )}

                {activeTab === 'equipment' && (
                    <EquipmentManager
                        eventId={event.id}
                        assignedEquipment={assignedEquipment}
                        allEquipment={allEquipment}
                    />
                )}

                {activeTab === 'tasks' && (
                    <TaskManager
                        eventId={event.id}
                        tasks={tasks}
                    />
                )}

                {activeTab === 'shifts' && (
                    <OpenShiftManager
                        eventId={event.id}
                        initialShifts={openShifts}
                    />
                )}

                {activeTab === 'quotes' && (
                    <QuoteBuilder
                        event={event}
                        assignedMenu={assignedMenu}
                        assignedStaff={assignedStaff}
                    />
                )}
            </div>
        </div>
    );
}
