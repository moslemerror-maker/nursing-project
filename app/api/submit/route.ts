import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, fullName, employeeId, department, designation, answers } = body;
    if (!quizId || !fullName?.trim() || !employeeId?.trim() || !department?.trim() || !answers || typeof answers !== 'object')
      return NextResponse.json({error:'Please complete all required participant details and questions.'},{status:400});
    const db = adminDb();
    const { data: quiz } = await db.from('quizzes').select('id,is_published').eq('id',quizId).eq('is_published',true).single();
    if (!quiz) return NextResponse.json({error:'Assessment is unavailable.'},{status:404});
    const { data: questions, error:qErr } = await db.from('questions').select('id,correct_option,points').eq('quiz_id',quizId);
    if(qErr || !questions?.length) return NextResponse.json({error:'No questions are configured.'},{status:400});
    let score = 0, total = 0;
    for (const q of questions) { const pts = Number(q.points)||0; total += pts; if(answers[q.id] === q.correct_option) score += pts; }
    const { error } = await db.from('submissions').insert({
      quiz_id:quizId, full_name:String(fullName).trim(), employee_id:String(employeeId).trim(),
      department:String(department).trim(), designation:String(designation||'').trim(),
      answers, score, total_points:total, percentage: total ? Math.round(score/total*10000)/100 : 0
    });
    if(error) throw error;
    return NextResponse.json({score,total,percentage:total?Math.round(score/total*10000)/100:0});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:'Unable to save your submission. Please try again or contact the administrator.'},{status:500});
  }
}
