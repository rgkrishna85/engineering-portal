import { getDbPromise, queryAll } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDbPromise();

    const regions = queryAll(db, `
      SELECT r.*,
        (SELECT COUNT(*) FROM employees e WHERE e.region_id = r.id) as total_employees,
        (SELECT COUNT(*) FROM employees e WHERE e.region_id = r.id AND e.status = 'active') as active_employees,
        (SELECT COUNT(*) FROM employees e WHERE e.region_id = r.id AND e.status = 'on_leave') as on_leave,
        (SELECT COUNT(*) FROM employees e WHERE e.region_id = r.id AND e.status = 'travel') as on_travel,
        (SELECT COUNT(*) FROM projects p WHERE p.region_id = r.id) as total_projects,
        (SELECT COUNT(*) FROM projects p WHERE p.region_id = r.id AND p.status = 'active') as active_projects,
        (SELECT COALESCE(ROUND(AVG(e2.utilization), 0), 0) FROM employees e2 WHERE e2.region_id = r.id AND e2.status = 'active') as avg_utilization,
        (SELECT COALESCE(SUM(p2.spent_hours), 0) FROM projects p2 WHERE p2.region_id = r.id) as total_hours
      FROM regions r ORDER BY r.name
    `);

    const result = regions.map(r => ({
      ...r,
      employees: queryAll(db, 'SELECT id, name, role, department, status, utilization FROM employees WHERE region_id = ? ORDER BY name', [r.id]),
      projects: queryAll(db, 'SELECT id, name, client, status, progress, priority FROM projects WHERE region_id = ? ORDER BY status, name', [r.id]),
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
