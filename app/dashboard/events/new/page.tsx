import { getUsers } from '@/lib/actions/users';
import { createEvent } from '@/lib/actions/events';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
    const clients = await getUsers();
    const clientUsers = clients.filter(u => u.role === 'client');

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/events" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Events
            </Link>

            <div className="glass-panel p-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
                <p className="text-slate-400 mb-8">Enter event details to get started.</p>

                <form action={createEvent} className={styles.form}>
                    {/* Basic Info */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Basic Information</h2>

                        <div className={styles.formGrid}>
                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Event Name *</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="e.g. Smith Wedding Reception"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Client</label>
                                <select name="clientId" className={styles.input}>
                                    <option value="">Select Client...</option>
                                    {clientUsers.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    <Link href="/dashboard/users" className="text-primary hover:underline">
                                        + Add new client
                                    </Link>
                                </p>
                            </div>

                            <div>
                                <label className={styles.label}>Event Type</label>
                                <select name="eventType" className={styles.input}>
                                    <option value="">Select Type...</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="corporate">Corporate Event</option>
                                    <option value="bar_mitzvah">Bar Mitzvah</option>
                                    <option value="bat_mitzvah">Bat Mitzvah</option>
                                    <option value="bris">Bris</option>
                                    <option value="baby_naming">Baby Naming</option>
                                    <option value="shiva">Shiva</option>
                                    <option value="shabbat">Shabbat Dinner</option>
                                    <option value="holiday_party">Holiday Party</option>
                                    <option value="fundraiser">Fundraiser</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Event Details</h2>

                        <div className={styles.formGrid}>
                            <div>
                                <label className={styles.label}>Start Date & Time</label>
                                <input
                                    name="startDate"
                                    type="datetime-local"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>End Date & Time</label>
                                <input
                                    name="endDate"
                                    type="datetime-local"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Location</label>
                                <input
                                    name="location"
                                    type="text"
                                    placeholder="e.g. 123 Main St, City, State"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Guest Count</label>
                                <input
                                    name="guestCount"
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    placeholder="e.g. 150"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Estimated Budget ($)</label>
                                <input
                                    name="estimatedBudget"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    placeholder="e.g. 5000"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fullWidth}>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        name="isOutdoors"
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-300">Outdoor Event</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Additional Information</h2>

                        <div>
                            <label className={styles.label}>Dietary Requirements</label>
                            <input
                                name="dietaryRequirements"
                                type="text"
                                placeholder="e.g. Kosher, Gluten-free, Vegan options"
                                className={styles.input}
                            />
                        </div>

                        <div className="mt-4">
                            <label className={styles.label}>Notes</label>
                            <textarea
                                name="notes"
                                rows={4}
                                placeholder="Special requests, important details, etc."
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mt-8">
                        <button type="submit" className="btn-primary flex-1">
                            Create Event
                        </button>
                        <Link href="/dashboard/events" className="btn-secondary flex-1 text-center">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
