import { getDbPromise, queryAll, queryOne } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const db = await getDbPromise();

        const trainings = queryAll(db, 'SELECT * FROM trainings ORDER BY mandatory DESC, title');
        const trainingsWithStats = trainings.map(t => {
            const enrolled = queryOne(db, 'SELECT COUNT(*) as c FROM employee_trainings WHERE training_id = ?', [t.id]).c;
            const completed = queryOne(db, "SELECT COUNT(*) as c FROM employee_trainings WHERE training_id = ? AND status = 'completed'", [t.id]).c;
            const avgScore = queryOne(db, "SELECT ROUND(AVG(score),0) as avg FROM employee_trainings WHERE training_id = ? AND status = 'completed'", [t.id]).avg;
            return { ...t, enrolled, completed, avgScore };
        });

        const skills = queryAll(db, 'SELECT s.id, s.name, s.category, COUNT(es.employee_id) as employee_count, ROUND(AVG(es.proficiency), 1) as avg_proficiency FROM skills s LEFT JOIN employee_skills es ON s.id = es.skill_id GROUP BY s.id ORDER BY employee_count DESC');
        const categories = [...new Set(skills.map(s => s.category))];
        const skillsByCategory = {};
        for (const cat of categories) skillsByCategory[cat] = skills.filter(s => s.category === cat);

        return NextResponse.json({ trainings: trainingsWithStats, skills, skillsByCategory });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
