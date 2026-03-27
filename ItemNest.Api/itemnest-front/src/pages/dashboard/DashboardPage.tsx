import { useEffect, useState } from "react";
import { getMyDashboard } from "../../api/dashboardApi";
import type { MyDashboard } from "../../types/dashboard";
import { getApiErrorMessage } from "../../utils/error";

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState<MyDashboard | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const data = await getMyDashboard();
                setDashboard(data);
            } catch (error: any) {
                setErrorMessage(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        void loadDashboard();
    }, []);

    if (isLoading) {
        return <div className="text-lg">Loading dashboard...</div>;
    }

    if (errorMessage) {
        return <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">{errorMessage}</div>;
    }

    if (!dashboard) {
        return <div>No dashboard data found.</div>;
    }

    const cards = [
        { title: "My Posts", value: dashboard.myPostsCount },
        { title: "Open Posts", value: dashboard.openPostsCount },
        { title: "Favorites", value: dashboard.favoritesCount },
        {
            title: "Pending Received Requests",
            value: dashboard.pendingReceivedContactRequestsCount,
        },
        {
            title: "Pending Sent Requests",
            value: dashboard.pendingSentContactRequestsCount,
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="mt-2 text-slate-600">Overview of your account activity.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.title} className="rounded-2xl bg-white p-5 shadow">
                        <p className="text-sm text-slate-500">{card.title}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-800">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}