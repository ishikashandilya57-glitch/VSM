'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to DBR by default
        router.push('/dbr');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-6">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-xl font-bold text-gray-900">Entering Workspace...</h1>
                <p className="text-gray-500 mt-2">Redirecting to DBR Factory Dashboard</p>
            </div>
        </div>
    );
}
