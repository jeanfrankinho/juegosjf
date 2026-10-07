/**
 * juegos.js - Módulo de Juegos y Desafíos Matemáticos
 * Actividades variadas no monótonas: Memoria, Atrapa, Construye, Quién tiene, Tiempo, Arrastra y Detective
 */

const JuegosController = {
  activeGame: null,
  gameScore: 0,

  // Abrir modal de un juego específico
  openGame(gameName) {
    this.activeGame = gameName;
    this.gameScore = 0;
    if (window.soundSys) window.soundSys.playClick();

    const modal = document.getElementById('gameModalOverlay');
    const titleEl = document.getElementById('gameModalTitle');

    const titles = {
      memoria: '🃏 Memoria Matemática',
      atrapa: '🫧 Atrapa el Resultado',
      construye: '🧱 Construye la Multiplicación',
      personajes: '🦸 ¿Quién tiene la respuesta?',
      tiempo: '⏱️ Desafío Contra el Tiempo',
      arrastra: '✋ Arrastra y Completa',
      detective: '🔍 Detective Matemático'
    };

    if (titleEl) titleEl.textContent = titles[gameName] || 'Juego Matemático';
    if (modal) modal.classList.add('active');

    // Iniciar el juego correspondiente
    switch (gameName) {
      case 'memoria': this.startMemoria(); break;
      case 'atrapa': this.startAtrapa(); break;
      case 'construye': this.startConstruye(); break;
      case 'personajes': this.startPersonajes(); break;
      case 'tiempo': this.startTiempo(); break;
      case 'arrastra': this.startArrastra(); break;
      case 'detective': this.startDetective(); break;
    }
  },

  closeGameModal() {
    const modal = document.getElementById('gameModalOverlay');
    if (modal) modal.classList.remove('active');
    if (this._speedTimerInterval) clearInterval(this._speedTimerInterval);
  },

  // ==============================================================
  // 1. MEMORIA MATEMÁTICA
  // ==============================================================
  startMemoria() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    // 4 parejas (8 tarjetas) para una partida ágil y divertida
    const pairs = [
      { mult: '3 × 4', res: '12' },
      { mult: '6 × 7', res: '42' },
      { mult: '8 × 5', res: '40' },
      { mult: '9 × 3', res: '27' }
    ];

    let cards = [];
    pairs.forEach((p, idx) => {
      cards.push({ id: idx, text: p.mult, pairId: idx, type: 'op' });
      cards.push({ id: idx + 10, text: p.res, pairId: idx, type: 'res' });
    });
    cards.sort(() => Math.random() - 0.5);

    this.memoriaState = {
      flipped: [],
      matchedCount: 0,
      totalPairs: pairs.length,
      lock: false
    };

    body.innerHTML = `
      <div style="text-align: center; max-width: 650px; margin: 0 auto;">
        <p style="font-weight: 700; color: var(--text-muted); margin-bottom: 1rem;">
          Voltea dos tarjetas y encuentra la pareja entre la operación y su resultado:
        </p>
        <div class="memory-board" id="memoryBoard">
          ${cards.map((c, i) => `
            <div class="memory-card" id="memCard_${i}" data-index="${i}" data-pair="${c.pairId}" onclick="JuegosController.flipMemoryCard(${i}, '${c.text}')">
              <div class="memory-front">❓</div>
              <div class="memory-back">${c.text}</div>
            </div>
          `).join('')}
        </div>
        <div id="memoryStatus" style="font-weight: 800; font-size: 1.1rem; color: var(--primary); min-height: 30px;">
          Parejas encontradas: 0 de ${pairs.length}
        </div>
      </div>
    `;
  },

  flipMemoryCard(idx, text) {
    const s = this.memoriaState;
    if (s.lock) return;
    const cardEl = document.getElementById(`memCard_${idx}`);
    if (!cardEl || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    if (window.soundSys) window.soundSys.playCardFlip();
    cardEl.classList.add('flipped');
    s.flipped.push({ idx, el: cardEl, pair: cardEl.dataset.pair });

    if (s.flipped.length === 2) {
      s.lock = true;
      const [c1, c2] = s.flipped;

      if (c1.pair === c2.pair) {
        // Pareja correcta
        if (window.soundSys) window.soundSys.playSuccess();
        setTimeout(() => {
          c1.el.classList.add('matched');
          c2.el.classList.add('matched');
          s.matchedCount++;
          s.flipped = [];
          s.lock = false;

          const statusEl = document.getElementById('memoryStatus');
          if (statusEl) statusEl.textContent = `¡Parejas encontradas: ${s.matchedCount} de ${s.totalPairs}! 🌟`;

          if (s.matchedCount === s.totalPairs) {
            AppState.addReward(30, 1);
            AppState.unlockAchievement('memoria_genio', 'Mente Brillante');
            AppState.triggerConfetti();
            if (statusEl) statusEl.innerHTML = `<span style="color: #10b981; font-size: 1.4rem;">🎉 ¡Excelente memoria! Has completado el juego. (+30 pts)</span>`;
          }
        }, 500);
      } else {
        // No coinciden
        if (window.soundSys) window.soundSys.playError();
        setTimeout(() => {
          c1.el.classList.remove('flipped');
          c2.el.classList.remove('flipped');
          s.flipped = [];
          s.lock = false;
        }, 900);
      }
    }
  },

  // ==============================================================
  // 2. ATRAPA EL RESULTADO (BUBBLES CATCH)
  // ==============================================================
  startAtrapa() {
    this.atrapaRound = 1;
    this.atrapaScore = 0;
    this.renderAtrapaRound();
  },

  renderAtrapaRound() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    if (this.atrapaRound > 5) {
      AppState.addReward(35, 1);
      AppState.triggerConfetti();
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🫧🏆</div>
          <h2 style="font-size: 2rem; font-weight: 900; margin-bottom: 0.5rem; color: var(--primary-dark);">¡Ronda Completada!</h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1.5rem;">Atrapaste los resultados correctos con gran rapidez. Puntos ganados: ${this.atrapaScore} pts.</p>
          <button class="btn btn-primary" onclick="JuegosController.startAtrapa()">Jugar Otra Vez 🔄</button>
        </div>
      `;
      return;
    }

    const n1 = Math.floor(Math.random() * 8) + 2; // 2 a 9
    const n2 = Math.floor(Math.random() * 8) + 2;
    const correct = n1 * n2;

    const wrongOpts = [correct + n1, correct - n1 > 0 ? correct - n1 : correct + 4, correct + 10];
    const options = [correct, ...wrongOpts].sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div class="catch-arena">
        <div style="display: flex; justify-content: space-between; color: #ffffff; font-weight: 800;">
          <span>Ronda ${this.atrapaRound} de 5</span>
          <span>Puntos: ${this.atrapaScore} ⭐</span>
        </div>
        <div style="text-align: center;">
          <div style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 700;">¡Atrapa la burbuja con el resultado correcto!</div>
          <div class="catch-question-badge">${n1} × ${n2} = ?</div>
        </div>
        <div class="bubbles-container">
          ${options.map(opt => `
            <div class="bubble-target" onclick="JuegosController.catchBubble(${opt}, ${correct}, this)">
              ${opt}
            </div>
          `).join('')}
        </div>
        <div id="catchFeedback" style="text-align: center; color: #ffffff; font-weight: 800; min-height: 24px;"></div>
      </div>
    `;
  },

  catchBubble(val, correct, el) {
    const feedback = document.getElementById('catchFeedback');
    if (val === correct) {
      if (window.soundSys) window.soundSys.playSuccess();
      this.atrapaScore += 10;
      this.atrapaRound++;
      el.style.transform = 'scale(1.3)';
      el.style.background = '#10b981';
      if (feedback) feedback.innerHTML = '<span style="color: #34d399;">✨ ¡Muy bien! ¡Burbuja correcta!</span>';
      setTimeout(() => this.renderAtrapaRound(), 800);
    } else {
      if (window.soundSys) window.soundSys.playError();
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';
      if (feedback) feedback.innerHTML = '<span style="color: #f87171;">❌ Esa no es. ¡Intenta con otra burbuja!</span>';
    }
  },

  // ==============================================================
  // 3. CONSTRUYE LA MULTIPLICACIÓN (ARRAYS / MATRICES)
  // ==============================================================
  startConstruye() {
    this.buildTargetRows = 4;
    this.buildTargetCols = 5;
    this.renderConstruye();
  },

  renderConstruye() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    const rows = this.buildTargetRows;
    const cols = this.buildTargetCols;
    const total = rows * cols;

    let gridHtml = '';
    for (let r = 0; r < rows; r++) {
      let rowItems = '';
      for (let c = 0; c < cols; c++) {
        rowItems += '<span class="builder-item">⭐</span>';
      }
      gridHtml += `<div class="builder-row">${rowItems}</div>`;
    }

    body.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; text-align: center;">
        <p style="color: var(--text-muted); font-weight: 700; margin-bottom: 1.25rem;">
          Ajusta las <strong>filas</strong> y <strong>columnas</strong> para observar cómo se forma la multiplicación en una matriz ordenada:
        </p>

        <div class="builder-controls">
          <div class="builder-stepper">
            <label>Filas:</label>
            <button class="stepper-btn" onclick="JuegosController.changeBuildRows(-1)">-</button>
            <span class="stepper-val">${rows}</span>
            <button class="stepper-btn" onclick="JuegosController.changeBuildRows(1)">+</button>
          </div>

          <span style="font-size: 1.8rem; font-weight: 900; color: var(--primary);">×</span>

          <div class="builder-stepper">
            <label>Columnas:</label>
            <button class="stepper-btn" onclick="JuegosController.changeBuildCols(-1)">-</button>
            <span class="stepper-val">${cols}</span>
            <button class="stepper-btn" onclick="JuegosController.changeBuildCols(1)">+</button>
          </div>

          <span style="font-size: 1.8rem; font-weight: 900; color: var(--primary);">=</span>

          <div style="font-size: 1.8rem; font-weight: 900; color: #ec4899;">
            ${total}
          </div>
        </div>

        <div class="builder-grid-display">
          ${gridHtml}
        </div>

        <div style="margin-top: 1.25rem; font-size: 1rem; color: var(--text-dark); font-weight: 800;">
          💡 Hay <strong>${rows} filas</strong> con <strong>${cols} estrellas</strong> cada una = <strong>${total} estrellas</strong> en total.
        </div>

        <div style="margin-top: 1.5rem;">
          <button class="btn btn-success" onclick="JuegosController.confirmBuildSuccess()">
            🎯 ¡Entendido! Validar y Ganar Puntos (+15 pts)
          </button>
        </div>
      </div>
    `;
  },

  changeBuildRows(delta) {
    if (window.soundSys) window.soundSys.playClick();
    this.buildTargetRows = Math.max(1, Math.min(8, this.buildTargetRows + delta));
    this.renderConstruye();
  },

  changeBuildCols(delta) {
    if (window.soundSys) window.soundSys.playClick();
    this.buildTargetCols = Math.max(1, Math.min(10, this.buildTargetCols + delta));
    this.renderConstruye();
  },

  confirmBuildSuccess() {
    if (window.soundSys) window.soundSys.playSuccess();
    AppState.addReward(15, 0);
    AppState.showToast('¡Construcción validada con éxito! 🧱🌟');
  },

  // ==============================================================
  // 4. ¿QUIÉN TIENE LA RESPUESTA?
  // ==============================================================
  startPersonajes() {
    this.personajesRound = 1;
    this.renderPersonajesRound();
  },

  renderPersonajesRound() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    if (this.personajesRound > 4) {
      AppState.addReward(25, 1);
      AppState.triggerConfetti();
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🦸🎉</div>
          <h2 style="font-size: 2rem; font-weight: 900; margin-bottom: 0.5rem; color: var(--primary-dark);">¡Todos los personajes te felicitan!</h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1.5rem;">Has elegido al personaje correcto en cada ronda.</p>
          <button class="btn btn-primary" onclick="JuegosController.startPersonajes()">Jugar Otra Vez 🔄</button>
        </div>
      `;
      return;
    }

    const t1 = Math.floor(Math.random() * 7) + 3;
    const t2 = Math.floor(Math.random() * 8) + 2;
    const correctAns = t1 * t2;

    const characters = [
      { name: 'Astronauta Leo', avatar: 'avatar_astronauta.svg', val: correctAns, isCorrect: true },
      { name: 'Detective Zoe', avatar: 'avatar_detective.svg', val: correctAns + t1, isCorrect: false },
      { name: 'Robot Tito', avatar: 'avatar_robot.svg', val: correctAns - t1 > 0 ? correctAns - t1 : correctAns + 6, isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div style="text-align: center; max-width: 650px; margin: 0 auto;">
        <span style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">Desafío ${this.personajesRound} de 4</span>
        <h3 style="font-size: 1.8rem; font-weight: 900; margin: 0.5rem 0 1rem; color: var(--text-dark);">
          ¿Quién tiene la respuesta de: <span style="color: #ec4899;">${t1} × ${t2}</span>?
        </h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
          Observa lo que dice cada amigo y haz clic en quien tenga el número exacto:
        </p>

        <div class="characters-quiz-grid">
          ${characters.map(c => `
            <div class="char-choice-card" onclick="JuegosController.checkPersonajeChoice(${c.isCorrect}, this)">
              <img class="char-avatar-img" src="IMAGEN/${c.avatar}" alt="${c.name}">
              <div style="font-weight: 800; font-size: 1rem; color: var(--text-dark);">${c.name}</div>
              <div class="char-bubble-value">"${c.val}"</div>
            </div>
          `).join('')}
        </div>

        <div id="personajeFeedback" style="min-height: 30px; font-weight: 800; font-size: 1.1rem; margin-top: 1rem;"></div>
      </div>
    `;
  },

  checkPersonajeChoice(isCorrect, cardEl) {
    const feedback = document.getElementById('personajeFeedback');
    if (isCorrect) {
      if (window.soundSys) window.soundSys.playSuccess();
      cardEl.classList.add('correct');
      if (feedback) feedback.innerHTML = '<span style="color: #10b981;">🎉 ¡Exacto! Ese personaje tenía la respuesta correcta.</span>';
      this.personajesRound++;
      setTimeout(() => this.renderPersonajesRound(), 1000);
    } else {
      if (window.soundSys) window.soundSys.playError();
      cardEl.classList.add('wrong');
      if (feedback) feedback.innerHTML = '<span style="color: #ef4444;">🤔 Uhm, ese personaje calculó mal. ¡Prueba con otro!</span>';
    }
  },

  // ==============================================================
  // 5. DESAFÍO CONTRA EL TIEMPO
  // ==============================================================
  startTiempo() {
    this.speedTimeLeft = 45;
    this.speedStreak = 0;
    this.speedTotalCorrect = 0;
    this.renderTiempoLayout();
    this.nextSpeedQuestion();

    if (this._speedTimerInterval) clearInterval(this._speedTimerInterval);
    this._speedTimerInterval = setInterval(() => {
      this.speedTimeLeft--;
      const timeTxt = document.getElementById('speedTimerTxt');
      const barFill = document.getElementById('speedBarFill');
      if (timeTxt) timeTxt.textContent = `${this.speedTimeLeft}s`;
      if (barFill) barFill.style.width = `${(this.speedTimeLeft / 45) * 100}%`;

      if (this.speedTimeLeft <= 0) {
        clearInterval(this._speedTimerInterval);
        this.finishTiempo();
      }
    }, 1000);
  },

  renderTiempoLayout() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    body.innerHTML = `
      <div style="max-width: 550px; margin: 0 auto;">
        <div class="speed-header">
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 800; display: block;">TIEMPO RESTANTE</span>
            <span id="speedTimerTxt" style="font-size: 1.6rem; font-weight: 900; color: #ef4444;">${this.speedTimeLeft}s</span>
          </div>
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 800; display: block;">RACHA ACTUAL</span>
            <span id="speedStreakTxt" style="font-size: 1.6rem; font-weight: 900; color: #f59e0b;">🔥 0</span>
          </div>
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 800; display: block;">ACIERTOS</span>
            <span id="speedCorrectTxt" style="font-size: 1.6rem; font-weight: 900; color: #10b981;">0</span>
          </div>
        </div>

        <div class="speed-timer-bar">
          <div class="speed-timer-fill" id="speedBarFill"></div>
        </div>

        <div class="speed-question-card">
          <div class="speed-equation" id="speedEquation">6 × 7 = ?</div>
          <div class="speed-options-grid" id="speedOptsGrid"></div>
        </div>
      </div>
    `;
  },

  nextSpeedQuestion() {
    const eqEl = document.getElementById('speedEquation');
    const gridEl = document.getElementById('speedOptsGrid');
    if (!eqEl || !gridEl) return;

    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 2;
    const correct = n1 * n2;
    this.speedCurrentCorrect = correct;

    eqEl.textContent = `${n1} × ${n2} = ?`;

    const wrong = [correct + n1, correct - n1 > 0 ? correct - n1 : correct + 3, correct + 7];
    const opts = [correct, ...wrong].sort(() => Math.random() - 0.5);

    gridEl.innerHTML = opts.map(o => `
      <button class="speed-opt-btn" onclick="JuegosController.checkSpeedAnswer(${o})">
        ${o}
      </button>
    `).join('');
  },

  checkSpeedAnswer(val) {
    if (val === this.speedCurrentCorrect) {
      if (window.soundSys) window.soundSys.playSuccess();
      this.speedStreak++;
      this.speedTotalCorrect++;
      if (this.speedStreak >= 8) {
        AppState.unlockAchievement('racha_tiempo', 'Velocidad Relámpago');
      }
    } else {
      if (window.soundSys) window.soundSys.playError();
      this.speedStreak = 0;
    }

    const streakTxt = document.getElementById('speedStreakTxt');
    const correctTxt = document.getElementById('speedCorrectTxt');
    if (streakTxt) streakTxt.textContent = `🔥 ${this.speedStreak}`;
    if (correctTxt) correctTxt.textContent = `${this.speedTotalCorrect}`;

    this.nextSpeedQuestion();
  },

  finishTiempo() {
    if (this._speedTimerInterval) clearInterval(this._speedTimerInterval);
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    const ptsEarned = this.speedTotalCorrect * 5;
    AppState.addReward(ptsEarned, 1);
    AppState.triggerConfetti();

    body.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem;">⏱️⚡</div>
        <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">¡Tiempo Agotado!</h2>
        <p style="font-size: 1.2rem; color: var(--text-dark); margin-bottom: 1.5rem;">
          Lograste <strong>${this.speedTotalCorrect} aciertos</strong> en 45 segundos.
          <br>
          <span style="color: #10b981; font-weight: 800;">Ganaste +${ptsEarned} Puntos ⭐</span>
        </p>
        <button class="btn btn-primary" onclick="JuegosController.startTiempo()">
          ⚡ ¡Intentar Romper Mi Récord!
        </button>
      </div>
    `;
  },

  // ==============================================================
  // 6. ARRASTRA Y COMPLETA (DRAG & DROP / CLICK TO PLACE)
  // ==============================================================
  startArrastra() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    this.dragItems = [
      { id: 'd1', op: '7 × 3 =', ans: 21, placed: null },
      { id: 'd2', op: '8 × 4 =', ans: 32, placed: null },
      { id: 'd3', op: '9 × 5 =', ans: 45, placed: null }
    ];

    this.selectedToken = null;
    this.renderArrastra();
  },

  renderArrastra() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    // Tokens no ubicados
    const availableTokens = this.dragItems
      .filter(item => item.placed === null)
      .map(item => item.ans)
      .sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div class="drag-container">
        <p style="text-align: center; font-weight: 700; color: var(--text-muted);">
          Haz clic o arrastra el número al casillero que complete la operación correcta:
        </p>

        <div class="drag-targets-list">
          ${this.dragItems.map(item => `
            <div class="drag-row">
              <span class="drag-prompt">${item.op}</span>
              <div class="drop-zone ${item.placed !== null ? 'filled' : ''}" 
                   id="drop_${item.id}"
                   onclick="JuegosController.placeTokenInSlot('${item.id}')">
                ${item.placed !== null ? item.placed : '¿?'}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="font-weight: 800; text-align: center; color: var(--text-dark); margin-top: 0.5rem;">
          Fichas Disponibles:
        </div>

        <div class="drag-tokens-bank">
          ${availableTokens.map(val => `
            <div class="drag-token ${this.selectedToken === val ? 'selected' : ''}" 
                 onclick="JuegosController.selectDragToken(${val}, this)"
                 style="${this.selectedToken === val ? 'outline: 3px solid #ec4899; transform: scale(1.1);' : ''}">
              ${val}
            </div>
          `).join('')}
        </div>

        <div id="dragFeedback" style="min-height: 24px; text-align: center; font-weight: 800;"></div>

        <div style="text-align: center; margin-top: 1rem;">
          <button class="btn btn-outline btn-sm" onclick="JuegosController.startArrastra()">Reiniciar Fichas 🔄</button>
        </div>
      </div>
    `;
  },

  selectDragToken(val, el) {
    if (window.soundSys) window.soundSys.playClick();
    this.selectedToken = val;
    this.renderArrastra();
    const fb = document.getElementById('dragFeedback');
    if (fb) fb.innerHTML = `<span style="color: var(--primary);">Ficha <strong>${val}</strong> seleccionada. Ahora toca el casillero correspondiente.</span>`;
  },

  placeTokenInSlot(slotId) {
    if (this.selectedToken === null) {
      const fb = document.getElementById('dragFeedback');
      if (fb) fb.innerHTML = '<span style="color: #f59e0b;">Primero selecciona una ficha de abajo.</span>';
      return;
    }

    const item = this.dragItems.find(i => i.id === slotId);
    if (!item) return;

    if (this.selectedToken === item.ans) {
      if (window.soundSys) window.soundSys.playSuccess();
      item.placed = this.selectedToken;
      this.selectedToken = null;

      const allFilled = this.dragItems.every(i => i.placed !== null);
      if (allFilled) {
        AppState.addReward(20, 1);
        AppState.triggerConfetti();
        this.renderArrastra();
        const fb = document.getElementById('dragFeedback');
        if (fb) fb.innerHTML = '<span style="color: #10b981; font-size: 1.2rem;">🎉 ¡Excelente trabajo! Todas las operaciones completadas.</span>';
      } else {
        this.renderArrastra();
      }
    } else {
      if (window.soundSys) window.soundSys.playError();
      const fb = document.getElementById('dragFeedback');
      if (fb) fb.innerHTML = `<span style="color: #ef4444;">❌ Esa ficha no corresponde a "${item.op}". ¡Calcula nuevamente!</span>`;
    }
  },

  // ==============================================================
  // 7. DETECTIVE MATEMÁTICO (MATH DETECTIVE)
  // ==============================================================
  startDetective() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    // Caso de misterio: Número incógnita 42
    this.detectiveSecret = 42;

    body.innerHTML = `
      <div class="detective-case-box" style="max-width: 600px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <span style="font-size: 2.5rem;">🕵️‍♂️</span>
          <div>
            <h3 style="font-size: 1.4rem; font-weight: 900; color: #78350f;">Caso Secreto: El Número Escondido</h3>
            <p style="font-size: 0.85rem; color: #b45309; font-weight: 700;">Lee las pistas matemáticas para descubrir la identidad del número misterioso:</p>
          </div>
        </div>

        <div class="clue-list">
          <div class="clue-item">
            <span>🔎</span>
            <span><strong>Pista 1:</strong> Es un número par perteneciente a la <strong>tabla del 6</strong> y a la <strong>tabla del 7</strong>.</span>
          </div>
          <div class="clue-item">
            <span>🔎</span>
            <span><strong>Pista 2:</strong> Es mayor que 35 pero menor que 45.</span>
          </div>
          <div class="clue-item">
            <span>🔎</span>
            <span><strong>Pista 3:</strong> La suma de sus dos dígitos es igual a 6 (dígito 1 + dígito 2 = 6).</span>
          </div>
        </div>

        <div class="detective-input-area">
          <input type="number" id="detectiveGuessInput" class="detective-input" placeholder="??" autofocus>
          <button class="btn btn-accent" onclick="JuegosController.checkDetectiveGuess()">
            Revelar Misterio 🗝️
          </button>
        </div>

        <div id="detectiveFeedback" style="text-align: center; font-weight: 800; margin-top: 1.25rem; min-height: 28px;"></div>
      </div>
    `;
  },

  checkDetectiveGuess() {
    const input = document.getElementById('detectiveGuessInput');
    const fb = document.getElementById('detectiveFeedback');
    if (!input || !fb) return;

    const val = parseInt(input.value);

    if (val === this.detectiveSecret) {
      if (window.soundSys) window.soundSys.playSuccess();
      AppState.unlockAchievement('detective_pro', 'Detective Matemático');
      AppState.addReward(30, 1);
      AppState.triggerConfetti();

      fb.innerHTML = `
        <span style="color: #10b981; font-size: 1.3rem;">
          🎉 ¡CASO RESUELTO! El número es el 42 (6 × 7 = 42 y 4 + 2 = 6). ¡Eres un gran detective! (+30 pts)
        </span>
      `;
    } else {
      if (window.soundSys) window.soundSys.playError();
      fb.innerHTML = `
        <span style="color: #ef4444;">
          🧐 El número ${val || ''} no cumple con todas las pistas. Revisa la tabla del 6 y del 7 entre 35 y 45.
        </span>
      `;
    }
  }
};
