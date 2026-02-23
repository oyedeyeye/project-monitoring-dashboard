export const ISSUE_CATEGORIES: Record<string, string[]> = {
    'Financial': [
        'Delayed Mobilization Advance',
        'Delayed Payment of IPC',
        'Budget Constraint',
        'Other Financial Issue'
    ],
    'Technical & Operational': [
        'Design Modification Required',
        'Poor Quality of Materials',
        'Equipment Breakdown',
        'Other Technical Issue'
    ],
    'Environmental & Social': [
        'Weather Delay (Rain/Flood)',
        'Community Dispute',
        'Site Access Issue',
        'Other E&S Issue'
    ],
    'Administrative & Legal': [
        'Permit/Approval Delay',
        'Contractor Non-Performance',
        'Procurement Delay',
        'Other Administrative Issue'
    ]
};

export const ISSUE_CATEGORY_OPTIONS = Object.keys(ISSUE_CATEGORIES);
