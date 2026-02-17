const regions = [
    { id: 'reg-na', name: 'North America', code: 'NA', timezone: 'America/New_York', color: '#6366f1' },
    { id: 'reg-sa', name: 'South Asia', code: 'SA', timezone: 'Asia/Kolkata', color: '#f59e0b' },
    { id: 'reg-eu', name: 'Europe', code: 'EU', timezone: 'Europe/London', color: '#10b981' },
    { id: 'reg-la', name: 'Latin America', code: 'LATAM', timezone: 'America/Sao_Paulo', color: '#ef4444' },
    { id: 'reg-uae', name: 'UAE', code: 'UAE', timezone: 'Asia/Dubai', color: '#8b5cf6' },
];

const skills = [
    { id: 's1', name: 'Structural Analysis', category: 'Engineering' },
    { id: 's2', name: 'AutoCAD Plant3D', category: 'Design' },
    { id: 's3', name: 'AVEVA E3D', category: 'Design' },
    { id: 's4', name: 'Solidworks (Skids)', category: 'Design' },
    { id: 's5', name: 'PLC Programming', category: 'Electrical' },
    { id: 's6', name: 'Pump NPSH/Hydraulics', category: 'Process' },
    { id: 's7', name: 'Cable Sizing/Routing', category: 'Electrical' },
    { id: 's8', name: 'Instrument Data Sheets', category: 'Instrumentation' },
    { id: 's9', name: 'Proposal Estimation', category: 'Management' },
    { id: 's10', name: 'Vendor Mgmt (Grundfos/Piller)', category: 'Management' },
];

const departments = ['MDA', 'ICEE', 'OPS', 'PE', 'PPE'];

const activities_list = [
    'AutoCAD Plant3D Model Update',
    'AVEVA E3D Piping Design',
    'Solidworks Skid Structural Calc',
    'Pump NPSH/Line Sizing (PE)',
    'PLC Logic Routine Check',
    'Control Panel Wiring Design',
    'Cable Tray Routing Plan (ICEE)',
    'Instrument Data Sheet Audit',
    'Proposal Bid Revision (PPE)',
    'Vendor Quote Audit (Grundfos/Bray)',
];

const trainings = [
    { id: 't1', title: 'Advanced Plant3D Modeling', category: 'Engineering', provider: 'Internal Academy', duration_hours: 40, mandatory: 1 },
    { id: 't2', title: 'PLC Security Standards', category: 'Management', provider: 'Siemens', duration_hours: 24, mandatory: 1 },
    { id: 't3', title: 'Solidworks Skid Design Pro', category: 'Safety', provider: 'Solidworks Cert', duration_hours: 32, mandatory: 0 },
    { id: 't4', title: 'Desalination Process Fundamentals', category: 'Technology', provider: 'ProcessPro', duration_hours: 16, mandatory: 1 },
    { id: 't5', title: 'Contractual Risks in Bidding (PPE)', category: 'Quality', provider: 'LegalCorp', duration_hours: 8, mandatory: 0 },
];

// Helper to generate random daily workload and activities for 5 days (Current Week)
const genDailyWorkload = (dept, empStatus) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dept_specific_activities = activities_list.filter(a => {
        if (dept === 'ICEE') return a.includes('PLC') || a.includes('Cable') || a.includes('Instrument') || a.includes('Panel');
        if (dept === 'PE') return a.includes('Pump') || a.includes('Line') || a.includes('Process') || a.includes('Vendor');
        if (dept === 'PPE') return a.includes('Proposal') || a.includes('Bid');
        if (dept === 'MDA') return a.includes('Plant3D') || a.includes('AVEVA') || a.includes('Solidworks') || a.includes('Structural');
        return true;
    });

    return days.map(day => {
        if (empStatus === 'on_leave') return { day, hours: 0, status: 'leave', activity: 'Annual Leave' };
        if (Math.random() < 0.05) return { day, hours: 0, status: 'holiday', activity: 'Public Holiday' };
        const rand = Math.random();
        let hours, status;
        if (rand < 0.1) { hours = 0; status = 'no-load'; }
        else if (rand < 0.3) { hours = Math.floor(Math.random() * 7) + 1; status = 'partial'; }
        else if (rand < 0.8) { hours = 8; status = 'standard'; }
        else { hours = 9 + Math.floor(Math.random() * 3); status = 'overtime'; }

        let act = dept_specific_activities.length > 0
            ? dept_specific_activities[Math.floor(Math.random() * dept_specific_activities.length)]
            : activities_list[Math.floor(Math.random() * activities_list.length)];

        return { day, hours, status, activity: hours > 0 ? act : 'Admin / Documentation' };
    });
};

const genWorkload = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 15) + 35);

const employees = [];
const names = ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna', 'Harper'];
const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const createDepartment = (deptCode, headName, managerNames, employeeCount) => {
    const headId = `dept-mgr-${deptCode.toLowerCase()}`;
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
        dailyWorkload: genDailyWorkload(deptCode, 'active')
    });

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
            dailyWorkload: genDailyWorkload(deptCode, 'active')
        };
        employees.push(mgr);
        return mgr;
    });

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
            dailyWorkload: genDailyWorkload(deptCode, empStatus)
        });
    }
};

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
    employee_trainings.push({ employee_id: emp.id, training_id: 't' + (Math.floor(Math.random() * 5) + 1), status: Math.random() > 0.3 ? 'completed' : 'in_progress', completed_date: '2024-12-01', score: 85 });
});

export const seedData = {
    regions,
    skills,
    trainings,
    employees,
    projects: [
        { id: 'proj-001', name: 'SWRO Desalination Plant B - Dubai', client: 'AE Water Authority', description: 'Sea Water Reverse Osmosis Desalination complex including 3D piping and E&I design.', status: 'active', region_id: 'reg-uae', start_date: '2025-01-01', end_date: '2026-12-31', budget_hours: 15000, spent_hours: 3200, progress: 21, priority: 'critical' },
        { id: 'proj-002', name: 'Industrial WWTP Expansion - Calgary', client: 'OilSands Global', description: 'Treatment plant for industrial wastewater using advanced skids and AutoCAD Plant3D.', status: 'active', region_id: 'reg-na', start_date: '2025-03-15', end_date: '2026-04-30', budget_hours: 8000, spent_hours: 4500, progress: 56, priority: 'high' },
        { id: 'proj-003', name: 'Chemical Dosing Skid - Project Alpha', client: 'PharmaCore SA', description: 'Bespoke Solidworks design for dosing skids including Piller pumps and Bray valves.', status: 'active', region_id: 'reg-sa', start_date: '2025-06-01', end_date: '2025-12-31', budget_hours: 2400, spent_hours: 200, progress: 8, priority: 'medium' },
        { id: 'proj-004', name: 'Desalination Plant C - Proposal Phase', client: 'Gulf Resources', description: 'Bidding stage for a mega-scale desalination project in UAE.', status: 'proposal', region_id: 'reg-uae', start_date: '2025-08-01', end_date: '2025-09-30', budget_hours: 500, spent_hours: 120, progress: 24, priority: 'high' }
    ],
    assignments: [
        { id: 'as-1', project_id: 'proj-001', employee_id: 'mgr-mda-1', role: 'Piping Design Lead (Plant3D)' },
        { id: 'as-2', project_id: 'proj-001', employee_id: 'mgr-icee-1', role: 'E&I Lead (PLC/Panels)' },
        { id: 'as-3', project_id: 'proj-001', employee_id: 'mgr-pe-1', role: 'Process Lead (NPSH/Line Sizing)' }
    ],
    deliverables: [
        { id: 'del-1', project_id: 'proj-001', title: 'Plant3D 3D Piping Layout v1', assigned_to: 'emp-mda-1', due_date: '2025-11-15', status: 'in_progress' },
        { id: 'del-2', project_id: 'proj-001', title: 'AVEVA E3D Equipment Plot Plan', assigned_to: 'emp-mda-2', due_date: '2025-10-30', status: 'completed' },
        { id: 'del-3', project_id: 'proj-001', title: 'PLC Logic Flow Diagrams', assigned_to: 'emp-icee-1', due_date: '2025-12-10', status: 'in_progress' },
        { id: 'del-4', project_id: 'proj-001', title: 'Pump NPSH Calculations (Grundfos)', assigned_to: 'emp-pe-1', due_date: '2025-09-20', status: 'completed' },
        { id: 'del-5', project_id: 'proj-002', title: 'Solidworks Skid Structural Model', assigned_to: 'emp-mda-5', due_date: '2025-08-15', status: 'completed' },
        { id: 'del-6', project_id: 'proj-002', title: 'Cable Tray Routing Detail', assigned_to: 'emp-icee-5', due_date: '2025-11-01', status: 'in_progress' },
        { id: 'del-7', project_id: 'proj-003', title: 'Control Valve Data Sheet (Bray)', assigned_to: 'emp-icee-10', due_date: '2025-07-15', status: 'in_progress' },
        { id: 'del-8', project_id: 'proj-004', title: 'Bidding Proposal Final Doc', assigned_to: 'emp-ppe-1', due_date: '2025-09-25', status: 'in_progress' }
    ],
    reviews: [
        { id: 'rev-1', project_id: 'proj-001', deliverable_id: 'del-4', reviewer_id: 'dept-mgr-pe', review_date: '2025-09-22', status: 'approved', rating: 5, comments: 'NPSH calcs for Grundfos pumps are accurate. Margin is safe.', doc_url: '/docs/reviews/proj-001-npsh.pdf', review_type: 'Technical' },
        { id: 'rev-2', project_id: 'proj-001', deliverable_id: 'del-2', reviewer_id: 'mgr-mda-1', review_date: '2025-11-01', status: 'approved', rating: 5, comments: 'AVEVA E3D equipment placement approved. Clear of all pipe racks.', doc_url: '/docs/reviews/proj-001-e3d.pdf', review_type: 'Technical' },
        { id: 'rev-3', project_id: 'proj-002', deliverable_id: 'del-5', reviewer_id: 'dept-mgr-mda', review_date: '2025-08-18', status: 'approved', rating: 4, comments: 'Solidworks structural analysis shows skid is stable under load.', doc_url: '/docs/reviews/proj-002-skid.pdf', review_type: 'Technical' }
    ],
    employee_skills,
    employee_trainings,
    workflows: [],
    workflow_steps: [],
    activities: [],
};
