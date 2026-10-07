/**
 * app.js - Módulo Principal de la Plataforma MultiAventura
 * Gestión de usuario, estado, persistencia, navegación y recompensas
 */

// Estado global de la aplicación
const AppState = {
  student: {
    nombre: 'Aventurero',
    avatar: 'avatar_astronauta.svg',
    puntos: 150,
    estrellas: 6,
    tablasProgreso: {
      2: { progreso: 100, estrellas: 3, completada: true },
      3: { progreso: 70, estrellas: 2, completada: false },
      4: { progreso: 40, estrellas: 1, completada: false },
      5: { progreso: 0, estrellas: 0, completada: false },
      6: { progreso: 0, estrellas: 0, completada: false },
      7: { progreso: 0, estrellas: 0, completada: false },
      8: { progreso: 0, estrellas: 0, completada: false },
      9: { progreso: 0, estrellas: 0, completada: false },
      10: { progreso: 0, estrellas: 0, completada: false }
    },
    logros: {
      primera_tabla: true,
      maestro_2: true,
      racha_tiempo: false,
      detective_pro: false,
      memoria_genio: false,
      simce_aprobado: false
    },
    ensayosSimce: []
  },

  // Inicializar estado desde LocalStorage
  init() {
    const savedData = localStorage.getItem('multiAventura_estudiante');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.student = { ...this.student, ...parsed };
      } catch (e) {
        console.error('Error al cargar datos del estudiante:', e);
      }
    } else {
      // Si no hay datos, verificar si estamos en Sistema y redirigir al login si corresponde
      // Si el archivo se abre directamente para prueba, se guardan datos por defecto
      this.save();
    }

    this.renderHeader();
    this.renderProgressTab();
    this.renderAchievementsTab();
    this.setupEventListeners();
  },

  save() {
    localStorage.setItem('multiAventura_estudiante', JSON.stringify(this.student));
  },

  // Añadir puntos y estrellas
  addReward(puntos = 10, estrellas = 0) {
    this.student.puntos += puntos;
    this.student.estrellas += estrellas;
    this.save();
    this.renderHeader();
    if (window.soundSys) window.soundSys.playStar();
    this.showToast(`¡Ganaste +${puntos} Puntos! ⭐`, 'success');
  },

  // Desbloquear un logro
  unlockAchievement(key, title) {
    if (!this.student.logros[key]) {
      this.student.logros[key] = true;
      this.addReward(50, 2);
      this.save();
      this.renderAchievementsTab();
      if (window.soundSys) window.soundSys.playLevelUp();
      this.triggerConfetti();
      this.showToast(`🏆 ¡Nuevo Logro Desbloqueado: ${title}!`, 'achievement');
    }
  },

  // Renderizar la barra superior
  renderHeader() {
    const avatarEl = document.getElementById('userAvatarImg');
    const nameEl = document.getElementById('userNameTxt');
    const pointsEl = document.getElementById('userPointsTxt');
    const starsEl = document.getElementById('userStarsTxt');

    if (avatarEl) avatarEl.src = `IMAGEN/${this.student.avatar}`;
    if (nameEl) nameEl.textContent = this.student.nombre;
    if (pointsEl) pointsEl.textContent = `${this.student.puntos} pts`;
    if (starsEl) starsEl.textContent = `${this.student.estrellas} ★`;

    const bannerName = document.getElementById('heroStudentName');
    if (bannerName) bannerName.textContent = this.student.nombre;

    const bannerAvatar = document.getElementById('heroAvatarImg');
    if (bannerAvatar) bannerAvatar.src = `IMAGEN/${this.student.avatar}`;
  },

  // Renderizar panel de progreso
  renderProgressTab() {
    const listEl = document.getElementById('progressDetailedList');
    if (!listEl) return;

    let html = '';
    let totalCompletadas = 0;

    for (let t = 2; t <= 10; t++) {
      const data = this.student.tablasProgreso[t] || { progreso: 0, estrellas: 0, completada: false };
      if (data.completada || data.progreso >= 100) totalCompletadas++;

      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += s <= data.estrellas ? '⭐' : '☆';
      }

      html += `
        <div class="table-card" style="text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h4 style="font-size: 1.2rem; font-weight: 900;">Tabla del ${t}</h4>
            <span style="font-size: 1.1rem;">${starsHtml}</span>
          </div>
          <div class="table-progress-bar">
            <div class="table-progress-fill" style="width: ${data.progreso}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); font-weight: 700;">
            <span>Avance: ${data.progreso}%</span>
            <span>${data.progreso >= 100 ? '✅ Dominada' : 'En práctica'}</span>
          </div>
        </div>
      `;
    }
    listEl.innerHTML = html;

    const overallPct = Math.round((totalCompletadas / 9) * 100);
    const overallBar = document.getElementById('overallProgressBar');
    const overallTxt = document.getElementById('overallProgressTxt');
    if (overallBar) overallBar.style.width = `${overallPct}%`;
    if (overallTxt) overallTxt.textContent = `${overallPct}% completado (${totalCompletadas} de 9 tablas)`;
  },

  // Renderizar pestaña de logros
  renderAchievementsTab() {
    const container = document.getElementById('achievementsList');
    if (!container) return;

    const achievementsDefs = [
      { key: 'primera_tabla', title: '¡Primer Paso!', desc: 'Completa tu primera actividad de tablas.', icon: 'trofeo.svg' },
      { key: 'maestro_2', title: 'Doble Poder', desc: 'Domina por completo la tabla del 2.', icon: 'medalla_oro.svg' },
      { key: 'racha_tiempo', title: 'Velocidad Relámpago', desc: 'Acierta 8 multiplicaciones seguidas contra el tiempo.', icon: 'estrella.svg' },
      { key: 'detective_pro', title: 'Detective Matemático', desc: 'Resuelve un misterio matemático sin cometer errores.', icon: 'trofeo.svg' },
      { key: 'memoria_genio', title: 'Mente Brillante', desc: 'Encuentra todas las parejas en el juego de memoria.', icon: 'medalla_oro.svg' },
      { key: 'simce_aprobado', title: 'Genio SIMCE 4° Básico', desc: 'Alcanza nivel Adecuado en el Ensayo Matemático.', icon: 'medalla_oro.svg' }
    ];

    container.innerHTML = achievementsDefs.map(ach => {
      const isUnlocked = !!this.student.logros[ach.key];
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">
            <img src="IMAGEN/${ach.icon}" alt="Logro">
          </div>
          <div>
            <div class="achievement-title">${isUnlocked ? '🌟' : '🔒'} ${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
            <div style="font-size: 0.75rem; margin-top: 0.3rem; font-weight: 800; color: ${isUnlocked ? '#10b981' : '#94a3b8'};">
              ${isUnlocked ? '¡Completado! (+50 pts)' : 'Bloqueado'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Notificación tipo toast
  showToast(message, type = 'info') {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1e1b4b;
        color: #ffffff;
        padding: 1rem 1.5rem;
        border-radius: 9999px;
        font-weight: 800;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: translateY(100px);
        opacity: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3200);
  },

  // Efecto de lluvia de confeti mediante canvas
  triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas') || document.createElement('canvas');
    if (!canvas.id) {
      canvas.id = 'confettiCanvas';
      canvas.className = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#38bdf8', '#fbbf24'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frames = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravedad
        p.rotation += p.rSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  },

  setupEventListeners() {
    // Pestañas principales
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundSys) window.soundSys.playClick();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.section-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(targetTab);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Botón de sonido
    const soundBtn = document.getElementById('toggleSoundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = window.soundSys.toggleSound();
        soundBtn.textContent = isEnabled ? '🔊' : '🔇';
        this.showToast(isEnabled ? 'Sonido activado 🔊' : 'Sonido desactivado 🔇');
      });
    }

    // Botón salir / cambiar perfil
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Deseas volver al inicio o cambiar de estudiante?')) {
          window.location.href = '../index.html';
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});
