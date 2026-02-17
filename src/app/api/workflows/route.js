import { getDbPromise, queryAll, runQuery, saveDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const db = await getDbPromise();
        const workflows = queryAll(db, `SELECT w.*, e.name as creator_name, (SELECT COUNT(*) FROM workflow_steps ws WHERE ws.workflow_id = w.id) as step_count FROM workflows w LEFT JOIN employees e ON w.created_by = e.id ORDER BY w.created_at DESC`);
        const result = workflows.map(wf => ({ ...wf, steps: queryAll(db, 'SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_order', [wf.id]) }));
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const db = await getDbPromise();
        const { name, description, steps } = await request.json();
        const id = uuidv4();
        runQuery(db, 'INSERT INTO workflows (id, name, description, status, created_by) VALUES (?, ?, ?, ?, ?)', [id, name, description, 'draft', 'emp-002']);
        if (steps && steps.length > 0) {
            for (let i = 0; i < steps.length; i++) {
                runQuery(db, 'INSERT INTO workflow_steps (id, workflow_id, step_order, title, description, assignee_role, status) VALUES (?,?,?,?,?,?,?)', [uuidv4(), id, i + 1, steps[i].title, steps[i].description || '', steps[i].assignee_role || '', 'pending']);
            }
        }
        saveDb(db);
        return NextResponse.json({ id, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
