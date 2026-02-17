import { getDbPromise, queryAll, queryOne } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const db = await getDbPromise();
    const { id } = await params;

    const project = queryOne(db, `SELECT p.*, r.name as region_name, r.code as region_code, r.color as region_color FROM projects p LEFT JOIN regions r ON p.region_id = r.id WHERE p.id = ?`, [id]);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const team = queryAll(db, `SELECT pa.*, e.name as employee_name, e.role as employee_role, e.status as employee_status FROM project_assignments pa JOIN employees e ON pa.employee_id = e.id WHERE pa.project_id = ?`, [id]);
    const deliverables = queryAll(db, `SELECT d.*, e.name as assignee_name FROM deliverables d LEFT JOIN employees e ON d.assigned_to = e.id WHERE d.project_id = ? ORDER BY d.due_date`, [id]);
    const reviews = queryAll(db, `SELECT rv.*, d.title as deliverable_title, e.name as reviewer_name FROM reviews rv JOIN deliverables d ON rv.deliverable_id = d.id JOIN employees e ON rv.reviewer_id = e.id WHERE rv.project_id = ? ORDER BY rv.review_date DESC`, [id]);

    return NextResponse.json({ ...project, team, deliverables, reviews });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
