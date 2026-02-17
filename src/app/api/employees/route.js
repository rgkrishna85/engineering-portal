import { getDbPromise, queryAll } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const db = await getDbPromise();
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = `
      SELECT e.*, r.name as region_name, r.code as region_code, r.color as region_color
      FROM employees e
      LEFT JOIN regions r ON e.region_id = r.id
      WHERE 1=1
    `;
        const params = [];

        if (region && region !== 'all') { query += ' AND r.code = ?'; params.push(region); }
        if (status && status !== 'all') { query += ' AND e.status = ?'; params.push(status); }
        if (search) { query += ' AND (e.name LIKE ? OR e.role LIKE ? OR e.department LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

        query += ' ORDER BY e.name';
        const employees = queryAll(db, query, params);

        const result = employees.map(emp => ({
            ...emp,
            skills: queryAll(db, `
        SELECT s.name, s.category, es.proficiency
        FROM employee_skills es JOIN skills s ON es.skill_id = s.id
        WHERE es.employee_id = ?
      `, [emp.id]),
        }));

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
