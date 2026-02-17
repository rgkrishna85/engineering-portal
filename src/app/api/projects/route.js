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
      SELECT p.*, r.name as region_name, r.code as region_code, r.color as region_color,
        (SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id) as team_size,
        (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = p.id) as deliverable_count,
        (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = p.id AND d.status = 'completed') as completed_deliverables,
        (SELECT COUNT(*) FROM reviews rv WHERE rv.project_id = p.id) as review_count,
        (SELECT COUNT(*) FROM reviews rv WHERE rv.project_id = p.id AND rv.status = 'completed') as completed_reviews
      FROM projects p LEFT JOIN regions r ON p.region_id = r.id WHERE 1=1
    `;
        const params = [];
        if (region && region !== 'all') { query += ' AND r.code = ?'; params.push(region); }
        if (status && status !== 'all') { query += ' AND p.status = ?'; params.push(status); }
        if (search) { query += ' AND (p.name LIKE ? OR p.client LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY p.priority DESC, p.start_date DESC';

        return NextResponse.json(queryAll(db, query, params));
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
