(() => {
  const root = document.querySelector('[data-chapter]');
  if (!root) return;
  const bar = document.querySelector('.chapter-progress-bar');
  const steps = [...document.querySelectorAll('.scrolly-step')];
  const states = [...document.querySelectorAll('.figure-state')];
  const canvas = document.querySelector('[data-figure-canvas]');
  const ctx = canvas?.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showState(id) {
    states.forEach((state) => state.classList.toggle('is-visible', state.dataset.state === id));
    if (ctx) drawFigure(id);
  }
  function drawFigure(id) {
    const w = canvas.width = 760, h = canvas.height = 500;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0f766e';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1c2524';
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    const cx = w / 2, ground = h * .76;
    ctx.strokeStyle = '#93aaa4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, ground); ctx.lineTo(w - 70, ground); ctx.stroke();
    const angle = id === 'threshold' ? -.28 : id === 'response' ? .32 : id === 'forcing' ? Math.sin(Date.now() / 320) * .22 : id === 'derivation' ? -.12 : 0;
    ctx.save(); ctx.translate(cx, ground - 150); ctx.rotate(angle);
    ctx.strokeStyle = '#244846'; ctx.fillStyle = 'rgba(15,118,110,.18)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.rect(-105, -150, 210, 150); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c2410c'; ctx.beginPath(); ctx.arc(0, -88, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -88); ctx.lineTo(0, 20); ctx.stroke(); ctx.restore();
    ctx.fillStyle = ctx.strokeStyle = '#65716e'; ctx.font = '700 22px system-ui'; ctx.fillText(id === 'threshold' ? 'lift-off' : id === 'response' ? 'impact + decay' : id === 'forcing' ? 'driven rocking' : id === 'derivation' ? 'geometric path' : 'two possible pivots', 75, 90);
  }
  function setActive(step) { if (!step) return; steps.forEach((item) => item.classList.toggle('is-active', item === step)); showState(step.dataset.state); }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target); }), { threshold: .2, rootMargin: '-10% 0px -35% 0px' });
  steps.forEach((step) => observer.observe(step));
  function progress() { const max = document.documentElement.scrollHeight - innerHeight; if (bar) bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`; }
  function updateActiveOnScroll() { const target = innerHeight * .35; let closest = steps[0]; let distance = Infinity; steps.forEach((step) => { const d = Math.abs(step.getBoundingClientRect().top - target); if (d < distance) { distance = d; closest = step; } }); setActive(closest); }
  addEventListener('scroll', () => { progress(); updateActiveOnScroll(); }, { passive: true }); progress(); updateActiveOnScroll();

  document.querySelectorAll('[data-mini-sim]').forEach((sim) => {
    const mini = sim.querySelector('canvas'); const c = mini.getContext('2d'); const slider = sim.querySelector('input[type=range]'); const output = sim.querySelector('[data-value]'); const button = sim.querySelector('button'); let running = false;
    function draw() { const w = mini.width = 700, h = mini.height = 410; c.clearRect(0,0,w,h); c.strokeStyle='#9aaca7'; c.lineWidth=3; c.beginPath(); c.moveTo(45,h-55); c.lineTo(w-35,h-55); c.stroke(); const value=Number(slider?.value || 0.6); if(output) output.textContent=sim.dataset.miniSim==='geometry' ? `${value.toFixed(2)} rad` : sim.dataset.miniSim==='response' ? value.toFixed(2) : `${value.toFixed(1)} Hz`; c.save(); c.translate(w/2,h-100); c.rotate(sim.dataset.miniSim==='geometry' ? value*.35 : Math.sin(value)*.3); c.fillStyle='rgba(15,118,110,.2)'; c.strokeStyle='#244846'; c.lineWidth=6; c.beginPath(); c.rect(-85,-140,170,140); c.fill(); c.stroke(); c.fillStyle='#c2410c'; c.beginPath(); c.arc(0,-80,9,0,Math.PI*2); c.fill(); c.restore(); if(sim.dataset.miniSim==='geometry'){ c.strokeStyle='#0f766e'; c.lineWidth=3; c.beginPath(); for(let x=50;x<w-40;x+=5){const y=h-90-Math.tan((x-w/2)/260)*40;c.lineTo(x,y);} c.stroke(); } }
    slider?.addEventListener('input', draw); button?.addEventListener('click', () => { running=!running; button.textContent=running?'Pause':'Animate'; if(running && !reduced){ const tick=()=>{ if(!running)return; slider.value=String(Number(slider.value)+.04); if(Number(slider.value)>Number(slider.max)) slider.value=slider.min; draw(); requestAnimationFrame(tick); }; tick(); } }); draw();
  });
})();
