// /api/generate-plan.js
import fs from 'fs/promises'; import path from 'path';

export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { character_id='alex', student_profile={}, today } = body || {};

    const cwd = process.cwd();
    const [sys, chStr, courseGen, archStr] = await Promise.all([
      fs.readFile(path.join(cwd,'aitor/prompts/system.common.txt'),'utf-8'),
      fs.readFile(path.join(cwd,'aitor/characters',`${character_id}.json`),'utf-8'),
      fs.readFile(path.join(cwd,'aitor/prompts/course.generator.txt'),'utf-8'),
      fs.readFile(path.join(cwd,'aitor/archetype/rules.v1.json'),'utf-8')
    ]);
    const ch = JSON.parse(chStr); const arch = JSON.parse(archStr);

    const system = `${sys}\n\n[Character Style]\n${ch.tone_prompt}\nRules: ${(ch.style_rules||[]).join('; ')}`;
    const user = JSON.stringify({
      instruction: "입력 데이터로 개인화 코스를 생성하라. JSON만 반환.",
      today, student_profile, archetype_rules: arch,
      expected_keys: ["plan_meta","strategy","milestones","weeks","weekly_assessment"]
    });

    const payload = { model:'gpt-4o-mini', temperature:0.3, messages:[
      { role:'system', content: system },
      { role:'user', content: courseGen },
      { role:'user', content: user }
    ]};

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || '';
    let plan = null; try { plan = JSON.parse(content); } catch {}

    res.status(200).json({ ok:true, plan_json: plan, raw: content });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
}
