import { getDbPromise, queryAll, queryOne } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const db = await getDbPromise();
    const { id } = await params;

    const employee = queryOne(db, `
      SELECT e.*, r.name as region_name, r.code as region_code, r.color as region_color
      FROM employees e LEFT JOIN regions r ON e.region_id = r.id WHERE e.id = ?
    `, [id]);

    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

    const skills = queryAll(db, `SELECT s.name, s.category, es.proficiency FROM employee_skills es JOIN skills s ON es.skill_id = s.id WHERE es.employee_id = ? ORDER BY es.proficiency DESC`, [id]);
    const projects = queryAll(db, `SELECT pa.role as assignment_role, pa.allocated_hours, pa.spent_hours, p.id as project_id, p.name as project_name, p.status as project_status, p.client FROM project_assignments pa JOIN projects p ON pa.project_id = p.id WHERE pa.employee_id = ?`, [id]);
    const trainings = queryAll(db, `SELECT t.title, t.category, t.duration_hours, t.provider, et.status, et.completion_date, et.score FROM employee_trainings et JOIN trainings t ON et.training_id = t.id WHERE et.employee_id = ? ORDER BY et.completion_date DESC`, [id]);
    const leaveTravel = queryAll(db, `SELECT * FROM leave_travel WHERE employee_id = ? ORDER BY start_date DESC`, [id]);

    return NextResponse.json({ ...employee, skills, projects, trainings, leaveTravel });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
