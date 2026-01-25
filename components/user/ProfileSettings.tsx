'use client';

import { useState } from 'react';
import { User } from '@/lib/data/types';
import { ApiDataService } from '@/lib/data/api-service';
import { Camera, Save, Loader2, Globe } from 'lucide-react';

interface ProfileSettingsProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
}

const api = new ApiDataService();

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user.name);
    const [language, setLanguage] = useState(user.language || 'en');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImage || null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // For MVP, we don't have a direct "upload avatar" endpoint separated, 
            // so we'll simulation upload or use a hypothetic sendMessage endpoint for files 
            // OR ideally update `updateUser` to handle multipart.

            // Wait, standard users.php update handles JSON. 
            // For the image, we might need to use the messaging endpoint as a hack OR 
            // (preferred) update `users.php` to handle multipart, BUT I haven't done that yet.

            // ACTUAL PLAN ADJUSTMENT:
            // Since I didn't update users.php for multipart, I'll use the /messages.php endpoint
            // to upload the file and get a URL, then update the user profile with that URL.
            // This is a clever reuse of the file upload logic I just wrote!

            let profileImageUrl = user.profileImage;

            if (avatarFile) {
                // Upload via messaging endpoint (hacky but valid for MVP reuse)
                // We send a "system" message to self or just use the upload logic
                const msg = await api.sendMessage({
                    senderId: user.id,
                    recipientId: user.id, // Self-DM
                    type: 'image',
                    file: avatarFile,
                    content: 'Updated profile picture'
                });
                // The API returns the content path which is the file URL
                if (msg.content) {
                    profileImageUrl = msg.content;
                }
            }

            // Now update the user profile
            await api.updateUser(user.id, {
                name,
                language,
                profileImage: profileImageUrl || undefined
            });

            onUpdate({ ...user, name, language, profileImage: profileImageUrl });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-2xl">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <Camera className="text-white" size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Profile Picture</h3>
                        <p className="text-slate-400 text-sm">Click the image to upload a new photo.</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Globe size={14} />
                            Language Preference
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                        >
                            <option value="en">English (Default)</option>
                            <option value="es">Español (Spanish)</option>
                            <option value="fr">Français (French)</option>
                            <option value="he">עברית (Hebrew)</option>
                        </select>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 px-6"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
