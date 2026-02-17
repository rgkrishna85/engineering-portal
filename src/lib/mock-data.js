const regions = [
    { id: 'reg-na', name: 'North America', code: 'NA', timezone: 'America/New_York', color: '#6366f1' },
    { id: 'reg-sa', name: 'South Asia', code: 'SA', timezone: 'Asia/Kolkata', color: '#f59e0b' },
    { id: 'reg-eu', name: 'Europe', code: 'EU', timezone: 'Europe/London', color: '#10b981' },
    { id: 'reg-la', name: 'Latin America', code: 'LATAM', timezone: 'America/Sao_Paulo', color: '#ef4444' },
    { id: 'reg-uae', name: 'UAE', code: 'UAE', timezone: 'Asia/Dubai', color: '#8b5cf6' },
];

const skills = [
    { id: 's1', name: 'Structural Analysis', category: 'Engineering' },
    { id: 's2', name: 'FEA/FEM', category: 'Engineering' },
    { id: 's3', name: 'CFD', category: 'Engineering' },
    { id: 's4', name: 'CAD Design', category: 'Design' },
    { id: 's5', name: 'Project Management', category: 'Management' },
    { id: 's6', name: 'Risk Assessment', category: 'Engineering' },
    { id: 's7', name: 'Quality Assurance', category: 'Quality' },
    { id: 's8', name: 'Python/Automation', category: 'Technology' },
    { id: 's9', name: 'Report Writing', category: 'Documentation' },
    { id: 's10', name: 'Client Communication', category: 'Soft Skills' },
    { id: 's11', name: 'ASME Standards', category: 'Engineering' },
    { id: 's12', name: 'Piping Design', category: 'Engineering' },
    { id: 's13', name: 'Electrical Systems', category: 'Engineering' },
    { id: 's14', name: 'Process Engineering', category: 'Engineering' },
    { id: 's15', name: 'AI/ML Applications', category: 'Technology' },
];

const departments = ['MDA', 'ICEE', 'OPS'];

const activities_list = [
    'FEA Analysis - Project Alpha',
    'CFD Simulation - Turbine Blade',
    'Structural Review - Site A',
    'Technical Documentation',
    'Client Strategy Meeting',
    'Risk Assessment Workshop',
    'QA Audit - Manufacturing',
    'Pipeline Design Optimization',
    'ASME Standards Compliance Check',
    'Automation Scripting (Python)',
];

// Helper to generate random daily workload and activities for 5 days (Current Week)
const genDailyWorkload = (empStatus) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map(day => {
        if (empStatus === 'on_leave') return { day, hours: 0, status: 'leave', activity: 'Annual Leave' };

        // 5% chance of company holiday
        if (Math.random() < 0.05) return { day, hours: 0, status: 'holiday', activity: 'Public Holiday' };

        const rand = Math.random();
        let hours, status;
        if (rand < 0.1) { hours = 0; status = 'no-load'; }
        else if (rand < 0.3) { hours = Math.floor(Math.random() * 7) + 1; status = 'partial'; }
        else if (rand < 0.8) { hours = 8; status = 'standard'; }
        else { hours = 9 + Math.floor(Math.random() * 3); status = 'overtime'; }

        return {
            day,
            hours,
            status,
            activity: hours > 0 ? activities_list[Math.floor(Math.random() * activities_list.length)] : 'Administrative / Email'
        };
    });
};

// Helper to generate a random workload array (12 weeks)
const genWorkload = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 15) + 35); // 35-50 hours

const employees = [];

// Create 4 Managers for MDA
const mdaManagers = [
    { id: 'mgr-mda-1', name: 'Robert Chen', email: 'robert.chen@engportal.com', role: 'MDA Unit Manager', department: 'MDA', region_id: 'reg-na', status: 'active', utilization: 85, join_date: '2015-05-10', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'mgr-mda-2', name: 'Anjali Gupta', email: 'anjali.gupta@engportal.com', role: 'MDA Technical Lead', department: 'MDA', region_id: 'reg-sa', status: 'active', utilization: 90, join_date: '2016-08-20', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'mgr-mda-3', name: 'Marcus Steiner', email: 'marcus.steiner@engportal.com', role: 'MDA Design Manager', department: 'MDA', region_id: 'reg-eu', status: 'active', utilization: 78, join_date: '2017-03-15', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'mgr-mda-4', name: 'Elena Rodriguez', email: 'elena.rodriguez@engportal.com', role: 'MDA Analysis Lead', department: 'MDA', region_id: 'reg-la', status: 'active', utilization: 82, join_date: '2018-11-05', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
];

employees.push(...mdaManagers);

// Create Department Manager for MDA
employees.push({
    id: 'dept-mgr-mda',
    name: 'James Sterling',
    email: 'james.sterling@engportal.com',
    role: 'MDA Department Head',
    department: 'MDA',
    region_id: 'reg-na',
    status: 'active',
    utilization: 60,
    join_date: '2010-01-01',
    manager_id: null,
    workload: genWorkload(),
    dailyWorkload: genDailyWorkload('active')
});

// Generate 70 more employees for MDA distributed among the 4 managers
const names = ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna', 'Harper'];
const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

for (let i = 1; i <= 70; i++) {
    const mgr = mdaManagers[i % 4];
    const name = names[Math.floor(Math.random() * names.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const fullName = `${name} ${surname} ${i}`;
    const empStatus = Math.random() > 0.1 ? 'active' : 'on_leave';

    employees.push({
        id: `emp-mda-${i}`,
        name: fullName,
        email: `${name.toLowerCase()}.${surname.toLowerCase()}${i}@engportal.com`,
        role: i % 5 === 0 ? 'Senior Engineer' : 'Junior Engineer',
        department: 'MDA',
        region_id: mgr.region_id,
        status: empStatus,
        utilization: Math.floor(Math.random() * 40) + 60,
        join_date: '2022-01-01',
        manager_id: mgr.id,
        workload: genWorkload(),
        dailyWorkload: genDailyWorkload(empStatus)
    });
}

// Add some for ICEE and OPS
employees.push(
    { id: 'emp-icee-1', name: 'Kenji Sato', email: 'kenji.sato@engportal.com', role: 'ICEE Manager', department: 'ICEE', region_id: 'reg-eu', status: 'active', utilization: 88, join_date: '2018-05-15', manager_id: null, workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'emp-ops-1', name: 'Sarah Miller', email: 'sarah.miller@engportal.com', role: 'OPS Lead', department: 'OPS', region_id: 'reg-na', status: 'active', utilization: 92, join_date: '2017-10-10', manager_id: null, workload: genWorkload(), dailyWorkload: genDailyWorkload('active') }
);

export const seedData = {
    regions,
    skills,
    employees,
    projects: [
        { id: 'proj-001', name: 'Offshore Platform Structural Assessment', client: 'PetroGlobal Inc.', description: 'Comprehensive structural integrity assessment for aging offshore platform', status: 'active', region_id: 'reg-na', start_date: '2025-09-01', end_date: '2026-06-30', budget_hours: 4800, spent_hours: 2160, progress: 45, priority: 'high' },
        { id: 'proj-002', name: 'Refinery Expansion - Phase II', client: 'IndoRefine Ltd.', description: 'Process engineering and design for refinery capacity expansion', status: 'active', region_id: 'reg-sa', start_date: '2025-06-15', end_date: '2026-12-31', budget_hours: 12000, spent_hours: 6800, progress: 57, priority: 'critical' },
    ],
    assignments: [],
    deliverables: [],
    reviews: [],
    trainings: [],
    employee_skills: [],
    employee_trainings: [],
    workflows: [],
    workflow_steps: [],
    activities: [],
};
