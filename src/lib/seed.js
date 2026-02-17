export function seedDatabase(db) {
    // Regions
    const regions = [
        ['reg-na', 'North America', 'NA', 'America/New_York', '#6366f1'],
        ['reg-sa', 'South Asia', 'SA', 'Asia/Kolkata', '#f59e0b'],
        ['reg-eu', 'Europe', 'EU', 'Europe/London', '#10b981'],
        ['reg-la', 'Latin America', 'LATAM', 'America/Sao_Paulo', '#ef4444'],
        ['reg-uae', 'UAE', 'UAE', 'Asia/Dubai', '#8b5cf6'],
    ];
    for (const [id, name, code, tz, color] of regions) {
        db.run('INSERT INTO regions (id, name, code, timezone, color) VALUES (?,?,?,?,?)', [id, name, code, tz, color]);
    }

    // Skills
    const skills = [
        ['s1', 'Structural Analysis', 'Engineering'], ['s2', 'FEA/FEM', 'Engineering'], ['s3', 'CFD', 'Engineering'],
        ['s4', 'CAD Design', 'Design'], ['s5', 'Project Management', 'Management'], ['s6', 'Risk Assessment', 'Engineering'],
        ['s7', 'Quality Assurance', 'Quality'], ['s8', 'Python/Automation', 'Technology'], ['s9', 'Report Writing', 'Documentation'],
        ['s10', 'Client Communication', 'Soft Skills'], ['s11', 'ASME Standards', 'Standards'], ['s12', 'Piping Design', 'Engineering'],
        ['s13', 'Electrical Systems', 'Engineering'], ['s14', 'Process Engineering', 'Engineering'], ['s15', 'AI/ML Applications', 'Technology'],
    ];
    for (const [id, name, cat] of skills) {
        db.run('INSERT INTO skills (id, name, category) VALUES (?,?,?)', [id, name, cat]);
    }

    // Employees
    const employees = [
        ['emp-001', 'Rajesh Kumar', 'rajesh.kumar@engportal.com', 'Senior Structural Engineer', 'Structural', 'reg-sa', 'active', 85, '2020-03-15'],
        ['emp-002', 'Sarah Mitchell', 'sarah.mitchell@engportal.com', 'Project Manager', 'Management', 'reg-na', 'active', 92, '2019-06-01'],
        ['emp-003', 'Hans Weber', 'hans.weber@engportal.com', 'Lead Process Engineer', 'Process', 'reg-eu', 'active', 78, '2018-11-20'],
        ['emp-004', 'Maria Garcia', 'maria.garcia@engportal.com', 'Mechanical Engineer', 'Mechanical', 'reg-la', 'active', 65, '2021-01-10'],
        ['emp-005', 'Ahmed Al-Rashid', 'ahmed.alrashid@engportal.com', 'Electrical Engineer', 'Electrical', 'reg-uae', 'active', 88, '2020-07-22'],
        ['emp-006', 'Priya Sharma', 'priya.sharma@engportal.com', 'Quality Analyst', 'Quality', 'reg-sa', 'active', 70, '2021-05-15'],
        ['emp-007', 'James Anderson', 'james.anderson@engportal.com', 'Senior Piping Engineer', 'Piping', 'reg-na', 'on_leave', 0, '2017-09-01'],
        ['emp-008', 'Elena Petrova', 'elena.petrova@engportal.com', 'CAD Designer', 'Design', 'reg-eu', 'active', 95, '2019-04-18'],
        ['emp-009', 'Carlos Santos', 'carlos.santos@engportal.com', 'Risk Engineer', 'Risk', 'reg-la', 'active', 72, '2022-02-01'],
        ['emp-010', 'Fatima Hassan', 'fatima.hassan@engportal.com', 'Process Engineer', 'Process', 'reg-uae', 'travel', 60, '2021-08-10'],
        ['emp-011', 'Vikram Patel', 'vikram.patel@engportal.com', 'AI/ML Engineer', 'Technology', 'reg-sa', 'active', 90, '2022-06-15'],
        ['emp-012', 'Jennifer Lee', 'jennifer.lee@engportal.com', 'Technical Writer', 'Documentation', 'reg-na', 'active', 55, '2023-01-03'],
        ['emp-013', 'Klaus Müller', 'klaus.mueller@engportal.com', 'Civil Engineer', 'Civil', 'reg-eu', 'active', 80, '2020-10-12'],
        ['emp-014', 'Isabella Torres', 'isabella.torres@engportal.com', 'Project Coordinator', 'Management', 'reg-la', 'active', 68, '2022-09-20'],
        ['emp-015', 'Omar Khalil', 'omar.khalil@engportal.com', 'Instrumentation Engineer', 'Instrumentation', 'reg-uae', 'active', 82, '2019-12-05'],
        ['emp-016', 'Ananya Desai', 'ananya.desai@engportal.com', 'Data Analyst', 'Technology', 'reg-sa', 'active', 75, '2023-03-01'],
        ['emp-017', 'Michael Brown', 'michael.brown@engportal.com', 'Engineering Manager', 'Management', 'reg-na', 'active', 88, '2016-07-14'],
        ['emp-018', 'Sophie Dubois', 'sophie.dubois@engportal.com', 'Environmental Engineer', 'Environmental', 'reg-eu', 'active', 62, '2021-11-08'],
        ['emp-019', 'Luis Hernandez', 'luis.hernandez@engportal.com', 'CFD Specialist', 'Simulation', 'reg-la', 'active', 91, '2020-04-25'],
        ['emp-020', 'Rashid Al-Maktoum', 'rashid.almaktoum@engportal.com', 'Senior Project Manager', 'Management', 'reg-uae', 'active', 86, '2018-02-14'],
    ];
    for (const [id, name, email, role, dept, rid, status, util, jd] of employees) {
        db.run('INSERT INTO employees (id,name,email,role,department,region_id,status,utilization,join_date) VALUES (?,?,?,?,?,?,?,?,?)', [id, name, email, role, dept, rid, status, util, jd]);
    }

    // Employee Skills
    const empSkills = [
        ['emp-001', 's1', 5], ['emp-001', 's2', 4], ['emp-001', 's11', 5], ['emp-001', 's9', 3],
        ['emp-002', 's5', 5], ['emp-002', 's10', 5], ['emp-002', 's9', 4],
        ['emp-003', 's14', 5], ['emp-003', 's3', 4], ['emp-003', 's6', 3], ['emp-003', 's8', 3],
        ['emp-004', 's4', 4], ['emp-004', 's1', 3], ['emp-004', 's2', 4],
        ['emp-005', 's13', 5], ['emp-005', 's6', 3], ['emp-005', 's8', 4],
        ['emp-006', 's7', 5], ['emp-006', 's9', 4], ['emp-006', 's11', 4],
        ['emp-007', 's12', 5], ['emp-007', 's1', 4], ['emp-007', 's11', 5],
        ['emp-008', 's4', 5], ['emp-008', 's8', 3], ['emp-008', 's9', 3],
        ['emp-009', 's6', 5], ['emp-009', 's14', 3], ['emp-009', 's5', 3],
        ['emp-010', 's14', 4], ['emp-010', 's3', 4], ['emp-010', 's7', 3],
        ['emp-011', 's15', 5], ['emp-011', 's8', 5], ['emp-011', 's3', 3],
        ['emp-012', 's9', 5], ['emp-012', 's10', 4],
        ['emp-013', 's1', 4], ['emp-013', 's4', 3], ['emp-013', 's6', 4],
        ['emp-014', 's5', 4], ['emp-014', 's10', 4], ['emp-014', 's9', 3],
        ['emp-015', 's13', 4], ['emp-015', 's6', 3], ['emp-015', 's12', 3],
        ['emp-016', 's8', 4], ['emp-016', 's15', 4], ['emp-016', 's9', 3],
        ['emp-017', 's5', 5], ['emp-017', 's10', 5], ['emp-017', 's6', 4],
        ['emp-018', 's14', 3], ['emp-018', 's6', 4], ['emp-018', 's7', 3],
        ['emp-019', 's3', 5], ['emp-019', 's2', 4], ['emp-019', 's8', 4],
        ['emp-020', 's5', 5], ['emp-020', 's10', 5], ['emp-020', 's6', 4], ['emp-020', 's9', 4],
    ];
    for (const [eid, sid, prof] of empSkills) {
        db.run('INSERT INTO employee_skills (employee_id,skill_id,proficiency) VALUES (?,?,?)', [eid, sid, prof]);
    }

    // Projects
    const projects = [
        ['proj-001', 'Offshore Platform Structural Assessment', 'PetroGlobal Inc.', 'Comprehensive structural integrity assessment for aging offshore platform in the Gulf of Mexico', 'active', 'reg-na', '2025-09-01', '2026-06-30', 4800, 2160, 45, 'high'],
        ['proj-002', 'Refinery Expansion - Phase II', 'IndoRefine Ltd.', 'Process engineering and design for refinery capacity expansion in Gujarat', 'active', 'reg-sa', '2025-06-15', '2026-12-31', 12000, 6800, 57, 'critical'],
        ['proj-003', 'Wind Farm Foundation Design', 'EuroWind GmbH', 'Foundation design for 50-turbine offshore wind farm in the North Sea', 'active', 'reg-eu', '2025-11-01', '2026-08-15', 6400, 1920, 30, 'high'],
        ['proj-004', 'Mining Infrastructure Assessment', 'MineraCorp SA', 'Structural and environmental assessment for copper mining facility', 'active', 'reg-la', '2025-10-01', '2026-04-30', 3200, 2240, 70, 'medium'],
        ['proj-005', 'Desalination Plant Design', 'AquaGulf LLC', 'Full engineering design for large-scale desalination facility', 'active', 'reg-uae', '2025-07-01', '2026-09-30', 9600, 5760, 60, 'critical'],
        ['proj-006', 'Bridge Seismic Retrofit', 'CalTrans', 'Seismic retrofit design for highway bridge infrastructure', 'completed', 'reg-na', '2025-01-15', '2025-12-20', 5200, 5100, 100, 'high'],
        ['proj-007', 'Smart Factory Automation', 'TechManuf India', 'AI-driven automation design for automotive manufacturing plant', 'active', 'reg-sa', '2025-12-01', '2026-10-31', 7200, 1440, 20, 'medium'],
        ['proj-008', 'Pipeline Integrity Assessment', 'EuroPipe NV', 'Integrity assessment and remaining life analysis for gas pipeline network', 'on_hold', 'reg-eu', '2025-08-01', '2026-05-31', 4000, 1600, 40, 'medium'],
        ['proj-009', 'Petrochemical Complex Expansion', 'PetroBras', 'Engineering services for petrochemical complex expansion project', 'active', 'reg-la', '2026-01-05', '2026-11-30', 8000, 800, 10, 'high'],
        ['proj-010', 'Airport Terminal Structural Design', 'Dubai Aviation Auth', 'Structural design for new airport terminal building', 'active', 'reg-uae', '2025-05-01', '2027-03-31', 15000, 8250, 55, 'critical'],
    ];
    for (const [id, name, client, desc, status, rid, sd, ed, bh, sh, prog, pri] of projects) {
        db.run('INSERT INTO projects (id,name,client,description,status,region_id,start_date,end_date,budget_hours,spent_hours,progress,priority) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [id, name, client, desc, status, rid, sd, ed, bh, sh, prog, pri]);
    }

    // Project Assignments
    const assignments = [
        ['asgn-001', 'proj-001', 'emp-001', 'Lead Engineer', 960, 480], ['asgn-002', 'proj-001', 'emp-002', 'Project Manager', 480, 240],
        ['asgn-003', 'proj-001', 'emp-012', 'Technical Writer', 240, 100], ['asgn-004', 'proj-002', 'emp-003', 'Lead Process Engineer', 1200, 720],
        ['asgn-005', 'proj-002', 'emp-006', 'QA Lead', 600, 340], ['asgn-006', 'proj-002', 'emp-011', 'AI Engineer', 480, 280],
        ['asgn-007', 'proj-003', 'emp-013', 'Structural Engineer', 1600, 480], ['asgn-008', 'proj-003', 'emp-008', 'CAD Designer', 800, 300],
        ['asgn-009', 'proj-004', 'emp-009', 'Risk Engineer', 800, 560], ['asgn-010', 'proj-004', 'emp-004', 'Mechanical Engineer', 640, 450],
        ['asgn-011', 'proj-005', 'emp-005', 'Electrical Lead', 1920, 1150], ['asgn-012', 'proj-005', 'emp-015', 'Instrumentation Engineer', 1440, 860],
        ['asgn-013', 'proj-005', 'emp-020', 'Project Manager', 960, 580], ['asgn-014', 'proj-007', 'emp-011', 'AI/ML Lead', 1800, 360],
        ['asgn-015', 'proj-007', 'emp-016', 'Data Analyst', 1200, 240], ['asgn-016', 'proj-009', 'emp-019', 'CFD Specialist', 2000, 200],
        ['asgn-017', 'proj-009', 'emp-014', 'Coordinator', 800, 80], ['asgn-018', 'proj-010', 'emp-001', 'Structural Consultant', 1200, 660],
        ['asgn-019', 'proj-010', 'emp-010', 'Process Engineer', 1500, 825], ['asgn-020', 'proj-006', 'emp-017', 'Engineering Manager', 1040, 1020],
    ];
    for (const [id, pid, eid, role, ah, sh] of assignments) {
        db.run('INSERT INTO project_assignments (id,project_id,employee_id,role,allocated_hours,spent_hours) VALUES (?,?,?,?,?,?)', [id, pid, eid, role, ah, sh]);
    }

    // Deliverables
    const deliverables = [
        ['del-001', 'proj-001', 'Structural Integrity Report', 'in_progress', '2026-03-15', null, 'emp-001'],
        ['del-002', 'proj-001', 'FEA Model & Results', 'completed', '2026-01-30', '2026-01-28', 'emp-001'],
        ['del-003', 'proj-001', 'Risk Assessment Document', 'pending', '2026-04-30', null, 'emp-002'],
        ['del-004', 'proj-002', 'P&ID Drawings', 'in_progress', '2026-04-15', null, 'emp-003'],
        ['del-005', 'proj-002', 'Process Simulation Report', 'completed', '2025-12-31', '2025-12-29', 'emp-003'],
        ['del-006', 'proj-002', 'Quality Inspection Plan', 'in_progress', '2026-05-01', null, 'emp-006'],
        ['del-007', 'proj-003', 'Foundation Design Calculations', 'in_progress', '2026-04-01', null, 'emp-013'],
        ['del-008', 'proj-003', '3D CAD Models', 'in_progress', '2026-05-15', null, 'emp-008'],
        ['del-009', 'proj-004', 'Environmental Impact Assessment', 'completed', '2026-01-15', '2026-01-12', 'emp-009'],
        ['del-010', 'proj-005', 'Electrical System Design', 'in_progress', '2026-06-30', null, 'emp-005'],
        ['del-011', 'proj-005', 'Instrumentation Layout', 'in_progress', '2026-05-15', null, 'emp-015'],
        ['del-012', 'proj-005', 'Project Status Report Q1', 'completed', '2026-01-31', '2026-01-30', 'emp-020'],
        ['del-013', 'proj-010', 'Structural Design Package', 'in_progress', '2026-06-30', null, 'emp-001'],
        ['del-014', 'proj-007', 'AI Model Specifications', 'in_progress', '2026-04-01', null, 'emp-011'],
        ['del-015', 'proj-009', 'CFD Analysis Report', 'pending', '2026-05-30', null, 'emp-019'],
    ];
    for (const [id, pid, title, status, dd, cd, at] of deliverables) {
        db.run('INSERT INTO deliverables (id,project_id,title,status,due_date,completed_date,assigned_to) VALUES (?,?,?,?,?,?,?)', [id, pid, title, status, dd, cd, at]);
    }

    // Reviews
    const reviews = [
        ['rev-001', 'proj-001', 'del-002', 'emp-017', 'Technical', 'completed', 'FEA results are comprehensive. Minor corrections needed in load case 3.', 4, '2026-01-29'],
        ['rev-002', 'proj-002', 'del-005', 'emp-006', 'Quality', 'completed', 'Process simulation meets all quality standards. Approved.', 5, '2025-12-30'],
        ['rev-003', 'proj-004', 'del-009', 'emp-018', 'Environmental', 'completed', 'EIA is thorough. All regulatory requirements covered.', 5, '2026-01-13'],
        ['rev-004', 'proj-005', 'del-012', 'emp-020', 'Management', 'completed', 'Status report accurately reflects project health. Good detail.', 4, '2026-01-31'],
        ['rev-005', 'proj-001', 'del-001', 'emp-017', 'Technical', 'in_progress', null, null, null],
        ['rev-006', 'proj-003', 'del-007', 'emp-001', 'Peer Review', 'pending', null, null, null],
    ];
    for (const [id, pid, did, rid, type, status, comments, rating, rd] of reviews) {
        db.run('INSERT INTO reviews (id,project_id,deliverable_id,reviewer_id,review_type,status,comments,rating,review_date) VALUES (?,?,?,?,?,?,?,?,?)', [id, pid, did, rid, type, status, comments, rating, rd]);
    }

    // Trainings
    const trainings = [
        ['trn-001', 'Advanced FEA Techniques', 'Technical', 'Deep dive into nonlinear FEA analysis', 40, 'ANSYS Academy', 0],
        ['trn-002', 'ASME Code Compliance', 'Standards', 'ASME Section VIII Division 1 & 2', 24, 'ASME Training', 1],
        ['trn-003', 'Project Management Professional', 'Management', 'PMP certification prep course', 60, 'PMI Institute', 0],
        ['trn-004', 'AI/ML for Engineering', 'Technology', 'Applying machine learning to engineering problems', 32, 'Coursera', 0],
        ['trn-005', 'Safety & Risk Management', 'Safety', 'Industrial safety and risk assessment methodologies', 16, 'Internal', 1],
        ['trn-006', 'Technical Report Writing', 'Documentation', 'Best practices in technical documentation', 8, 'Internal', 0],
        ['trn-007', 'AutoCAD Advanced', 'Design', 'Advanced AutoCAD techniques for engineering drawings', 20, 'Autodesk', 0],
        ['trn-008', 'Cyber Security Awareness', 'IT', 'Mandatory cyber security training', 4, 'Internal', 1],
    ];
    for (const [id, title, cat, desc, dur, prov, mand] of trainings) {
        db.run('INSERT INTO trainings (id,title,category,description,duration_hours,provider,mandatory) VALUES (?,?,?,?,?,?,?)', [id, title, cat, desc, dur, prov, mand]);
    }

    // Employee Trainings
    const empTrainings = [
        ['emp-001', 'trn-001', 'completed', '2025-06-15', 92], ['emp-001', 'trn-002', 'completed', '2025-03-20', 88], ['emp-001', 'trn-005', 'completed', '2025-09-10', 95],
        ['emp-002', 'trn-003', 'completed', '2024-12-01', 90], ['emp-002', 'trn-005', 'completed', '2025-09-10', 87], ['emp-002', 'trn-008', 'completed', '2025-11-01', 100],
        ['emp-003', 'trn-004', 'in_progress', null, null], ['emp-003', 'trn-005', 'completed', '2025-09-10', 91],
        ['emp-004', 'trn-001', 'in_progress', null, null], ['emp-004', 'trn-007', 'completed', '2025-08-20', 85],
        ['emp-005', 'trn-005', 'completed', '2025-09-10', 93], ['emp-005', 'trn-008', 'completed', '2025-11-01', 100],
        ['emp-006', 'trn-002', 'completed', '2025-04-15', 96], ['emp-006', 'trn-006', 'completed', '2025-07-01', 88],
        ['emp-008', 'trn-007', 'completed', '2025-05-10', 97],
        ['emp-011', 'trn-004', 'completed', '2025-08-01', 98], ['emp-011', 'trn-008', 'completed', '2025-11-01', 100],
        ['emp-012', 'trn-006', 'completed', '2025-02-15', 94],
        ['emp-013', 'trn-001', 'completed', '2025-07-20', 89],
        ['emp-017', 'trn-003', 'completed', '2023-06-01', 95], ['emp-017', 'trn-005', 'completed', '2025-09-10', 92],
        ['emp-019', 'trn-001', 'completed', '2025-06-15', 91], ['emp-019', 'trn-004', 'in_progress', null, null],
    ];
    for (const [eid, tid, status, date, score] of empTrainings) {
        db.run('INSERT INTO employee_trainings (employee_id,training_id,status,completion_date,score) VALUES (?,?,?,?,?)', [eid, tid, status, date, score]);
    }

    // Workflows
    const workflows = [
        ['wf-001', 'Engineering Deliverable Review', 'Standard review process for engineering deliverables', 'active', 'emp-017'],
        ['wf-002', 'New Project Onboarding', 'Process for setting up a new engineering project', 'active', 'emp-002'],
        ['wf-003', 'Travel Request Approval', 'Travel request and approval workflow', 'active', 'emp-017'],
        ['wf-004', 'Training Enrollment', 'Process for enrolling in training programs', 'draft', 'emp-002'],
    ];
    for (const [id, name, desc, status, cb] of workflows) {
        db.run('INSERT INTO workflows (id,name,description,status,created_by) VALUES (?,?,?,?,?)', [id, name, desc, status, cb]);
    }

    // Workflow Steps
    const wfSteps = [
        ['ws-001', 'wf-001', 1, 'Submit Deliverable', 'Engineer', 'active'], ['ws-002', 'wf-001', 2, 'Peer Review', 'Senior Engineer', 'active'],
        ['ws-003', 'wf-001', 3, 'QA Check', 'Quality Analyst', 'active'], ['ws-004', 'wf-001', 4, 'Manager Approval', 'Engineering Manager', 'active'],
        ['ws-005', 'wf-001', 5, 'Client Delivery', 'Project Manager', 'active'], ['ws-006', 'wf-002', 1, 'Project Charter Creation', 'Project Manager', 'active'],
        ['ws-007', 'wf-002', 2, 'Resource Allocation', 'Engineering Manager', 'active'], ['ws-008', 'wf-002', 3, 'Kickoff Meeting', 'Project Manager', 'active'],
        ['ws-009', 'wf-002', 4, 'Setup Project Tools', 'IT Support', 'active'], ['ws-010', 'wf-003', 1, 'Submit Travel Request', 'Employee', 'active'],
        ['ws-011', 'wf-003', 2, 'Manager Approval', 'Manager', 'active'], ['ws-012', 'wf-003', 3, 'Finance Approval', 'Finance', 'active'],
        ['ws-013', 'wf-003', 4, 'Book Travel', 'Admin', 'active'],
    ];
    for (const [id, wid, order, title, role, status] of wfSteps) {
        db.run('INSERT INTO workflow_steps (id,workflow_id,step_order,title,assignee_role,status) VALUES (?,?,?,?,?,?)', [id, wid, order, title, role, status]);
    }

    // Leave & Travel
    const leaveTravel = [
        ['lt-001', 'emp-007', 'leave', '2026-02-10', '2026-02-24', null, 'approved', 'Annual vacation'],
        ['lt-002', 'emp-010', 'travel', '2026-02-15', '2026-02-20', 'Mumbai, India', 'approved', 'Client meeting - Refinery project'],
        ['lt-003', 'emp-002', 'travel', '2026-03-01', '2026-03-05', 'Houston, TX', 'pending', 'Project kickoff meeting'],
        ['lt-004', 'emp-013', 'leave', '2026-03-15', '2026-03-19', null, 'pending', 'Personal leave'],
        ['lt-005', 'emp-005', 'travel', '2026-02-25', '2026-03-02', 'Abu Dhabi', 'approved', 'Site inspection - Desalination project'],
        ['lt-006', 'emp-017', 'travel', '2026-04-10', '2026-04-15', 'London, UK', 'pending', 'European client meetings'],
    ];
    for (const [id, eid, type, sd, ed, dest, status, reason] of leaveTravel) {
        db.run('INSERT INTO leave_travel (id,employee_id,type,start_date,end_date,destination,status,reason) VALUES (?,?,?,?,?,?,?,?)', [id, eid, type, sd, ed, dest, status, reason]);
    }

    // Activity Log
    const activities = [
        ['act-001', 'emp-001', 'Completed deliverable review', 'deliverable', 'del-002', 'FEA Model & Results marked as completed', '2026-02-17T08:30:00'],
        ['act-002', 'emp-003', 'Updated project progress', 'project', 'proj-002', 'Refinery Expansion progress updated to 57%', '2026-02-17T07:15:00'],
        ['act-003', 'emp-011', 'Started new task', 'deliverable', 'del-014', 'AI Model Specifications work initiated', '2026-02-16T14:20:00'],
        ['act-004', 'emp-005', 'Travel approved', 'leave_travel', 'lt-005', 'Travel to Abu Dhabi approved for site inspection', '2026-02-16T10:45:00'],
        ['act-005', 'emp-006', 'Completed training', 'training', 'trn-002', 'ASME Code Compliance training completed with score 96', '2026-02-15T16:30:00'],
        ['act-006', 'emp-019', 'Submitted deliverable', 'deliverable', 'del-015', 'CFD Analysis Report submitted for review', '2026-02-15T11:00:00'],
        ['act-007', 'emp-017', 'Project review meeting', 'project', 'proj-001', 'Quarterly review meeting for Offshore Platform project', '2026-02-14T15:00:00'],
        ['act-008', 'emp-008', 'Uploaded CAD files', 'deliverable', 'del-008', '3D CAD Models - Revision 3 uploaded', '2026-02-14T09:30:00'],
    ];
    for (const [id, eid, action, etype, eid2, details, ts] of activities) {
        db.run('INSERT INTO activity_log (id,employee_id,action,entity_type,entity_id,details,timestamp) VALUES (?,?,?,?,?,?,?)', [id, eid, action, etype, eid2, details, ts]);
    }
}
