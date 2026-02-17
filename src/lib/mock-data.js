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

const trainings = [
    { id: 't1', title: 'Advanced FEA Analysis', category: 'Engineering', provider: 'Internal Academy', duration_hours: 40, mandatory: 1 },
    { id: 't2', title: 'Project Management Professional (PMP)', category: 'Management', provider: 'PMI', duration_hours: 120, mandatory: 0 },
    { id: 't3', title: 'Safety in Offshore Operations', category: 'Safety', provider: 'HSE Global', duration_hours: 16, mandatory: 1 },
    { id: 't4', title: 'Python for Engineering Automation', category: 'Technology', provider: 'TechSkills.io', duration_hours: 24, mandatory: 0 },
    { id: 't5', title: 'Quality Assurance Standards', category: 'Quality', provider: 'ISO Institute', duration_hours: 8, mandatory: 1 },
];

// Helper to generate random daily workload and activities for 5 days (Current Week)
const genDailyWorkload = (empStatus) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map(day => {
        if (empStatus === 'on_leave') return { day, hours: 0, status: 'leave', activity: 'Annual Leave' };
        if (Math.random() < 0.05) return { day, hours: 0, status: 'holiday', activity: 'Public Holiday' };
        const rand = Math.random();
        let hours, status;
        if (rand < 0.1) { hours = 0; status = 'no-load'; }
        else if (rand < 0.3) { hours = Math.floor(Math.random() * 7) + 1; status = 'partial'; }
        else if (rand < 0.8) { hours = 8; status = 'standard'; }
        else { hours = 9 + Math.floor(Math.random() * 3); status = 'overtime'; }
        return { day, hours, status, activity: hours > 0 ? activities_list[Math.floor(Math.random() * activities_list.length)] : 'Administrative / Email' };
    });
};

const genWorkload = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 15) + 35);

const employees = [];

const mdaManagers = [
    { id: 'mgr-mda-1', name: 'Robert Chen', email: 'robert.chen@engportal.com', role: 'MDA Unit Manager', department: 'MDA', region_id: 'reg-na', status: 'active', utilization: 85, join_date: '2015-05-10', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'mgr-mda-2', name: 'Anjali Gupta', email: 'anjali.gupta@engportal.com', role: 'MDA Technical Lead', department: 'MDA', region_id: 'reg-sa', status: 'active', utilization: 90, join_date: '2016-08-20', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'mgr-mda-3', name: 'Marcus Steiner', email: 'marcus.steiner@engportal.com', role: 'MDA Design Manager', department: 'MDA', region_id: 'reg-eu', status: 'active', utilization: 78, join_date: '2017-03-15', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'mgr-mda-4', name: 'Elena Rodriguez', email: 'elena.rodriguez@engportal.com', role: 'MDA Analysis Lead', department: 'MDA', region_id: 'reg-la', status: 'active', utilization: 82, join_date: '2018-11-05', manager_id: 'dept-mgr-mda', workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
];
employees.push(...mdaManagers);

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

const names = ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna', 'Harper'];
const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

for (let i = 1; i <= 70; i++) {
    const mgr = mdaManagers[i % 4];
    const name = names[Math.floor(Math.random() * names.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const empStatus = Math.random() > 0.1 ? 'active' : 'on_leave';
    employees.push({
        id: `emp-mda-${i}`,
        name: `${name} ${surname} ${i}`,
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

employees.push(
    { id: 'emp-icee-1', name: 'Kenji Sato', email: 'kenji.sato@engportal.com', role: 'ICEE Manager', department: 'ICEE', region_id: 'reg-eu', status: 'active', utilization: 88, join_date: '2018-05-15', manager_id: null, workload: genWorkload(), dailyWorkload: genDailyWorkload('active') },
    { id: 'emp-ops-1', name: 'Sarah Miller', email: 'sarah.miller@engportal.com', role: 'OPS Lead', department: 'OPS', region_id: 'reg-na', status: 'active', utilization: 92, join_date: '2017-10-10', manager_id: null, workload: genWorkload(), dailyWorkload: genDailyWorkload('active') }
);

const assignments = [];
const employee_skills = [];
const employee_trainings = [];

// Populate some assignments and skills for realism
employees.forEach(emp => {
    // 2 skills per employee
    employee_skills.push({ employee_id: emp.id, skill_id: 's' + (Math.floor(Math.random() * 10) + 1), proficiency: Math.floor(Math.random() * 3) + 3 });
    employee_skills.push({ employee_id: emp.id, skill_id: 's' + (Math.floor(Math.random() * 5) + 11), proficiency: Math.floor(Math.random() * 2) + 2 });
    // 1 training for each
    employee_trainings.push({ employee_id: emp.id, training_id: 't' + (Math.floor(Math.random() * 5) + 1), status: Math.random() > 0.3 ? 'completed' : 'in_progress', completed_date: '2024-12-01', score: 85 });
});

export const seedData = {
    regions,
    skills,
    trainings,
    employees,
    projects: [
        { id: 'proj-001', name: 'Offshore Platform Structural Assessment', client: 'PetroGlobal Inc.', description: 'Comprehensive structural integrity assessment for aging offshore platform', status: 'active', region_id: 'reg-na', start_date: '2025-09-01', end_date: '2026-06-30', budget_hours: 4800, spent_hours: 2160, progress: 45, priority: 'high' },
        { id: 'proj-002', name: 'Refinery Expansion - Phase II', client: 'IndoRefine Ltd.', description: 'Process engineering and design for refinery capacity expansion', status: 'active', region_id: 'reg-sa', start_date: '2025-06-15', end_date: '2026-12-31', budget_hours: 12000, spent_hours: 6800, progress: 57, priority: 'critical' },
    ],
    assignments,
    deliverables: [
        { id: 'del-1', project_id: 'proj-001', title: 'Initial Structural Survey', assigned_to: 'emp-mda-1', due_date: '2025-10-15', status: 'completed' },
        { id: 'del-2', project_id: 'proj-001', title: 'Fatigue Life Analysis', assigned_to: 'emp-mda-2', due_date: '2026-01-20', status: 'in_progress' },
        { id: 'del-3', project_id: 'proj-002', title: 'Process Flow Diagrams', assigned_to: 'emp-mda-3', due_date: '2025-08-01', status: 'completed' },
    ],
    reviews: [
        {
            id: 'rev-1',
            project_id: 'proj-001',
            deliverable_id: 'del-1',
            reviewer_id: 'mgr-mda-1',
            review_date: '2025-10-20',
            status: 'approved',
            rating: 5,
            comments: 'Initial survey is comprehensive. Methodology is sound. No major findings.',
            doc_url: '/docs/reviews/proj-001-rev1.pdf',
            review_type: 'Technical'
        },
        {
            id: 'rev-2',
            project_id: 'proj-001',
            deliverable_id: 'del-1',
            reviewer_id: 'dept-mgr-mda',
            review_date: '2025-10-22',
            status: 'approved',
            rating: 4,
            comments: 'Good progress. Ensure the next phase focuses on fatigue analysis as planned.',
            doc_url: '/docs/reviews/proj-001-rev2.pdf',
            review_type: 'Managerial'
        },
        {
            id: 'rev-3',
            project_id: 'proj-002',
            deliverable_id: 'del-3',
            reviewer_id: 'mgr-mda-2',
            review_date: '2025-08-05',
            status: 'approved',
            rating: 5,
            comments: 'PFDs are accurate and follow all internal standards.',
            doc_url: '/docs/reviews/proj-002-rev1.pdf',
            review_type: 'Technical'
        }
    ],
    employee_skills,
    employee_trainings,
    workflows: [],
    workflow_steps: [],
    activities: [],
};
