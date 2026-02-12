
import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ProgressUpdate } from '../types/supabase';
import { CheckCircle } from 'lucide-react';

const ApproverDashboard = () => {
    const { reports, loading, error, approveReport, refetch } = useReports();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleApprove = async (reportId: string) => {
        if (!confirm('Are you sure you want to approve this report?')) return;

        setActionLoading(reportId);
        try {
            await approveReport(reportId);
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Failed to approve report.');
        } finally {
            setActionLoading(null);
        }
    };

    const columns = [
        { header: 'Date', accessor: 'report_date' as keyof ProgressUpdate },
        {
            header: 'Project',
            accessor: (item: ProgressUpdate) => (item as any).projects?.title || 'Unknown Project'
        },
        {
            header: 'Progress',
            accessor: (item: ProgressUpdate) => `${item.physical_progress_pct}%`
        },
        {
            header: 'Stage',
            accessor: (item: ProgressUpdate) => <Badge variant="info">{item.stage}</Badge>
        },
        {
            header: 'Status',
            accessor: (item: ProgressUpdate) => (
                <Badge variant={item.milestone_status === 'Approved' ? 'success' : 'warning'}>
                    {item.milestone_status}
                </Badge>
            )
        },
        {
            header: 'Action',
            accessor: (item: ProgressUpdate) => (
                item.milestone_status !== 'Approved' && (
                    <Button
                        size="sm"
                        variant="primary"
                        isLoading={actionLoading === item.id}
                        onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }}
                    >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                    </Button>
                )
            )
        }
    ];

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading reports: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Approvals</h1>
                    <p className="text-gray-500 mt-1">Review and approve project progress reports.</p>
                </div>
                <Button onClick={() => refetch()} variant="ghost" size="sm">
                    Refresh
                </Button>
            </div>

            <Card noPadding>
                <Table
                    data={reports}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No pending reports found."
                    keyExtractor={(item) => item.id}
                />
            </Card>
        </div>
    );
};

export default ApproverDashboard;
