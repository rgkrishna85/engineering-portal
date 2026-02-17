import { getDbPromise, queryAll, queryOne } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDbPromise();

    const totalEmployees = queryOne(db, 'SELECT COUNT(*) as c FROM employees').c;
    const activeEmployees = queryOne(db, "SELECT COUNT(*) as c FROM employees WHERE status = 'active'").c;
    const onLeave = queryOne(db, "SELECT COUNT(*) as c FROM employees WHERE status = 'on_leave'").c;
    const onTravel = queryOne(db, "SELECT COUNT(*) as c FROM employees WHERE status = 'travel'").c;

    const totalProjects = queryOne(db, 'SELECT COUNT(*) as c FROM projects').c;
    const activeProjects = queryOne(db, "SELECT COUNT(*) as c FROM projects WHERE status = 'active'").c;
    const completedProjects = queryOne(db, "SELECT COUNT(*) as c FROM projects WHERE status = 'completed'").c;
    const onHoldProjects = queryOne(db, "SELECT COUNT(*) as c FROM projects WHERE status = 'on_hold'").c;

    const totalBudgetHours = queryOne(db, 'SELECT COALESCE(SUM(budget_hours),0) as s FROM projects').s;
    const totalSpentHours = queryOne(db, 'SELECT COALESCE(SUM(spent_hours),0) as s FROM projects').s;

    const avgUtilization = queryOne(db, "SELECT ROUND(AVG(utilization),0) as avg FROM employees WHERE status = 'active'").avg || 0;

    const totalDeliverables = queryOne(db, 'SELECT COUNT(*) as c FROM deliverables').c;
    const completedDeliverables = queryOne(db, "SELECT COUNT(*) as c FROM deliverables WHERE status = 'completed'").c;
    const pendingReviews = queryOne(db, "SELECT COUNT(*) as c FROM reviews WHERE status IN ('pending','in_progress')").c;

    const regionStats = queryAll(db, `
      SELECT r.id, r.name, r.code, r.color,
        (SELECT COUNT(*) FROM employees e WHERE e.region_id = r.id) as employee_count,
        (SELECT COUNT(*) FROM projects p WHERE p.region_id = r.id AND p.status = 'active') as active_projects,
        (SELECT ROUND(AVG(e2.utilization),0) FROM employees e2 WHERE e2.region_id = r.id AND e2.status = 'active') as avg_utilization
      FROM regions r
    `);

    const projectsByStatus = queryAll(db, 'SELECT status, COUNT(*) as count FROM projects GROUP BY status');

    const recentActivities = queryAll(db, `
      SELECT a.*, e.name as employee_name
      FROM activity_log a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.timestamp DESC
      LIMIT 8
    `);

    const upcomingDeliverables = queryAll(db, `
      SELECT d.*, p.name as project_name, e.name as assignee_name
      FROM deliverables d
      JOIN projects p ON d.project_id = p.id
      LEFT JOIN employees e ON d.assigned_to = e.id
      WHERE d.status != 'completed'
      ORDER BY d.due_date ASC
      LIMIT 5
    `);

    return NextResponse.json({
      kpis: { totalEmployees, activeEmployees, onLeave, onTravel, totalProjects, activeProjects, completedProjects, onHoldProjects, totalBudgetHours, totalSpentHours, avgUtilization, totalDeliverables, completedDeliverables, pendingReviews },
      regionStats, projectsByStatus, recentActivities, upcomingDeliverables,
    });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
