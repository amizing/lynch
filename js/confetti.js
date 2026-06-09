(function () {
  const COLORS = ['#df6442', '#c14f30', '#f7ddd2', '#2b2722', '#fffdf8', '#f7c948'];

  window.launchConfetti = function (canvas, duration) {
    duration = duration || 2400;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    }
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const W = () => canvas.width;
    const H = () => canvas.height;
    const particles = [];
    const count = 160;
    const originY = H() * 0.45;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.2 - Math.PI / 2;
      const speed = (8 + Math.random() * 14) * dpr;
      particles.push({
        x: W() / 2 + (Math.random() - 0.5) * W() * 0.15,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: 0.45 * dpr,
        drag: 0.992,
        size: (Math.random() * 7 + 5) * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const start = performance.now();
    let raf = 0;
    function tick(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, W(), H());
      let alive = 0;
      for (const p of particles) {
        p.vy += p.g;
        p.vx *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < H() + 60) alive++;
        const fade = Math.max(0, 1 - elapsed / (duration + 800));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = fade;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (alive > 0 && elapsed < duration + 1600) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W(), H());
        window.removeEventListener('resize', onResize);
      }
    }
    raf = requestAnimationFrame(tick);

    return function stop() {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W(), H());
      window.removeEventListener('resize', onResize);
    };
  };
})();
