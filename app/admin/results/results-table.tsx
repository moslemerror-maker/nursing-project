'use client';
import {useMemo,useState} from 'react';
type Row={id:string;full_name:string;employee_id:string;department:string;designation:string|null;score:number;total_points:number;percentage:number;created_at:string;quiz_id:string;answers:Record<string,string>;quizzes:{title:string}|null};
type Question={id:string;quiz_id:string;prompt:string;correct_option:string;points:number};
export default function ResultsTable({rows,questions}:{rows:Row[];questions:Question[]}) {
  const [search,setSearch]=useState('');
  const filtered=useMemo(()=>rows.filter(r=>(r.full_name+' '+r.employee_id+' '+r.department+' '+(r.quizzes?.title||'')).toLowerCase().includes(search.toLowerCase())),[rows,search]);
  function csv(){
    const head=['Date','Assessment','Name','Employee ID','Department','Designation','Score','Total','Percentage'];
    const lines=filtered.map(r=>[new Date(r.created_at).toLocaleString(),r.quizzes?.title||'',r.full_name,r.employee_id,r.department,r.designation||'',r.score,r.total_points,r.percentage].map(x=>`"${String(x??'').replaceAll('"','""')}"`).join(','));
    const blob=new Blob([[head.join(','),...lines].join('\n')],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nursing-assessment-results.csv';a.click();URL.revokeObjectURL(url);
  }
  return <><div className="row between"><input style={{padding:11,border:'1px solid #cfd4df',borderRadius:8,flex:1}} placeholder="Search name, employee ID, department…" value={search} onChange={e=>setSearch(e.target.value)}/><button className="btn" onClick={csv}>Export CSV</button></div><p className="muted small">{filtered.length} response(s). Expand a participant to inspect their individual answers.</p><div className="tablewrap"><table><thead><tr><th>Date</th><th>Assessment</th><th>Name / Employee ID</th><th>Department</th><th>Score</th><th>%</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.quizzes?.title}</td><td>{r.full_name}<br/><span className="muted">{r.employee_id}</span></td><td>{r.department}</td><td>{r.score}/{r.total_points}</td><td>{r.percentage}%<details style={{marginTop:8}}><summary>View answers</summary><div style={{minWidth:260,paddingTop:8}}>{questions.filter(q=>q.quiz_id===r.quiz_id).sort((a,b)=>a.prompt.localeCompare(b.prompt)).map((q,i)=><div className="question" key={q.id}><strong>{q.prompt}</strong><p>Selected: {r.answers?.[q.id] || 'No answer'}</p><p>Correct: {q.correct_option}</p><p className="muted small">{r.answers?.[q.id]===q.correct_option?'Correct':'Incorrect'} · {q.points} mark(s)</p></div>)}</div></details></td></tr>)}</tbody></table></div></>;
}
