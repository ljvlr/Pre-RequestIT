import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import YesNoModal from '../components/YesNoModal';

export default function AdminRequests() {
    const navigate = useNavigate();
    const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
    const [requests, setRequests] = useState([]);
    const [pendingDeleteRequestId, setPendingDeleteRequestId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);


    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/'); return; }

            const {data: requestsData, error: requestsError} = await supabase.from('requests').select('*, courses(*)');

            if (!requestsError) {
                setRequests(requestsData);
            }

            console.log('Requests data:', requestsData);
        }
        catch (error) {
            console.error(error.message);
        } 
    }

    const getStatusBadgeClass = (status) => {
        const normalizedStatus = (status || 'pending').toLowerCase();

        if (normalizedStatus === 'approved') {
            return 'bg-emerald-100 text-emerald-700';
        }

        return 'bg-amber-100 text-amber-700';
    };

    const handleRemoveRequest = async (requestId) => {
        console.log('Removing request with ID:', requestId);
        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', requestId);

        if (!error) {
            setRequests((currentRequests) =>
                currentRequests.filter((request) => request.id !== requestId)
            );
        } else {
            console.error('Failed to remove request:', error.message);
        }
    };

    const handleLogoutConfirm = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };
            
    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
            {pendingDeleteRequestId && (
                <YesNoModal
                    title="Delete this request?"
                    onCancel={() => setPendingDeleteRequestId(null)}
                    onConfirm={async () => {
                        await handleRemoveRequest(pendingDeleteRequestId);
                        setPendingDeleteRequestId(null);
                    }}
                />
            )}
            {showLogoutPrompt && (
                <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
                )}

            <Navbar 
                title="Pre-RequestIT (Admin)"
                navItems={[{ label: 'Users', onClick: () => {navigate('/admin');}, isActive: false },
                { label: 'Courses', onClick: () => {navigate('/admin/courses');}, isActive: false },
                { label: 'Expansion/Petitions', onClick: () => {}, isActive: true }
                ]}
                onLogoutClick={() => setShowLogoutPrompt(true)}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Expansion / Petition Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">
                    Review all submitted course requests and their preferences.
                    </p>
                </div>

                <div id="requests-container" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {requests.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                            No requests available.
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {request.courses?.course_code || 'Unknown Course'}
                                        </h2>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(request.status)}`}
                                    >
                                        {request.status || 'Pending'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">
                                    {request.courses?.description || 'No description available.'}
                                </p>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Course Semester</span>
                                        <span className="font-semibold text-gray-900">
                                            {request.courses?.semester || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Total Requests</span>
                                        <span className="font-semibold text-gray-900">
                                            {request.courses?.requests ?? 0}
                                        </span>
                                    </div>

                                    <div className="border-b border-gray-100 pb-2">
                                        <span className="block text-gray-500 mb-1">Preferred Schedule</span>
                                        <span className="font-semibold text-gray-900">
                                            {request.preferred_schedule || 'No preferred schedule provided'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <span className="block text-gray-500 mb-1">Status</span>
                                            <span className="font-semibold text-gray-900">
                                                {request.status || 'Pending'}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setPendingDeleteRequestId(request.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        
    );
}