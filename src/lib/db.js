// Mock database layer for Engineering Portal
// Bypasses environment-specific issues with sql.js while maintaining the same API interface.
import { seedData } from './mock-data.js';

let db = seedData;

export async function getDbPromise() {
  return db;
}

export function getDb() {
  return db;
}

// Helper to filter and map data
export function queryAll(database, sql, params = []) {
  const lowerSql = sql.toLowerCase().trim();

  try {
    // 1. Regions
    if (lowerSql.includes('from regions')) {
      return database.regions.map(r => ({
        ...r,
        employee_count: database.employees.filter(e => e.region_id === r.id).length,
        active_projects: database.projects.filter(p => p.region_id === r.id && p.status === 'active').length,
        avg_utilization: Math.round(database.employees.filter(e => e.region_id === r.id && e.status === 'active').reduce((acc, curr) => acc + curr.utilization, 0) / (database.employees.filter(e => e.region_id === r.id && e.status === 'active').length || 1))
      }));
    }

    // Workload Aggregation (Custom for the new feature)
    if (lowerSql.includes('from employees') && lowerSql.includes('group by manager_id')) {
      const dept = params[0];
      const managers = database.employees.filter(e => e.department === dept && e.role.toLowerCase().includes('manager') && e.id.startsWith('mgr-'));

      return managers.map(mgr => {
        const team = database.employees.filter(e => e.manager_id === mgr.id);
        // Aggregate 12-week workload
        const aggregatedWorkload = Array.from({ length: 12 }, (_, weekIndex) => {
          return team.reduce((sum, emp) => sum + (emp.workload ? emp.workload[weekIndex] : 0), 0);
        });
        return {
          id: mgr.id,
          name: mgr.name,
          team_count: team.length,
          workload: aggregatedWorkload,
          team: team.map(emp => ({
            id: emp.id,
            name: emp.name,
            role: emp.role,
            status: emp.status,
            dailyWorkload: emp.dailyWorkload // This is the Mon-Fri granular data
          }))
        };
      });
    }

    // 2. Training Page - Advanced skills query
    if (lowerSql.includes('left join employee_skills es on s.id = es.skill_id group by s.id')) {
      return database.skills.map(s => {
        const owners = database.employee_skills.filter(es => es.skill_id === s.id);
        const employee_count = owners.length;
        const avg_proficiency = employee_count > 0 ? (owners.reduce((acc, curr) => acc + curr.proficiency, 0) / employee_count).toFixed(1) : 0;
        return { ...s, employee_count, avg_proficiency };
      });
    }

    // 3. Employee detail - Projects
    if (lowerSql.includes('from project_assignments pa join projects p') || lowerSql.includes('from project_assignments pa left join projects p')) {
      return database.assignments
        .filter(a => a.employee_id === params[0])
        .map(a => {
          const p = database.projects.find(proj => proj.id === a.project_id);
          return {
            assignment_role: a.role,
            allocated_hours: a.allocated_hours,
            spent_hours: a.spent_hours,
            project_id: a.project_id,
            project_name: p?.name || 'Project',
            project_status: p?.status || 'active',
            client: p?.client || 'Client'
          };
        });
    }

    // 4. Employee detail - Skills
    if (lowerSql.includes('from employee_skills')) {
      if (lowerSql.includes('where es.employee_id = ?') || lowerSql.includes('where employee_id = ?')) {
        return database.employee_skills
          .filter(es => es.employee_id === params[0])
          .map(es => ({
            ...es,
            name: database.skills.find(s => s.id === es.skill_id)?.name || 'Skill',
            category: database.skills.find(s => s.id === es.skill_id)?.category || 'Other'
          }));
      }
    }

    // 5. Employee detail - Trainings
    if (lowerSql.includes('from employee_trainings')) {
      if (lowerSql.includes('where et.employee_id = ?') || lowerSql.includes('where employee_id = ?')) {
        return database.employee_trainings
          .filter(et => et.employee_id === params[0])
          .map(et => ({
            ...et,
            title: database.trainings.find(t => t.id === et.training_id)?.title || 'Training',
            category: database.trainings.find(t => t.id === et.training_id)?.category || 'Other',
            duration_hours: database.trainings.find(t => t.id === et.training_id)?.duration_hours || 0,
            provider: database.trainings.find(t => t.id === et.training_id)?.provider || 'Internal'
          }));
      }
    }

    // 6. Employees general
    if (lowerSql.includes('from employees')) {
      let emps = [...database.employees];
      if (lowerSql.includes('where region_id = ?')) {
        emps = emps.filter(e => e.region_id === params[0]);
      }
      if (lowerSql.includes('where status = ?')) {
        emps = emps.filter(e => e.status === params[0]);
      }
      if (lowerSql.includes('where manager_id = ?')) {
        emps = emps.filter(e => e.manager_id === params[0]);
      }
      if (lowerSql.includes('where department = ?')) {
        emps = emps.filter(e => e.department === params[0]);
      }
      return emps.map(e => ({
        ...e,
        region_name: database.regions.find(r => r.id === e.region_id)?.name || 'Unknown'
      }));
    }

    // 7. Projects general
    if (lowerSql.includes('from projects')) {
      let projs = [...database.projects];
      if (lowerSql.includes('where region_id = ?')) {
        projs = projs.filter(p => p.region_id === params[0]);
      }
      return projs.map(p => ({
        ...p,
        region_name: database.regions.find(r => r.id === p.region_id)?.name || 'Unknown',
        team_size: database.assignments.filter(a => a.project_id === p.id).length,
        deliverables_count: database.deliverables.filter(d => d.project_id === p.id).length
      }));
    }

    // 8. Activity log and others
    if (lowerSql.includes('from activity_log')) {
      return database.activities.slice(0, params[0] || 10).map(a => ({
        ...a,
        employee_name: database.employees.find(e => e.id === a.employee_id)?.name || 'System'
      }));
    }

    if (lowerSql.includes('from deliverables')) {
      let dels = [...database.deliverables];
      if (lowerSql.includes('where d.project_id = ?')) {
        dels = dels.filter(d => d.project_id === params[0]);
      }
      return dels.map(d => ({
        ...d,
        project_name: database.projects.find(p => p.id === d.project_id)?.name || 'Unknown',
        assignee_name: database.employees.find(e => e.id === d.assigned_to)?.name || 'Unassigned'
      }));
    }

    if (lowerSql.includes('from reviews')) {
      let revs = [...database.reviews];
      if (lowerSql.includes('where project_id = ?')) {
        revs = revs.filter(r => r.project_id === params[0]);
      }
      return revs.map(r => ({
        ...r,
        reviewer_name: database.employees.find(e => e.id === r.reviewer_id)?.name || 'Unknown',
        deliverable_title: database.deliverables.find(d => d.id === r.deliverable_id)?.title || 'General Review'
      }));
    }

    if (lowerSql.includes('from skills')) {
      return database.skills;
    }

    if (lowerSql.includes('from trainings')) {
      return database.trainings;
    }

    if (lowerSql.includes('from workflows')) {
      return database.workflows.map(wf => ({
        ...wf,
        steps: database.workflow_steps.filter(s => s.workflow_id === wf.id).sort((a, b) => a.step_order - b.step_order)
      }));
    }

    // Default empty array if query not matched
    console.warn('[Mock DB] Unhandled query:', sql);
    return [];
  } catch (err) {
    console.error('[Mock DB] Error processing query:', sql, err);
    return [];
  }
}

export function queryOne(database, sql, params = []) {
  const lowerSql = sql.toLowerCase().trim();

  // Employee detail header query (left join regions)
  if (lowerSql.includes('from employees e left join regions r on e.region_id = r.id where e.id = ?')) {
    const emp = database.employees.find(e => e.id === params[0]);
    if (!emp) return null;
    const r = database.regions.find(reg => reg.id === emp.region_id);
    return {
      ...emp,
      region_name: r?.name || 'Unknown',
      region_code: r?.code || 'NA',
      region_color: r?.color || '#ccc'
    };
  }

  // Basic employees by ID
  if (lowerSql.includes('from employees where id = ?')) {
    const emp = database.employees.find(e => e.id === params[0]);
    if (!emp) return null;
    return emp;
  }

  // Workload sum for department (James Sterling view)
  if (lowerSql.includes('sum(workload)') && lowerSql.includes('where department = ?')) {
    const dept = params[0];
    const emps = database.employees.filter(e => e.department === dept);
    const aggregatedWorkload = Array.from({ length: 12 }, (_, weekIndex) => {
      return emps.reduce((sum, emp) => sum + (emp.workload ? emp.workload[weekIndex] : 0), 0);
    });
    return { workload: aggregatedWorkload, total_employees: emps.length };
  }

  // Projects by ID (Basic or Join)
  if (lowerSql.includes('from projects') && lowerSql.includes('where p.id = ?')) {
    const proj = database.projects.find(p => p.id === params[0]);
    if (!proj) return null;
    const region = database.regions.find(r => r.id === proj.region_id);
    return {
      ...proj,
      region_name: region?.name || 'Unknown',
      region_code: region?.code || 'NA',
      region_color: region?.color || '#ccc',
      team: database.assignments.filter(a => a.project_id === proj.id).map(a => ({
        ...a,
        employee_name: database.employees.find(e => e.id === a.employee_id)?.name || 'Employee'
      }))
    };
  }

  // Fallback Projects by ID
  if (lowerSql.includes('from projects where id = ?')) {
    const proj = database.projects.find(p => p.id === params[0]);
    if (!proj) return null;
    return {
      ...proj,
      team: database.assignments.filter(a => a.project_id === proj.id).map(a => ({
        ...a,
        employee_name: database.employees.find(e => e.id === a.employee_id)?.name || 'Employee'
      }))
    };
  }

  // Count queries with params (Training stats)
  if (lowerSql.startsWith('select count(*)')) {
    if (lowerSql.includes('from employee_trainings')) {
      let filtered = database.employee_trainings.filter(et => et.training_id === params[0]);
      if (lowerSql.includes("status = 'completed'")) {
        filtered = filtered.filter(et => et.status === 'completed');
      }
      return { c: filtered.length };
    }

    if (lowerSql.includes('from employees')) {
      if (lowerSql.includes("status = 'active'")) return { c: database.employees.filter(e => e.status === 'active').length };
      if (lowerSql.includes("status = 'on_leave'")) return { c: database.employees.filter(e => e.status === 'on_leave').length };
      if (lowerSql.includes("status = 'travel'")) return { c: database.employees.filter(e => e.status === 'travel').length };
      return { c: database.employees.length };
    }
    if (lowerSql.includes('from projects')) {
      if (lowerSql.includes("status = 'active'")) return { c: database.projects.filter(p => p.status === 'active').length };
      if (lowerSql.includes("status = 'completed'")) return { c: database.projects.filter(p => p.status === 'completed').length };
      if (lowerSql.includes("status = 'on_hold'")) return { c: database.projects.filter(p => p.status === 'on_hold').length };
      return { c: database.projects.length };
    }
    if (lowerSql.includes('from deliverables')) return { c: database.deliverables.length };
    if (lowerSql.includes('from reviews')) return { c: database.reviews.length };
  }

  // Aggregate queries (Training avg score)
  if (lowerSql.includes('avg(score)')) {
    const filtered = database.employee_trainings.filter(et => et.training_id === params[0] && et.status === 'completed');
    if (filtered.length === 0) return { avg: 0 };
    return { avg: Math.round(filtered.reduce((acc, curr) => acc + curr.score, 0) / filtered.length) };
  }

  if (lowerSql.includes('sum(budget_hours)')) return { s: database.projects.reduce((acc, p) => acc + p.budget_hours, 0) };
  if (lowerSql.includes('sum(spent_hours)')) return { s: database.projects.reduce((acc, p) => acc + p.spent_hours, 0) };
  if (lowerSql.includes('avg(utilization)')) return { avg: Math.round(database.employees.filter(e => e.status === 'active').reduce((acc, e) => acc + e.utilization, 0) / (database.employees.filter(e => e.status === 'active').length || 1)) };

  return null;
}

export function runQuery(database, sql, params = []) {
  console.log('[Mock DB] runQuery executed (In-memory only):', sql);
  return true;
}

export function saveDb(database) {
  // No-op for mock DB
  return true;
}
