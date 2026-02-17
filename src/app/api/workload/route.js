import { getDbPromise, queryAll, queryOne } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const db = await getDbPromise();
        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department') || 'MDA';

        // 1. Get Department Overview (James Sterling level)
        const deptStats = queryOne(db, 'SELECT SUM(workload) as workload FROM employees WHERE department = ?', [department]);

        // 2. Get Managers' Team Stats (Unit level)
        const managerStats = queryAll(db, 'SELECT * FROM employees GROUP BY manager_id', [department]);

        return NextResponse.json({
            department,
            deptStats,
            managerStats
        });
    } catch (error) {
        console.error('[Workload API Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
