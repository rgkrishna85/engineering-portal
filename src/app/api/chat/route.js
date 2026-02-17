import { getDbPromise, queryAll, queryOne, runQuery, saveDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const POLICIES = {
    leave: `**Leave Policy:**\n• Employees are entitled to 24 days of annual leave per year.\n• Sick leave: Up to 12 days per year with medical certificate.\n• Leave requests must be submitted at least 2 weeks in advance.\n• Manager approval is required for all leave types.\n• Unused leave can be carried forward up to 5 days.`,
    travel: `**Travel Policy:**\n• All business travel must be pre-approved by your manager.\n• International travel requires VP-level approval.\n• Economy class for flights under 6 hours; business class for 6+ hours.\n• Per diem rates vary by region — contact Finance for current rates.\n• Travel expense reports must be submitted within 7 days of return.`,
    review: `**Code/Engineering Review Process:**\n1. Engineer submits deliverable for peer review.\n2. Senior engineer conducts technical review (2-day SLA).\n3. Quality Analyst performs QA check.\n4. Engineering Manager gives final approval.\n5. Project Manager coordinates client delivery.\n• All deliverables must have at least 2 reviews before client submission.`,
    training: `**Training Policy:**\n• Each employee is allocated 40 hours of training per year.\n• Mandatory trainings must be completed within 30 days of assignment.\n• External training requests require manager approval.\n• Certification reimbursement up to $2,000/year.\n• Completed trainings are tracked in your employee profile.`,
    timesheet: `**Timesheet Policy:**\n• Timesheets must be submitted weekly by Friday 5 PM local time.\n• Minimum billing increment is 0.5 hours.\n• All project hours must be allocated to specific project tasks.\n• Non-billable time should be categorized (admin, training, internal meetings).\n• Late timesheet submissions require manager justification.`,
    wfh: `**Work From Home Policy:**\n• Hybrid work model: 3 days office, 2 days remote per week.\n• Core hours: 10 AM – 4 PM in your local timezone.\n• Remote work equipment allowance: $500 one-time.\n• VPN must be active for all remote work sessions.\n• Manager must be notified of WFH days in advance.`,
};

function findPolicy(message) {
    const lower = message.toLowerCase();
    if (lower.includes('leave') || lower.includes('vacation') || lower.includes('pto') || lower.includes('day off')) return POLICIES.leave;
    if (lower.includes('travel') || lower.includes('trip') || lower.includes('flight') || lower.includes('per diem')) return POLICIES.travel;
    if (lower.includes('review') || lower.includes('approval') || lower.includes('sign off') || lower.includes('code review')) return POLICIES.review;
    if (lower.includes('training') || lower.includes('certification') || lower.includes('course') || lower.includes('learning')) return POLICIES.training;
    if (lower.includes('timesheet') || lower.includes('time sheet') || lower.includes('billing') || lower.includes('hours log')) return POLICIES.timesheet;
    if (lower.includes('wfh') || lower.includes('work from home') || lower.includes('remote') || lower.includes('hybrid')) return POLICIES.wfh;
    return null;
}

function queryProjectData(db, message) {
    const lower = message.toLowerCase();

    if (lower.includes('hours') || lower.includes('time spent') || lower.includes('budget')) {
        const projects = queryAll(db, 'SELECT name, budget_hours, spent_hours, ROUND(CAST(spent_hours AS FLOAT) / NULLIF(budget_hours, 0) * 100, 1) as utilization_pct, status, priority FROM projects ORDER BY spent_hours DESC');
        let response = '**Project Hours Summary:**\n\n| Project | Budget | Spent | Utilization | Status |\n|---------|--------|-------|-------------|--------|\n';
        for (const p of projects) response += `| ${p.name} | ${p.budget_hours}h | ${p.spent_hours}h | ${p.utilization_pct || 0}% | ${p.status} |\n`;
        return response;
    }

    if (lower.includes('workload') || lower.includes('utilization') || lower.includes('loaded') || lower.includes('availability')) {
        const employees = queryAll(db, 'SELECT e.name, e.role, e.utilization, e.status, r.name as region FROM employees e LEFT JOIN regions r ON e.region_id = r.id ORDER BY e.utilization DESC');
        let response = '**Employee Workload Overview:**\n\n| Employee | Role | Utilization | Status | Region |\n|----------|------|-------------|--------|--------|\n';
        for (const e of employees) { const bar = e.utilization >= 90 ? '🔴' : e.utilization >= 70 ? '🟡' : '🟢'; response += `| ${e.name} | ${e.role} | ${bar} ${e.utilization}% | ${e.status} | ${e.region} |\n`; }
        return response;
    }

    if (lower.includes('deliverable') || lower.includes('delivery') || lower.includes('due date')) {
        const deliverables = queryAll(db, 'SELECT d.title, d.status, d.due_date, p.name as project, e.name as assignee FROM deliverables d JOIN projects p ON d.project_id = p.id LEFT JOIN employees e ON d.assigned_to = e.id ORDER BY d.due_date ASC');
        let response = '**Engineering Deliverables:**\n\n| Deliverable | Project | Assignee | Due Date | Status |\n|-------------|---------|----------|----------|--------|\n';
        for (const d of deliverables) response += `| ${d.title} | ${d.project} | ${d.assignee || 'Unassigned'} | ${d.due_date} | ${d.status} |\n`;
        return response;
    }

    if (lower.includes('review') && (lower.includes('project') || lower.includes('completed') || lower.includes('pending'))) {
        const reviews = queryAll(db, 'SELECT rv.review_type, rv.status, rv.rating, rv.review_date, d.title as deliverable, p.name as project, e.name as reviewer FROM reviews rv JOIN deliverables d ON rv.deliverable_id = d.id JOIN projects p ON rv.project_id = p.id JOIN employees e ON rv.reviewer_id = e.id ORDER BY rv.review_date DESC');
        let response = '**Review Summary:**\n\n| Deliverable | Project | Reviewer | Type | Status | Rating |\n|-------------|---------|----------|------|--------|--------|\n';
        for (const r of reviews) response += `| ${r.deliverable} | ${r.project} | ${r.reviewer} | ${r.review_type} | ${r.status} | ${r.rating ? '⭐'.repeat(r.rating) : 'N/A'} |\n`;
        return response;
    }

    if (lower.includes('skill') || lower.includes('expertise') || lower.includes('capability')) {
        const skills = queryAll(db, 'SELECT s.name, s.category, COUNT(es.employee_id) as employee_count, ROUND(AVG(es.proficiency), 1) as avg_proficiency FROM skills s LEFT JOIN employee_skills es ON s.id = es.skill_id GROUP BY s.id ORDER BY employee_count DESC');
        let response = '**Skills Matrix Overview:**\n\n| Skill | Category | Employees | Avg Proficiency |\n|-------|----------|-----------|------------------|\n';
        for (const s of skills) { const stars = '★'.repeat(Math.round(s.avg_proficiency)) + '☆'.repeat(5 - Math.round(s.avg_proficiency)); response += `| ${s.name} | ${s.category} | ${s.employee_count} | ${stars} (${s.avg_proficiency}) |\n`; }
        return response;
    }

    if (lower.includes('project') || lower.includes('status')) {
        const projects = queryAll(db, "SELECT p.name, p.client, p.status, p.progress, p.priority, r.name as region, (SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id) as team_size FROM projects p LEFT JOIN regions r ON p.region_id = r.id ORDER BY p.priority DESC");
        let response = '**Project Status Overview:**\n\n| Project | Client | Region | Progress | Priority | Team | Status |\n|---------|--------|--------|----------|----------|------|--------|\n';
        for (const p of projects) { const bar = `${'█'.repeat(Math.floor(p.progress / 10))}${'░'.repeat(10 - Math.floor(p.progress / 10))}`; response += `| ${p.name} | ${p.client} | ${p.region} | ${bar} ${p.progress}% | ${p.priority} | ${p.team_size} | ${p.status} |\n`; }
        return response;
    }

    return null;
}

export async function POST(request) {
    try {
        const db = await getDbPromise();
        const { message } = await request.json();
        if (!message || !message.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        let response = findPolicy(message);
        if (!response) response = queryProjectData(db, message);
        if (!response) response = `I can help you with the following:\n\n🏢 **Company Policies**: Ask about leave, travel, review process, training, timesheet, or WFH policies.\n\n📊 **Project Data**: Ask about project status, hours spent, deliverables, reviews, or team workload.\n\n👥 **Employee Info**: Ask about employee workload, utilization, skills, or availability.\n\nTry asking something like:\n• "What is the leave policy?"\n• "Show me project hours summary"\n• "What are the employee workloads?"\n• "List all deliverables"\n• "Show skill matrix"`;

        const msgId = uuidv4();
        runQuery(db, 'INSERT INTO chat_messages (id, sender, message, response) VALUES (?, ?, ?, ?)', [msgId, 'user', message, response]);
        saveDb(db);

        return NextResponse.json({ response, id: msgId });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await getDbPromise();
        const messages = queryAll(db, 'SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 50');
        return NextResponse.json(messages.reverse());
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
