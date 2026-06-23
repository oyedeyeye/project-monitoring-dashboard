import { useState } from 'react';
import { useReportsAnalytics } from '../hooks/useReportsAnalytics';
import {
    Printer,
    Download,
    TrendingUp,
    Folder,
    AlertCircle,
    Percent,
    DollarSign,
    Building2,
    Activity,
    ShieldAlert
} from 'lucide-react';

const MONTHS = [
    { val: 1, label: 'January' },
    { val: 2, label: 'February' },
    { val: 3, label: 'March' },
    { val: 4, label: 'April' },
    { val: 5, label: 'May' },
    { val: 6, label: 'June' },
    { val: 7, label: 'July' },
    { val: 8, label: 'August' },
    { val: 9, label: 'September' },
    { val: 10, label: 'October' },
    { val: 11, label: 'November' },
    { val: 12, label: 'December' }
];

const QUARTERS = [
    { val: 1, label: 'Q1 (Jan - Mar)' },
    { val: 2, label: 'Q2 (Apr - Jun)' },
    { val: 3, label: 'Q3 (Jul - Sep)' },
    { val: 4, label: 'Q4 (Oct - Dec)' }
];

const YEARS = [2024, 2025, 2026, 2027];

const Reports = () => {
    const {
        data,
        loading,
        error,
        year,
        setYear,
        type,
        setType,
        value,
        setValue
    } = useReportsAnalytics(
        2026,
        'monthly',
        6
    );

    const [activeTab, setActiveTab] = useState<'executive' | 'geographical' | 'mda' | 'finance' | 'issues'>('executive');

    const handleTypeChange = (newType: 'monthly' | 'quarterly') => {
        setType(newType);
        if (newType === 'quarterly') {
            const currentQuarter = Math.ceil(value / 3);
            setValue(currentQuarter);
        } else {
            const firstMonthOfQuarter = (value - 1) * 3 + 1;
            setValue(firstMonthOfQuarter);
        }
    };

    const getPeriodLabel = () => {
        if (type === 'monthly') {
            return MONTHS.find(m => m.val === value)?.label || '';
        }
        return QUARTERS.find(q => q.val === value)?.label || '';
    };

    // CSV Exporter Helper
    const downloadCSV = (dataList: any[], headers: string[], filename: string) => {
        if (!dataList || !dataList.length) return;
        const csvRows = [headers.join(",")];
        dataList.forEach(row => {
            const values = Object.values(row).map(val => {
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(","));
        });
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const [activeDropdown, setActiveDropdown] = useState<'executive' | 'geographical' | 'mda' | 'finance' | 'issues' | null>(null);

    const printElementToPdf = (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Create a temporary iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.zIndex = '-1000';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Get all page styles
        let styles = '';
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules;
                for (let j = 0; j < rules.length; j++) {
                    styles += rules[j].cssText;
                }
            } catch (e) {
                // Ignore cross-origin stylesheet errors
            }
        }

        // Write content specifically styled for PDF print
        doc.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        ${styles}
                        body {
                            background: white !important;
                            color: black !important;
                            padding: 24px !important;
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                            font-size: 12px;
                        }
                        /* Remove scrollbars, print helpers, dropdowns, actions in PDF */
                        .no-print, .no-print * {
                            display: none !important;
                        }
                        /* Layout fixes for printing charts & scrollable containers */
                        .max-h-\\[300px\\] {
                            max-h: none !important;
                            overflow: visible !important;
                        }
                        .overflow-x-auto {
                            overflow: visible !important;
                        }
                        /* Ensure table elements wrap and break properly */
                        table {
                            page-break-inside: auto;
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                        tr:nth-child(even) {
                            background-color: #f9fafb !important;
                        }
                        td, th {
                            padding: 8px 12px !important;
                            border-bottom: 1px solid #e5e7eb !important;
                        }
                    </style>
                </head>
                <body>
                    <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1f2937; padding-bottom: 16px;">
                        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.025em;">PPMIU ANALYTICAL REPORT</h1>
                        <p style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.1em; margin: 6px 0 0 0;">
                            ${title}
                        </p>
                        <p style="font-size: 10px; color: #9ca3af; margin: 4px 0 0 0;">Generated on: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                        ${element.innerHTML}
                    </div>
                </body>
            </html>
        `);
        doc.close();

        // Give styles time to load, then trigger print
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    };

    // Executive tab CSV export helper
    const exportExecutiveCSV = () => {
        if (!executiveOverview) return;
        const rows = [
            { Metric: 'Total Projects', Value: executiveOverview.totalProjects || 0 },
            { Metric: 'Average Physical Progress (%)', Value: Math.round(executiveOverview.avgPhysicalProgress || 0) },
            { Metric: 'Financial Approved Budget (NGN)', Value: executiveOverview.financials?.totalBudget || 0 },
            { Metric: 'Financial Releases to Date (NGN)', Value: executiveOverview.financials?.totalReleased || 0 },
            { Metric: 'Financial Payments to Date (NGN)', Value: executiveOverview.financials?.totalPayments || 0 },
            { Metric: 'Disbursement Rate (%)', Value: Math.round(executiveOverview.financials?.disbursementRate || 0) },
            { Metric: 'Active Issues Count', Value: executiveOverview.activeIssuesCount || 0 },
            ...Object.entries(executiveOverview.statusDistribution || {}).map(([status, count]) => ({
                Metric: `Project Status - ${status}`,
                Value: count
            }))
        ];
        downloadCSV(rows, ['Metric', 'Value'], `Executive_Overview_${getPeriodLabel()}_${year}.csv`);
    };

    const renderExportDropdown = (
        tabKey: 'executive' | 'geographical' | 'mda' | 'finance' | 'issues',
        onCsvExport: () => void,
        tabTitle: string
    ) => {
        const isOpen = activeDropdown === tabKey;
        return (
            <div className="relative no-print">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(isOpen ? null : tabKey);
                    }}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                    <Download className="h-3.5 w-3.5" /> Export <span className="opacity-60 text-[10px] ml-0.5">▼</span>
                </button>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                                onClick={() => {
                                    setActiveDropdown(null);
                                    onCsvExport();
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5 text-gray-400" /> Export as CSV
                            </button>
                            <button
                                onClick={() => {
                                    setActiveDropdown(null);
                                    printElementToPdf(`report-tab-${tabKey}`, `${tabTitle} — ${getPeriodLabel()} ${year}`);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                            >
                                <Printer className="h-3.5 w-3.5 text-gray-400" /> Export as PDF
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="text-red-500 h-6 w-6" />
                        <div>
                            <h3 className="font-bold text-red-800">Error Fetching Analytical Reports</h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const {
        executiveOverview,
        sectorGeographical,
        mdaScorecard,
        financeCost,
        riskBottlenecks
    } = data || {};

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
            {/* Custom Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .print-section { page-break-after: always; display: block !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .main-content-layout { padding: 0 !important; }
                    .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
                    
                    /* Hide sidebar, navigation elements and headers */
                    aside, header, nav, [role="dialog"], [aria-label="Navigation menu"] {
                        display: none !important;
                    }
                    
                    /* Reset scrollable containers to allow natural multi-page flow and hide scrollbars */
                    html, body, #root, .app-shell, .app-shell > div, main {
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        display: block !important;
                        position: static !important;
                    }
                    
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    
                    main > div {
                        padding: 0 !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                    }
                }
                @media screen {
                    .print-only { display: none !important; }
                }
            `}} />

            {/* Header Controls (Screen Only) */}
            <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Activity className="text-brand h-6 w-6" /> Analytical Reports Hub
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Consolidated physical, financial, and risk metrics for Webmaster Admin
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Period Type Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            onClick={() => handleTypeChange('monthly')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${type === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => handleTypeChange('quarterly')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${type === 'quarterly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Quarterly
                        </button>
                    </div>

                    {/* Value Selector */}
                    <select
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="bg-white border border-gray-200 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand font-medium text-gray-700 shadow-sm"
                    >
                        {type === 'monthly'
                            ? MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)
                            : QUARTERS.map(q => <option key={q.val} value={q.val}>{q.label}</option>)
                        }
                    </select>

                    {/* Year Selector */}
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-white border border-gray-200 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand font-medium text-gray-700 shadow-sm"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    {/* Print Button */}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700 font-semibold px-4 py-2 text-sm rounded-xl shadow-sm hover:shadow transition-all"
                    >
                        <Printer className="h-4 w-4" /> Print Full Report
                    </button>
                </div>
            </div>

            {/* Print Only Title Block */}
            <div className="print-only text-center border-b border-gray-200 pb-6 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">PPMIU ANALYTICAL REPORT</h1>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-2">
                    {type === 'monthly' ? 'Monthly' : 'Quarterly'} Report — {getPeriodLabel()} {year}
                </p>
                <p className="text-xs text-gray-400 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Loading Placeholder */}
            {loading && (
                <div className="w-full min-h-[300px] flex flex-col justify-center items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand border-t-transparent" />
                    <p className="text-sm text-gray-500 font-medium">Aggregating project data...</p>
                </div>
            )}

            {/* Content when loaded */}
            {!loading && data && (
                <>
                    {/* Screen Only Navigation Tabs */}
                    <div className="no-print flex border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {(['executive', 'geographical', 'mda', 'finance', 'issues'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab ? 'border-brand text-brand bg-white rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                            >
                                {tab === 'executive' && 'Executive Performance Overview'}
                                {tab === 'geographical' && 'Sector & Geographical'}
                                {tab === 'mda' && 'MDA Scorecard'}
                                {tab === 'finance' && 'Finance & Cost Variance'}
                                {tab === 'issues' && 'Issues & Contractor Risks'}
                            </button>
                        ))}
                    </div>

                    {/* REPORT SECTION 1: EXECUTIVE PERFORMANCE OVERVIEW */}
                    <div className={`${activeTab === 'executive' ? 'block' : 'hidden'} print-section print-only:block space-y-6`}>
                        <div className="flex justify-between items-center border-l-4 border-brand pl-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">1. Executive Performance Overview</h2>
                                <p className="text-xs text-gray-500">Summary KPIs and status distributions for {getPeriodLabel()} {year}</p>
                            </div>
                            {renderExportDropdown('executive', exportExecutiveCSV, 'Executive Performance Overview')}
                        </div>

                        <div id="report-tab-executive" className="space-y-6">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                    <Folder className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">Total Projects</div>
                                    <div className="text-2xl font-extrabold text-gray-800">{executiveOverview?.totalProjects}</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                    <Percent className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">Avg Progress</div>
                                    <div className="text-2xl font-extrabold text-gray-800">
                                        {Math.round(executiveOverview?.avgPhysicalProgress || 0)}%
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">Disbursement Rate</div>
                                    <div className="text-2xl font-extrabold text-gray-800">
                                        {Math.round(executiveOverview?.financials?.disbursementRate || 0)}%
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                <div className="p-3 rounded-xl bg-red-50 text-red-600">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">Active Issues</div>
                                    <div className="text-2xl font-extrabold text-gray-800">{executiveOverview?.activeIssuesCount}</div>
                                </div>
                            </div>
                        </div>

                        {/* Status distribution & Financial details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-brand" /> Project Status Distribution
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(executiveOverview?.statusDistribution || {}).map(([status, count]) => {
                                        const total = executiveOverview?.totalProjects || 1;
                                        const percent = Math.round((Number(count) / total) * 100);
                                        const colorMap: Record<string, string> = {
                                            Completed: 'bg-green-500',
                                            Ongoing: 'bg-blue-500',
                                            Stalled: 'bg-red-500',
                                            'Not Started': 'bg-gray-400'
                                        };
                                        const textColorMap: Record<string, string> = {
                                            Completed: 'text-green-700 bg-green-50 border border-green-200',
                                            Ongoing: 'text-blue-700 bg-blue-50 border border-blue-200',
                                            Stalled: 'text-red-700 bg-red-50 border border-red-200',
                                            'Not Started': 'text-gray-700 bg-gray-50 border border-gray-200'
                                        };
                                        return (
                                            <div key={status} className="flex items-center justify-between text-sm">
                                                <div className="w-24">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${textColorMap[status] || 'bg-gray-100'}`}>
                                                        {status}
                                                    </span>
                                                </div>
                                                <div className="flex-1 mx-4">
                                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                        <div className={`${colorMap[status] || 'bg-gray-500'} h-full rounded-full`} style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                                <div className="w-12 text-right font-bold text-gray-700">{String(count)} ({percent}%)</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-brand" /> Financial Health Summary
                                </h3>
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-semibold uppercase">Approved Budget</span>
                                        <span className="font-bold text-gray-800">{formatCurrency(executiveOverview?.financials?.totalBudget || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-semibold uppercase">Releases to Date</span>
                                        <span className="font-bold text-blue-600">{formatCurrency(executiveOverview?.financials?.totalReleased || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-semibold uppercase">Payments (Expenditures)</span>
                                        <span className="font-bold text-green-600">{formatCurrency(executiveOverview?.financials?.totalPayments || 0)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-brand h-full rounded-full"
                                            style={{
                                                width: `${executiveOverview?.financials?.totalReleased > 0
                                                    ? (executiveOverview?.financials?.totalPayments / executiveOverview?.financials?.totalReleased) * 100
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* REPORT SECTION 2: SECTORAL & GEOGRAPHICAL DISTRIBUTION */}
                    <div className={`${activeTab === 'geographical' ? 'block' : 'hidden'} print-section print-only:block space-y-6`}>
                        <div className="flex justify-between items-center border-l-4 border-brand pl-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">2. Sector & Geographical Distribution</h2>
                                <p className="text-xs text-gray-500">Resource and velocity mapping by sectors and region</p>
                            </div>
                            {renderExportDropdown(
                                'geographical',
                                () => downloadCSV(
                                    sectorGeographical?.lgas || [],
                                    ['LGA Name', 'Project Count', 'Approved Budget', 'Releases', 'Payments', 'Avg Progress'],
                                    `LGA_Distribution_${getPeriodLabel()}_${year}.csv`
                                ),
                                'Sector & Geographical Distribution'
                            )}
                        </div>

                        <div id="report-tab-geographical" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Sectors Table */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Sector Breakdown</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                                <th className="py-2 px-3">Sector</th>
                                                <th className="py-2 px-3 text-center">Projects</th>
                                                <th className="py-2 px-3 text-right">Approved Budget</th>
                                                <th className="py-2 px-3 text-right">Payments</th>
                                                <th className="py-2 px-3 text-center">Avg Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectorGeographical?.sectors?.map((s: any, idx: number) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-3 font-semibold text-gray-800">{s.name}</td>
                                                    <td className="py-2 px-3 text-center font-bold text-gray-600">{s.projectCount}</td>
                                                    <td className="py-2 px-3 text-right">{formatCurrency(s.totalBudget)}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-green-600">{formatCurrency(s.totalPayments)}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <span className="font-semibold text-gray-800">{Math.round(s.avgPhysicalProgress)}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* LGAs Table */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Local Government Area (LGA) Performance</h3>
                                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                    <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] sticky top-0">
                                                <th className="py-2 px-3 bg-gray-50">LGA</th>
                                                <th className="py-2 px-3 text-center bg-gray-50">Projects</th>
                                                <th className="py-2 px-3 text-right bg-gray-50">Approved Budget</th>
                                                <th className="py-2 px-3 text-right bg-gray-50">Payments</th>
                                                <th className="py-2 px-3 text-center bg-gray-50">Avg Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectorGeographical?.lgas?.map((l: any, idx: number) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-3 font-semibold text-gray-800">{l.name}</td>
                                                    <td className="py-2 px-3 text-center font-bold text-gray-600">{l.projectCount}</td>
                                                    <td className="py-2 px-3 text-right">{formatCurrency(l.totalBudget)}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-green-600">{formatCurrency(l.totalPayments)}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <span className="font-semibold text-gray-800">{Math.round(l.avgPhysicalProgress)}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Districts Table */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Senatorial District Breakdown</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                                <th className="py-2 px-3">District</th>
                                                <th className="py-2 px-3 text-center">Projects</th>
                                                <th className="py-2 px-3 text-right">Approved Budget</th>
                                                <th className="py-2 px-3 text-right">Payments</th>
                                                <th className="py-2 px-3 text-center">Avg Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectorGeographical?.districts?.map((d: any, idx: number) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-3 font-semibold text-gray-800">{d.name}</td>
                                                    <td className="py-2 px-3 text-center font-bold text-gray-600">{d.projectCount}</td>
                                                    <td className="py-2 px-3 text-right">{formatCurrency(d.totalBudget)}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-green-600">{formatCurrency(d.totalPayments)}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <span className="font-semibold text-gray-800">{Math.round(d.avgPhysicalProgress)}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Funding Sources Table */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Funding Source Utilization</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                                <th className="py-2 px-3">Funding Source</th>
                                                <th className="py-2 px-3 text-center">Projects</th>
                                                <th className="py-2 px-3 text-right">Approved Budget</th>
                                                <th className="py-2 px-3 text-right">Payments</th>
                                                <th className="py-2 px-3 text-center">Avg Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectorGeographical?.fundingSources?.map((f: any, idx: number) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-3 font-semibold text-gray-800">{f.name}</td>
                                                    <td className="py-2 px-3 text-center font-bold text-gray-600">{f.projectCount}</td>
                                                    <td className="py-2 px-3 text-right">{formatCurrency(f.totalBudget)}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-green-600">{formatCurrency(f.totalPayments)}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <span className="font-semibold text-gray-800">{Math.round(f.avgPhysicalProgress)}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REPORT SECTION 3: MDA PERFORMANCE & COMPLIANCE SCORECARD */}
                    <div className={`${activeTab === 'mda' ? 'block' : 'hidden'} print-section print-only:block space-y-6`}>
                        <div className="flex justify-between items-center border-l-4 border-brand pl-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">3. MDA Performance & Compliance Scorecard</h2>
                                <p className="text-xs text-gray-500">MDA project execution indexes and reporting compliances</p>
                            </div>
                            {renderExportDropdown(
                                'mda',
                                () => downloadCSV(
                                    mdaScorecard || [],
                                    ['MDA ID', 'MDA Name', 'Projects Count', 'Avg Progress', 'Total Budget', 'Total Released', 'Total Payments', 'Updates Logged', 'Updates Submitted'],
                                    `MDA_Scorecard_${getPeriodLabel()}_${year}.csv`
                                ),
                                'MDA Performance & Compliance Scorecard'
                            )}
                        </div>

                        <div id="report-tab-mda" className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                            <th className="py-3 px-4">MDA Name</th>
                                            <th className="py-3 px-4 text-center">Projects</th>
                                            <th className="py-3 px-4 text-center">Avg Progress</th>
                                            <th className="py-3 px-4 text-right">Total Budget</th>
                                            <th className="py-3 px-4 text-right">Total Payments</th>
                                            <th className="py-3 px-4 text-center">Compliance (Submitted/Logged)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mdaScorecard?.map((m: any) => (
                                            <tr key={m.mdaId} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-semibold text-gray-800 flex items-center gap-2">
                                                    <Building2 className="h-3.5 w-3.5 text-gray-400" /> {m.mdaName}
                                                </td>
                                                <td className="py-3 px-4 text-center font-bold text-gray-600">{m.projectCount}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-bold text-gray-800">{Math.round(m.avgPhysicalProgress)}%</span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium text-gray-700">{formatCurrency(m.totalBudget)}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-green-600">{formatCurrency(m.totalPayments)}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${m.updatesLogged > 0 ? (m.updatesSubmitted === m.updatesLogged ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200') : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                                                        {m.updatesSubmitted} / {m.updatesLogged} updates
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* REPORT SECTION 4: PROJECT FINANCE & COST VARIANCE REPORT */}
                    <div className={`${activeTab === 'finance' ? 'block' : 'hidden'} print-section print-only:block space-y-6`}>
                        <div className="flex justify-between items-center border-l-4 border-brand pl-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">4. Project Finance & Cost Variance Register</h2>
                                <p className="text-xs text-gray-500">Gaps between financial expenditures and physical milestone completions</p>
                            </div>
                            {renderExportDropdown(
                                'finance',
                                () => downloadCSV(
                                    financeCost || [],
                                    ['Project ID', 'Project Title', 'MDA Name', 'Approved Budget', 'Releases', 'Payments', 'Physical Progress %', 'Budget Spent %', 'Cost Variance'],
                                    `Finance_Cost_Variance_${getPeriodLabel()}_${year}.csv`
                                ),
                                'Project Finance & Cost Variance Register'
                            )}
                        </div>

                        <div id="report-tab-finance" className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                            <th className="py-3 px-4">Project Title</th>
                                            <th className="py-3 px-4">Executing MDA</th>
                                            <th className="py-3 px-4 text-right">Approved Budget</th>
                                            <th className="py-3 px-4 text-right">Payments</th>
                                            <th className="py-3 px-4 text-center">Physical Progress</th>
                                            <th className="py-3 px-4 text-center">Budget Spent %</th>
                                            <th className="py-3 px-4 text-center">Cost Variance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {financeCost?.map((p: any) => {
                                            const varianceSeverity = p.costVariance > 15 ? 'text-red-700 bg-red-50 border border-red-200' : (p.costVariance > 5 ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-green-700 bg-green-50 border border-green-200');
                                            return (
                                                <tr key={p.projectId} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-semibold text-gray-800 max-w-[200px] truncate">{p.title}</td>
                                                    <td className="py-3 px-4 text-gray-500">{p.mdaName}</td>
                                                    <td className="py-3 px-4 text-right font-medium text-gray-700">{formatCurrency(p.approvedBudget)}</td>
                                                    <td className="py-3 px-4 text-right font-semibold text-green-600">{formatCurrency(p.paymentsToDate)}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="font-semibold text-gray-800">{Math.round(p.physicalProgressPct)}%</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-gray-600 font-medium">{Math.round(p.budgetSpentPct)}%</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${varianceSeverity}`}>
                                                            {p.costVariance > 0 ? `+${Math.round(p.costVariance)}%` : `${Math.round(p.costVariance)}%`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* REPORT SECTION 5: RISK, ISSUES, AND BOTTLENECK INTELLIGENCE */}
                    <div className={`${activeTab === 'issues' ? 'block' : 'hidden'} print-section print-only:block space-y-6`}>
                        <div className="flex justify-between items-center border-l-4 border-brand pl-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">5. Issues & Contractor Risk Registry</h2>
                                <p className="text-xs text-gray-500">Structural blockers, overdue resolutions, and contractor risk evaluations</p>
                            </div>
                            {renderExportDropdown(
                                'issues',
                                () => downloadCSV(
                                    riskBottlenecks?.overdueIssues || [],
                                    ['Issue ID', 'Project ID', 'Project Title', 'Issue Item', 'Category', 'Severity', 'Owner', 'Due Date', 'Status'],
                                    `Overdue_Issues_${getPeriodLabel()}_${year}.csv`
                                ),
                                'Issues & Contractor Risk Registry'
                            )}
                        </div>

                        <div id="report-tab-issues" className="space-y-6">

                        {/* Top indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Issue Categories</h3>
                                <div className="space-y-3">
                                    {riskBottlenecks?.issueCategories?.map((c: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 font-semibold">{c.category}</span>
                                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-lg text-xs font-bold">{c.count} occurrences</span>
                                        </div>
                                    ))}
                                    {(!riskBottlenecks?.issueCategories || !riskBottlenecks.issueCategories.length) && (
                                        <div className="text-gray-400 text-sm italic">No issues recorded.</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                                    <span>Resolution Metrics</span>
                                </h3>
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-semibold">Mean Time To Resolution (MTTR)</span>
                                        <span className="font-bold text-gray-800">
                                            {Math.round(riskBottlenecks?.meanTimeToResolution || 0)} days
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-gray-400 leading-relaxed">
                                        MTTR represents the average calendar days taken to resolve critical project bottlenecks from initial log date.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contractor Risk */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Top Contractor Risk Rankings</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                            <th className="py-2.5 px-3">Contractor Name</th>
                                            <th className="py-2.5 px-3 text-center">Assigned Projects</th>
                                            <th className="py-2.5 px-3 text-center">Stalled Projects</th>
                                            <th className="py-2.5 px-3 text-center">Associated Issues</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riskBottlenecks?.topContractors?.map((con: any, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-semibold text-gray-800">{con.contractor}</td>
                                                <td className="py-2.5 px-3 text-center text-gray-600 font-medium">{con.projectCount}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${con.stalledCount > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-400'}`}>
                                                        {con.stalledCount} stalled
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${con.issueCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-400'}`}>
                                                        {con.issueCount} issues
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Overdue Issues */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider text-red-600">Overdue Unresolved Issues</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                                            <th className="py-2.5 px-3">Project Title</th>
                                            <th className="py-2.5 px-3">Issue Details</th>
                                            <th className="py-2.5 px-3">Category</th>
                                            <th className="py-2.5 px-3 text-center">Severity</th>
                                            <th className="py-2.5 px-3">Owner</th>
                                            <th className="py-2.5 px-3">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riskBottlenecks?.overdueIssues?.map((i: any) => (
                                            <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-semibold text-gray-800 max-w-[150px] truncate">{i.projectTitle}</td>
                                                <td className="py-2.5 px-3 text-gray-600">{i.issueItem}</td>
                                                <td className="py-2.5 px-3">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                        {i.issueCategory}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${i.severity >= 4 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        Level {i.severity}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-gray-500">{i.owner}</td>
                                                <td className="py-2.5 px-3 text-gray-400 font-medium">
                                                    {new Date(i.dueDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!riskBottlenecks?.overdueIssues || !riskBottlenecks.overdueIssues.length) && (
                                            <tr>
                                                <td colSpan={6} className="py-6 text-center text-gray-400 italic">No overdue open issues found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
