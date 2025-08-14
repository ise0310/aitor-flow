// /api/recommend.js
export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const p = body?.profile || {};

    // Simple heuristic
    let character_id = 'alex';
    let reason = '분석적 전략이 적합';

    const timePressed = p.time_left === '2w' || p.time_left === '1m';
    const anxious = (p.english_level || '').toLowerCase().includes('not') || (p.current_score==='' && p.toefl_experience==='none');
    const highGoal = (parseInt(p.target_score||'0',10) >= 100);

    if (timePressed) { character_id = 'jordan'; reason = '시험까지 촉박 → 실전·속도형 유리'; }
    if (anxious) { character_id = 'quinn'; reason = '기초/자신감 회복 우선'; }
    if (highGoal && !anxious && !timePressed) { character_id = 'alex'; reason = '고득점 전략 최적'; }

    res.status(200).json({ ok:true, character_id, reason });
  } catch (e) {
    res.status(200).json({ ok:false, error:String(e), character_id:'alex', reason:'fallback' });
  }
}
