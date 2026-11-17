import {redirect} from 'next/navigation';import {createClient} from '@/lib/supabase-server';import {adminDb} from '@/lib/supabase-admin';import ResultsTable from './results-table';
export default async function Results(){const auth=await createClient();const {data:{user}}=await auth.auth.getUser();if(!user)redirect('/admin/login');if(process.env.ADMIN_EMAIL&&user.email?.toLowerCase()!==process.env.ADMIN_EMAIL.toLowerCase())redirect('/admin');
const db=adminDb();const {data}=await db.from('submissions').select('id,full_name,employee_id,department,designation,score,total_points,percentage,created_at,quiz_id,quizzes(title)').order('created_at',{ascending:false});
const quizIds=[...new Set((data||[]).map((r:any)=>r.quiz_id))];
const {data:questionRows}=quizIds.length ? await db.from('questions').select('id,quiz_id,prompt,correct_option,points').in('quiz_id',quizIds) : {data:[]};
return <main className="shell"><section className="panel"><h1>Participant results</h1><ResultsTable rows={(data||[]) as any} questions={(questionRows||[]) as any}/></section></main>}
