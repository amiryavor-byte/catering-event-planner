
"use client";

import { BusinessPlanData } from '@/lib/data/business-plan-service';
import { InlineEditable } from './InlineEditable';
import { useState } from 'react';

interface WorkflowSectionProps {
    data: BusinessPlanData;
    onChange: (newData: BusinessPlanData) => void;
}

export function WorkflowSection({ data, onChange }: WorkflowSectionProps) {

    // Guard against undefined during migration
    const steps = data.workflowSteps || [];

    const updateStep = (index: number, field: 'title' | 'description', value: string) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        onChange({ ...data, workflowSteps: newSteps });
    };

    const addStep = () => {
        const newSteps = [...steps, { title: "New Step", description: "Description of the new step..." }];
        onChange({ ...data, workflowSteps: newSteps });
    };

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        onChange({ ...data, workflowSteps: newSteps });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-purple-100 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">3</span>
                    Operational Workflow
                </div>
                <button
                    onClick={addStep}
                    className="text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-full transition-colors flex items-center"
                >
                    + Add Step
                </button>
            </h2>

            <div className="relative">
                {steps.length > 0 && <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>}

                <ol className="relative space-y-10 pl-2">
                    {steps.map((step, index) => (
                        <li key={index} className="ml-6 group relative">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-12 ring-8 ring-white text-purple-800 text-xs font-bold z-10">
                                {index + 1}
                            </span>

                            <div className="mb-1 text-lg font-semibold text-gray-900 pr-8">
                                <InlineEditable
                                    value={step.title}
                                    onSave={(v) => updateStep(index, 'title', v)}
                                />
                            </div>

                            <div className="text-base font-normal text-gray-500 pr-8">
                                <InlineEditable
                                    value={step.description}
                                    onSave={(v) => updateStep(index, 'description', v)}
                                    multiline
                                />
                            </div>

                            <button
                                onClick={() => removeStep(index)}
                                className="absolute top-0 right-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                title="Remove Step"
                            >
                                🗑️
                            </button>
                        </li>
                    ))}

                    {steps.length === 0 && (
                        <div className="text-center py-10 text-gray-400 italic">
                            No workflow steps defined. Click "Add Step" to begin.
                        </div>
                    )}
                </ol>
            </div>
        </div>
    );
}
