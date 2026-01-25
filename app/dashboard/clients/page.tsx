import { getClients } from '@/lib/actions/clients';
import { ClientsView } from './client-view';

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
                    <p className="text-slate-400">Manage client profiles and view their event history.</p>
                </div>
            </div>

            <ClientsView clients={clients} />
        </div>
    );
}
