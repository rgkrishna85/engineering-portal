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

const departments = ['MDA', 'ICEE', 'OPS', 'PE', 'PPE'];

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
const names = ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna', 'Harper'];
const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// Helper to create a department hierarchy
const createDepartment = (deptCode, headName, managerNames, employeeCount) => {
    const headId = `dept-mgr-${deptCode.toLowerCase()}`;

    // Create Dept Head
    employees.push({
        id: headId,
        name: headName,
        email: `${headName.toLowerCase().replace(' ', '.')}@engportal.com`,
        role: `${deptCode} Department Head`,
        department: deptCode,
        region_id: 'reg-na',
        status: 'active',
        utilization: 65,
        join_date: '2010-05-15',
        manager_id: null,
        workload: genWorkload(),
        dailyWorkload: genDailyWorkload('active')
    });

    // Create Unit Managers
    const managers = managerNames.map((name, idx) => {
        const mgrId = `mgr-${deptCode.toLowerCase()}-${idx + 1}`;
        const mgr = {
            id: mgrId,
            name,
            email: `${name.toLowerCase().replace(' ', '.')}@engportal.com`,
            role: `${deptCode} Unit Manager`,
            department: deptCode,
            region_id: regions[idx % regions.length].id,
            status: 'active',
            utilization: 80,
            join_date: '2015-01-20',
            manager_id: headId,
            workload: genWorkload(),
            dailyWorkload: genDailyWorkload('active')
        };
        employees.push(mgr);
        return mgr;
    });

    // Create Employees
    for (let i = 1; i <= employeeCount; i++) {
        const mgr = managers[i % managers.length];
        const name = names[Math.floor(Math.random() * names.length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        const empStatus = Math.random() > 0.1 ? 'active' : 'on_leave';
        employees.push({
            id: `emp-${deptCode.toLowerCase()}-${i}`,
            name: `${name} ${surname} ${i}`,
            email: `${name.toLowerCase()}.${surname.toLowerCase()}${i}@engportal.com`,
            role: i % 5 === 0 ? 'Senior Engineer' : 'Junior Engineer',
            department: deptCode,
            region_id: mgr.region_id,
            status: empStatus,
            utilization: Math.floor(Math.random() * 40) + 60,
            join_date: '2022-03-10',
            manager_id: mgr.id,
            workload: genWorkload(),
            dailyWorkload: genDailyWorkload(empStatus)
        });
    }
};

// Create Hierarchies for all departments
createDepartment('MDA', 'James Sterling', ['Robert Chen', 'Anjali Gupta', 'Marcus Steiner', 'Elena Rodriguez'], 50);
createDepartment('ICEE', 'Hiroshi Tanaka', ['Kenji Sato', 'Mei Ling', 'David Park'], 40);
createDepartment('OPS', 'Sarah Miller', ['John Thompson', 'Maria Garcia'], 30);
createDepartment('PE', 'Arthur Windsor', ['Thomas Shelby', 'Elizabeth Swann'], 35);
createDepartment('PPE', 'Victoria Vance', ['Leo Messi', 'Cristiano Ronaldo'], 25);

const assignments = [];
const employee_skills = [];
const employee_trainings = [];

employees.forEach(emp => {
    employee_skills.push({ employee_id: emp.id, skill_id: 's' + (Math.floor(Math.random() * 10) + 1), proficiency: Math.floor(Math.random() * 3) + 3 });
    employee_skills.push({ employee_id: emp.id, skill_id: 's' + (Math.floor(Math.random() * 5) + 11), proficiency: Math.floor(Math.random() * 2) + 2 });
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
        { id: 'rev-1', project_id: 'proj-001', deliverable_id: 'del-1', reviewer_id: 'mgr-mda-1', review_date: '2025-10-20', status: 'approved', rating: 5, comments: 'Initial survey is comprehensive. Methodology is sound. No major findings.', doc_url: '/docs/reviews/proj-001-rev1.pdf', review_type: 'Technical' },
        { id: 'rev-2', project_id: 'proj-001', deliverable_id: 'del-1', reviewer_id: 'dept-mgr-mda', review_date: '2025-10-22', status: 'approved', rating: 4, comments: 'Good progress. Ensure the next phase focuses on fatigue analysis as planned.', doc_url: '/docs/reviews/proj-001-rev2.pdf', review_type: 'Managerial' },
        { id: 'rev-3', project_id: 'proj-002', deliverable_id: 'del-3', reviewer_id: 'mgr-mda-2', review_date: '2025-08-05', status: 'approved', rating: 5, comments: 'PFDs are accurate and follow all internal standards.', doc_url: '/docs/reviews/proj-002-rev1.pdf', review_type: 'Technical' }
    ],
    employee_skills,
    employee_trainings,
    workflows: [],
    workflow_steps: [],
    activities: [],
};
