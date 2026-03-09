// Grinder spark particle effect — canvas-based with streak rendering
document.addEventListener("DOMContentLoaded", () => {
  const slogan = document.querySelector('.rusted');
  if (!slogan) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const sparks = [];

  function spawnSpark() {
    const rect = slogan.getBoundingClientRect();
    // Spawn along the bottom of the text (grinder contact line)
    const x = rect.left + rect.width * (0.1 + Math.random() * 0.8);
    const y = rect.bottom - rect.height * 0.2;

    // Fan upward and sideways — real grinding cone is ~140° wide
    const spreadDeg = (Math.random() - 0.5) * 140;
    const angleRad = (-90 + spreadDeg) * (Math.PI / 180);
    const speed = 100 + Math.random() * 280;

    sparks.push({
      x, y,
      px: x, py: y,           // previous position for streak
      vx: Math.cos(angleRad) * speed,
      vy: Math.sin(angleRad) * speed,
      gravity: 200 + Math.random() * 150,
      life: 1,
      decay: 1.8 + Math.random() * 2.2,
      size: 0.7 + Math.random() * 1.6,
      hue: 35 + Math.random() * 25,   // yellow-orange range
    });
  }

  let lastTime = performance.now();

  function animate(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.px = s.x;
      s.py = s.y;
      s.vy += s.gravity * dt;
      s.x  += s.vx * dt;
      s.y  += s.vy * dt;
      s.life -= s.decay * dt;

      if (s.life <= 0) { sparks.splice(i, 1); continue; }

      // Lightness: starts near white, fades to dim orange
      const lightness = 55 + s.life * 45;

      ctx.save();
      ctx.lineCap = 'round';

      // Streak from previous to current position
      ctx.globalAlpha = s.life * 0.9;
      ctx.strokeStyle = `hsl(${s.hue}, 100%, ${lightness}%)`;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      // Bright white tip at leading edge
      ctx.globalAlpha = s.life;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  function spawnBurst() {
    const count = 20 + Math.floor(Math.random() * 8); // 20-27 sparks per burst
    for (let i = 0; i < count; i++) {
      setTimeout(spawnSpark, i * 12);
    }
    setTimeout(spawnBurst, 50 + Math.random() * 130);
  }

  spawnBurst();
});

// Scroll entrance animations
document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll('.project-row, #skills, #contact');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach((el, i) => {
    el.classList.add('fade-in');
    // Stagger delay so rows don't all pop in at once
    el.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(el);
  });
});

// Handle copy-to-clipboard for contact cards
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.contact-card[data-copy]').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault(); // Stop link behavior
      const textToCopy = this.getAttribute('data-copy');

      // Copy text to clipboard
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Optional feedback
        this.classList.add('copied');
        this.querySelector('span').textContent = '📋 Copied!';
        setTimeout(() => {
          this.classList.remove('copied');
          this.querySelector('span').textContent = textToCopy;
        }, 2000);
      }).catch(err => {
        alert('Copy failed. Try manually.');
        console.error(err);
      });
    });
  });
});