'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, PartyPopper } from 'lucide-react';

export default function WelcomeTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check if user has seen the tour
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (!hasSeenTour) {
            // Small delay to let the page load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const handleSkip = () => {
        handleClose();
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to Catering Planner!",
            content: "Your all-in-one solution for managing events, menus, and staff. Let's take a quick tour to get you started.",
            icon: <PartyPopper className="w-12 h-12 text-primary mx-auto mb-4" />
        },
        {
            title: "Your Dashboard",
            content: "This is your command center. Track active events, pending quotes, and revenue at a glance. Use the quick actions to create new events instantly.",
        },
        {
            title: "Event Management",
            content: "Navigate to the 'Events' tab to see your calendar. You can track every detail from initial inquiry to final execution.",
        },
        {
            title: "Menus & AI Parsing",
            content: "Upload PDF menus and let our AI do the heavy lifting. We automatically extract dishes and ingredients to streamline your costing.",
        },
        {
            title: "Staff & Scheduling",
            content: "Manage your team efficiently. Assign roles, track availability, and send schedules directly from the platform.",
        },
        {
            title: "You're All Set!",
            content: "You're ready to start planning amazing events. Explore the sidebar to discover more features.",
            icon: <Check className="w-12 h-12 text-success mx-auto mb-4" />
        }
    ];

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300">
            <div className="glass-panel shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-700">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>

                {/* Close Button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8 text-center flex-1 flex flex-col justify-center min-h-[300px]">
                    {currentStepData.icon}
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {currentStepData.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentStepData.content}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">

                    {/* Dots Indicator */}
                    <div className="flex gap-1.5 absolute left-1/2 -translate-x-1/2 bottom-8">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors duration-300 ${idx === currentStep
                                    ? 'bg-primary'
                                    : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${currentStep === 0
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                    >
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
