/**
 * juegos.js - Módulo de Juegos y Desafíos Matemáticos tipo SIMCE 4° Básico
 * Actividades lúdicas y didácticas: Memoria, Atrapa, Construye, Quién tiene, Tiempo, Arrastra y Detective
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
      memoria: '🃏 Memoria Matemática SIMCE',
      atrapa: '🫧 Atrapa el Resultado Arcade',
      construye: '🧱 Taller de Construcción de Filas & Columnas',
      personajes: '🦸 ¿Quién tiene la respuesta? (Detector de Errores)',
      tiempo: '⏱️ Torneo Contra el Tiempo (Cálculo Mental)',
      arrastra: '✋ Arrastra y Completa (Propiedades SIMCE)',
      detective: '🔍 Detective Matemático: Casos de Misterio',
      supermercado: '🛒 Súper Mercado SIMCE (Caja Registradora)',
      ranita: '🐸 El Salto de la Ranita (Recta Numérica)'
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
      case 'supermercado': this.startSupermercado(); break;
      case 'ranita': this.startRanita(); break;
    }
  },

  closeGameModal() {
    const modal = document.getElementById('gameModalOverlay');
    if (modal) modal.classList.remove('active');
    if (this._speedTimerInterval) clearInterval(this._speedTimerInterval);
  },

  // ==============================================================
  // 1. MEMORIA MATEMÁTICA CON CONTEXTO SIMCE
  // ==============================================================
  startMemoria() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    // Parejas contextualizadas tipo SIMCE: operación y problema cotidiano
    const pairs = [
      { id: 1, op: '4 × 5', sit: '4 cajas con 5 lápices ✏️\n(20 lápices)', res: 20 },
      { id: 2, op: '6 × 3', sit: '6 filas con 3 sillas 🪑\n(18 sillas)', res: 18 },
      { id: 3, op: '7 × 2', sit: '7 semanas de 2 entrenamientos ⚽\n(14 días)', res: 14 },
      { id: 4, op: '8 × 4', sit: '8 bolsas con 4 manzanas 🍎\n(32 manzanas)', res: 32 }
    ];

    let cards = [];
    pairs.forEach(p => {
      cards.push({ pairId: p.id, text: p.op, type: 'op', full: `${p.op} = ${p.res}` });
      cards.push({ pairId: p.id, text: p.sit, type: 'sit', full: p.sit });
    });
    cards.sort(() => Math.random() - 0.5);

    this.memoriaState = {
      flipped: [],
      matchedCount: 0,
      totalPairs: pairs.length,
      attempts: 0,
      lock: false
    };

    body.innerHTML = `
      <div style="text-align: center; max-width: 680px; margin: 0 auto;">
        <div class="memory-stats-bar">
          <span id="memAttemptsTxt" style="color: var(--primary-dark);">Intentos: 0</span>
          <span style="color: #64748b; font-size: 0.9rem;">Relaciona la multiplicación con la situación del problema</span>
          <span id="memStarsTxt" style="color: #f59e0b;">⭐⭐⭐</span>
        </div>

        <div class="memory-board" id="memoryBoard">
          ${cards.map((c, i) => `
            <div class="memory-card" id="memCard_${i}" data-index="${i}" data-pair="${c.pairId}" onclick="JuegosController.flipMemoryCard(${i})">
              <div class="memory-front">❓</div>
              <div class="memory-back">
                ${c.type === 'op' 
                  ? `<div class="mem-card-type-op">${c.text}</div>` 
                  : `<div class="mem-card-type-sit">${c.text.replace('\n', '<br>')}</div>`
                }
              </div>
            </div>
          `).join('')}
        </div>

        <div id="memoryFeedbackBox" style="min-height: 48px; margin-top: 1rem; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.05rem; color: var(--primary);">
          Toca dos tarjetas para descubrir sus secretos.
        </div>
      </div>
    `;
  },

  flipMemoryCard(idx) {
    const s = this.memoriaState;
    if (s.lock) return;
    const cardEl = document.getElementById(`memCard_${idx}`);
    if (!cardEl || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    if (window.soundSys) window.soundSys.playCardFlip();
    cardEl.classList.add('flipped');
    s.flipped.push({ idx, el: cardEl, pair: cardEl.dataset.pair });

    if (s.flipped.length === 2) {
      s.attempts++;
      const attemptsEl = document.getElementById('memAttemptsTxt');
      const starsEl = document.getElementById('memStarsTxt');
      if (attemptsEl) attemptsEl.textContent = `Intentos: ${s.attempts}`;
      if (starsEl) {
        if (s.attempts <= 6) starsEl.textContent = '⭐⭐⭐';
        else if (s.attempts <= 9) starsEl.textContent = '⭐⭐☆';
        else starsEl.textContent = '⭐☆☆';
      }

      s.lock = true;
      const [c1, c2] = s.flipped;
      const feedbackBox = document.getElementById('memoryFeedbackBox');

      if (c1.pair === c2.pair) {
        // Pareja correcta
        if (window.soundSys) window.soundSys.playSuccess();
        setTimeout(() => {
          c1.el.classList.add('matched');
          c2.el.classList.add('matched');
          s.matchedCount++;
          s.flipped = [];
          s.lock = false;

          if (feedbackBox) {
            feedbackBox.innerHTML = `
              <span style="color: #10b981; animation: popIn 0.3s ease;">
                🎉 ¡Excelente relación! Entendiste la situación y la multiplicación.
              </span>
            `;
          }

          if (s.matchedCount === s.totalPairs) {
            AppState.addReward(35, 1);
            AppState.unlockAchievement('memoria_genio', 'Mente Brillante');
            AppState.triggerConfetti();
            if (feedbackBox) {
              feedbackBox.innerHTML = `
                <div style="text-align: center;">
                  <span style="color: #10b981; font-size: 1.3rem;">🏆 ¡Completaste toda la Memoria SIMCE! Ganaste +35 pts.</span>
                  <br>
                  <button class="btn btn-primary btn-sm" style="margin-top: 0.5rem;" onclick="JuegosController.startMemoria()">Jugar Otra Partida 🔄</button>
                </div>
              `;
            }
          }
        }, 500);
      } else {
        // No coinciden
        if (window.soundSys) window.soundSys.playError();
        if (feedbackBox) {
          feedbackBox.innerHTML = `<span style="color: #ef4444;">🤔 No coinciden. ¡Observa bien las tarjetas y vuelve a intentar!</span>`;
        }
        setTimeout(() => {
          c1.el.classList.remove('flipped');
          c2.el.classList.remove('flipped');
          s.flipped = [];
          s.lock = false;
        }, 1100);
      }
    }
  },

  // ==============================================================
  // 2. ATRAPA EL RESULTADO (ARCADE SIMCE CON RACHAS)
  // ==============================================================
  startAtrapa() {
    this.atrapaRound = 1;
    this.atrapaScore = 0;
    this.atrapaStreak = 0;
    this.atrapaQuestions = [
      {
        historia: 'En la librería escolar, Tomás compró 5 cuadernos a $600 pesos cada uno.',
        pregunta: '5 × 600 = ?',
        correct: 3000,
        wrong: [2400, 3500, 3600],
        pista: 'Piensa en 5 × 6 = 30 y agrega los dos ceros: $3.000 pesos.'
      },
      {
        historia: 'En el huerto de 4° básico sembraron 7 surcos con 8 lechugas en cada uno.',
        pregunta: '7 × 8 = ?',
        correct: 56,
        wrong: [48, 54, 64],
        pista: '7 filas con 8 lechugas es sumar 8 siete veces = 56 lechugas.'
      },
      {
        historia: 'Para un torneo de básquetbol se armaron 6 equipos con 7 jugadores cada uno.',
        pregunta: '6 × 7 = ?',
        correct: 42,
        wrong: [36, 48, 49],
        pista: '6 × 7 es 42 jugadores en total.'
      },
      {
        historia: 'El colegio contrató 4 buses escolares con 9 asientos para profesores en cada uno.',
        pregunta: '4 × 9 = ?',
        correct: 36,
        wrong: [32, 45, 38],
        pista: '4 × 9 = 36 asientos.'
      },
      {
        historia: 'Matías ahorró $900 pesos diarios en su alcancía durante 8 días seguidos.',
        pregunta: '8 × 900 = ?',
        correct: 7200,
        wrong: [6400, 7000, 8100],
        pista: 'Multiplica 8 × 9 = 72 y agrega los ceros: $7.200 pesos.'
      }
    ];

    this.renderAtrapaRound();
  },

  renderAtrapaRound() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    if (this.atrapaRound > this.atrapaQuestions.length) {
      AppState.addReward(40, 1);
      AppState.triggerConfetti();
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🫧🏆</div>
          <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; color: var(--primary-dark);">¡Misión Arcade Completada!</h2>
          <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 1.5rem;">
            Resolviste todas las situaciones SIMCE con gran agilidad mental.
            <br>
            <strong style="color: #10b981;">Puntaje acumulado: ${this.atrapaScore} puntos ⭐</strong>
          </p>
          <button class="btn btn-primary" onclick="JuegosController.startAtrapa()">Jugar Otra Ronda 🔄</button>
        </div>
      `;
      return;
    }

    const q = this.atrapaQuestions[this.atrapaRound - 1];
    const options = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div class="catch-arena">
        <div class="catch-header-stats">
          <span>Ronda ${this.atrapaRound} de ${this.atrapaQuestions.length}</span>
          <span class="streak-flame-badge">🔥 Racha: x${this.atrapaStreak}</span>
          <span>Puntos: ${this.atrapaScore} ⭐</span>
        </div>

        <div class="catch-simce-story-card">
          <div class="catch-story-text">📖 <strong>Situación SIMCE:</strong> ${q.historia}</div>
          <div class="catch-eq-highlight">${q.pregunta}</div>
        </div>

        <div class="bubbles-container">
          ${options.map(opt => `
            <div class="bubble-target" onclick="JuegosController.catchBubble(${opt}, ${q.correct}, '${q.pista}', this)">
              ${opt}
            </div>
          `).join('')}
        </div>

        <div id="catchFeedback" style="text-align: center; color: #ffffff; font-weight: 800; min-height: 28px;">
          Toca la burbuja con el resultado correcto antes de que suba.
        </div>
      </div>
    `;
  },

  catchBubble(val, correct, pista, el) {
    const feedback = document.getElementById('catchFeedback');
    if (val === correct) {
      if (window.soundSys) window.soundSys.playSuccess();
      this.atrapaStreak++;
      const pointsEarned = 10 * Math.min(3, this.atrapaStreak);
      this.atrapaScore += pointsEarned;
      AppState.addReward(pointsEarned, 0);

      el.style.transform = 'scale(1.35)';
      el.style.background = '#10b981';
      if (feedback) feedback.innerHTML = `<span style="color: #34d399; font-size: 1.15rem;">✨ ¡Excelente cálculo! (+${pointsEarned} pts con combo)</span>`;
      
      setTimeout(() => {
        this.atrapaRound++;
        this.renderAtrapaRound();
      }, 900);
    } else {
      if (window.soundSys) window.soundSys.playError();
      this.atrapaStreak = 0;
      el.style.opacity = '0.35';
      el.style.pointerEvents = 'none';
      if (feedback) feedback.innerHTML = `<span style="color: #f87171;">💡 <strong>Pista de ayuda:</strong> ${pista}</span>`;
    }
  },

  // ==============================================================
  // 3. CONSTRUYE LA MULTIPLICACIÓN (ARREGLOS RECTANGULARES SIMCE)
  // ==============================================================
  startConstruye() {
    this.buildMissionIndex = 0;
    this.buildCurrentTheme = '🪑';
    this.buildMissions = [
      {
        titulo: 'Misión 1: Sillas del Acto Escolar',
        contexto: 'El director necesita ordenar exactamente 24 sillas para los invitados del acto de 4° básico.',
        targetRows: 4,
        targetCols: 6,
        targetTotal: 24,
        theme: '🪑',
        unidad: 'sillas'
      },
      {
        titulo: 'Misión 2: Huerto de Zanahorias',
        contexto: 'Los estudiantes preparan un huerto de 3 filas con 7 zanahorias en cada fila.',
        targetRows: 3,
        targetCols: 7,
        targetTotal: 21,
        theme: '🥕',
        unidad: 'zanahorias'
      },
      {
        titulo: 'Misión 3: Bandeja de Repostería',
        contexto: 'En el taller de cocina hornearán galletas con 5 filas de 8 unidades cada una.',
        targetRows: 5,
        targetCols: 8,
        targetTotal: 40,
        theme: '🍪',
        unidad: 'galletas'
      }
    ];

    this.buildRows = 2;
    this.buildCols = 3;
    this.renderConstruye();
  },

  renderConstruye() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    const mission = this.buildMissions[this.buildMissionIndex];
    const rows = this.buildRows;
    const cols = this.buildCols;
    const total = rows * cols;
    const isTargetAchieved = (rows === mission.targetRows && cols === mission.targetCols) || total === mission.targetTotal;

    let gridHtml = '';
    for (let r = 0; r < rows; r++) {
      let rowItems = '';
      for (let c = 0; c < cols; c++) {
        rowItems += `<span class="builder-item">${mission.theme}</span>`;
      }
      gridHtml += `<div class="builder-row">${rowItems}</div>`;
    }

    body.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto; text-align: center;">
        <div class="build-mission-card">
          <div class="build-mission-title">📐 ${mission.titulo}</div>
          <div class="build-mission-goal">${mission.contexto}</div>
          <div style="font-weight: 800; font-size: 0.9rem; color: #1e3a8a; margin-top: 0.35rem;">
            🎯 Objetivo SIMCE: Forma una cuadrícula con <strong>${mission.targetTotal} ${mission.unidad}</strong>.
          </div>
        </div>

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

          <div style="font-size: 2rem; font-weight: 900; color: ${total === mission.targetTotal ? '#10b981' : '#ec4899'};">
            ${total}
          </div>
        </div>

        <div class="builder-grid-display">
          ${gridHtml}
        </div>

        <div style="margin-top: 1rem; font-size: 1rem; color: var(--text-dark); font-weight: 800;">
          💡 Estás representando: <strong>${rows} filas × ${cols} columnas = ${total} ${mission.unidad}</strong>
          <br>
          <span style="font-size: 0.85rem; color: #64748b;">(Suma iterada: ${Array(rows).fill(cols).join(' + ')} = ${total})</span>
        </div>

        <div style="margin-top: 1.5rem;">
          ${isTargetAchieved ? `
            <button class="btn btn-success btn-lg" onclick="JuegosController.advanceBuildMission()">
              🎉 ¡Misión Lograda! Validar Construcción (+25 pts)
            </button>
          ` : `
            <div style="font-weight: 800; color: #b45309;">
              Ajusta las filas y columnas hasta alcanzar exactamente ${mission.targetTotal} ${mission.unidad}.
            </div>
          `}
        </div>
      </div>
    `;
  },

  changeBuildRows(delta) {
    if (window.soundSys) window.soundSys.playClick();
    this.buildRows = Math.max(1, Math.min(8, this.buildRows + delta));
    this.renderConstruye();
  },

  changeBuildCols(delta) {
    if (window.soundSys) window.soundSys.playClick();
    this.buildCols = Math.max(1, Math.min(10, this.buildCols + delta));
    this.renderConstruye();
  },

  advanceBuildMission() {
    if (window.soundSys) window.soundSys.playLevelUp();
    AppState.addReward(25, 1);
    AppState.triggerConfetti();

    this.buildMissionIndex++;
    if (this.buildMissionIndex < this.buildMissions.length) {
      this.buildRows = 2;
      this.buildCols = 2;
      this.renderConstruye();
    } else {
      const body = document.getElementById('gameModalBody');
      if (!body) return;
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🏗️⭐</div>
          <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">¡Maestro Constructor de Arreglos!</h2>
          <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 1.5rem;">
            Completaste todas las misiones de arreglos rectangulares. ¡En el SIMCE recordarás siempre que filas × columnas da el total!
          </p>
          <button class="btn btn-primary" onclick="JuegosController.startConstruye()">Volver a Construir 🔄</button>
        </div>
      `;
    }
  },

  // ==============================================================
  // 4. ¿QUIÉN TIENE LA RESPUESTA? (DETECTOR DE ERRORES COMUNES SIMCE)
  // ==============================================================
  startPersonajes() {
    this.personajesRound = 1;
    this.personajesCases = [
      {
        pregunta: '¿Cuánto es 6 × 7?',
        characters: [
          { name: 'Astronauta Leo', avatar: 'avatar_astronauta.svg', val: '42', isCorrect: true, hint: '¡Correcto! 6 veces 7 es 42.' },
          { name: 'Robot Tito', avatar: 'avatar_robot.svg', val: '13', isCorrect: false, hint: '⚠️ ¡Trampa SIMCE!: Tito sumó 6 + 7 en vez de multiplicar.' },
          { name: 'Detective Zoe', avatar: 'avatar_detective.svg', val: '48', isCorrect: false, hint: '⚠️ ¡Error de factor!: Zoe calculó 6 × 8 = 48 (se pasó por un 6).' }
        ]
      },
      {
        pregunta: '¿Cuánto es 8 × 4?',
        characters: [
          { name: 'Maga Luna', avatar: 'avatar_mago.svg', val: '12', isCorrect: false, hint: '⚠️ ¡Error frecuente!: Luna sumó 8 + 4 = 12 en vez de multiplicar.' },
          { name: 'Astronauta Leo', avatar: 'avatar_astronauta.svg', val: '32', isCorrect: true, hint: '¡Genial! 8 × 4 = 32 (el doble del doble de 8).' },
          { name: 'Explorador Nico', avatar: 'avatar_explorador.svg', val: '36', isCorrect: false, hint: '⚠️ Nico confundió la tabla del 4 con 9 × 4 = 36.' }
        ]
      },
      {
        pregunta: '¿Cuánto es 9 × 5?',
        characters: [
          { name: 'Detective Zoe', avatar: 'avatar_detective.svg', val: '45', isCorrect: true, hint: '¡Exacto! Termina en 5 y sus dígitos 4+5 suman 9.' },
          { name: 'Robot Tito', avatar: 'avatar_robot.svg', val: '40', isCorrect: false, hint: '⚠️ Tito calculó 8 × 5 = 40 (le faltó un 5).' },
          { name: 'Maga Luna', avatar: 'avatar_mago.svg', val: '14', isCorrect: false, hint: '⚠️ ¡Cuidado con la suma!: 9 + 5 = 14 no es la multiplicación.' }
        ]
      }
    ];

    this.renderPersonajesRound();
  },

  renderPersonajesRound() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    if (this.personajesRound > this.personajesCases.length) {
      AppState.addReward(30, 1);
      AppState.triggerConfetti();
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🦸🎉</div>
          <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">¡Detector de Errores SIMCE Superado!</h2>
          <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 1.5rem;">
            Ya sabes distinguir cuándo un compañero calcula bien y cuándo cae en la trampa de sumar en vez de multiplicar.
          </p>
          <button class="btn btn-primary" onclick="JuegosController.startPersonajes()">Jugar Otra Vez 🔄</button>
        </div>
      `;
      return;
    }

    const currentCase = this.personajesCases[this.personajesRound - 1];

    body.innerHTML = `
      <div style="text-align: center; max-width: 680px; margin: 0 auto;">
        <span style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">Desafío ${this.personajesRound} de ${this.personajesCases.length}</span>
        <h3 style="font-size: 2rem; font-weight: 900; margin: 0.5rem 0 0.5rem; color: var(--text-dark);">
          ${currentCase.pregunta}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
          Observa lo que dice cada amigo y elige a quien tenga el cálculo exacto (¡cuidado con las trampas SIMCE!):
        </p>

        <div class="characters-quiz-grid">
          ${currentCase.characters.map((c, idx) => `
            <div class="char-choice-card" onclick="JuegosController.checkPersonajeChoice(${c.isCorrect}, '${c.hint.replace(/'/g, "\\'")}', this)">
              <img class="char-avatar-img" src="IMAGEN/${c.avatar}" alt="${c.name}">
              <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-dark);">${c.name}</div>
              <div class="char-bubble-value">"${c.val}"</div>
              <div class="char-thought-hint">Toca para comprobar</div>
            </div>
          `).join('')}
        </div>

        <div id="personajeFeedback" style="min-height: 48px; font-weight: 800; font-size: 1.1rem; margin-top: 1rem;"></div>
      </div>
    `;
  },

  checkPersonajeChoice(isCorrect, hint, cardEl) {
    const feedback = document.getElementById('personajeFeedback');
    if (isCorrect) {
      if (window.soundSys) window.soundSys.playSuccess();
      cardEl.classList.add('correct');
      if (feedback) feedback.innerHTML = `<span style="color: #10b981;">🎉 ${hint}</span>`;
      setTimeout(() => {
        this.personajesRound++;
        this.renderPersonajesRound();
      }, 1400);
    } else {
      if (window.soundSys) window.soundSys.playError();
      cardEl.classList.add('wrong');
      if (feedback) feedback.innerHTML = `<span style="color: #ef4444;">${hint}</span>`;
    }
  },

  // ==============================================================
  // 5. DESAFÍO CONTRA EL TIEMPO (CÁLCULO MENTAL RELÁMPAGO)
  // ==============================================================
  startTiempo() {
    this.speedTimeLeft = 50;
    this.speedLives = 3;
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
      if (barFill) barFill.style.width = `${(this.speedTimeLeft / 50) * 100}%`;

      if (this.speedTimeLeft <= 0 || this.speedLives <= 0) {
        clearInterval(this._speedTimerInterval);
        this.finishTiempo();
      }
    }, 1000);
  },

  renderTiempoLayout() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    let hearts = '';
    for (let i = 0; i < 3; i++) {
      hearts += i < this.speedLives ? '❤️' : '🖤';
    }

    body.innerHTML = `
      <div style="max-width: 580px; margin: 0 auto;">
        <div class="speed-header">
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 800; display: block;">VIDAS</span>
            <div id="speedHeartsBox" class="speed-lives-box">${hearts}</div>
          </div>
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 800; display: block;">TIEMPO</span>
            <span id="speedTimerTxt" style="font-size: 1.6rem; font-weight: 900; color: #ef4444;">${this.speedTimeLeft}s</span>
          </div>
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 800; display: block;">RACHA</span>
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
      this.speedLives--;
      const heartsBox = document.getElementById('speedHeartsBox');
      if (heartsBox) {
        let h = '';
        for (let i = 0; i < 3; i++) h += i < this.speedLives ? '❤️' : '🖤';
        heartsBox.innerHTML = h;
      }
      if (this.speedLives <= 0) {
        this.finishTiempo();
        return;
      }
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

    const ptsEarned = this.speedTotalCorrect * 6;
    AppState.addReward(ptsEarned, this.speedTotalCorrect >= 7 ? 2 : 1);
    AppState.triggerConfetti();

    body.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem;">⚡🏆</div>
        <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">¡Torneo Finalizado!</h2>
        <p style="font-size: 1.2rem; color: var(--text-dark); margin-bottom: 1.5rem;">
          Lograste <strong>${this.speedTotalCorrect} aciertos</strong> de cálculo mental.
          <br>
          <span style="color: #10b981; font-weight: 800;">Ganaste +${ptsEarned} Puntos ⭐</span>
        </p>
        <button class="btn btn-primary" onclick="JuegosController.startTiempo()">
          ⚡ ¡Intentar Superar Mi Récord!
        </button>
      </div>
    `;
  },

  // ==============================================================
  // 6. ARRASTRA Y COMPLETA (PROPIEDADES SIMCE: CONMUTATIVA Y SUMA ITERADA)
  // ==============================================================
  startArrastra() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    // Desafíos de conceptos clave del SIMCE
    this.dragItems = [
      { id: 'd1', op: '5 × 4 = 4 ×', ans: 5, placed: null, concepto: 'Propiedad conmutativa: 5 × 4 es lo mismo que 4 × 5' },
      { id: 'd2', op: '7 + 7 + 7 + 7 = [ ? ] × 7', ans: 4, placed: null, concepto: 'Suma iterada: el 7 se repite 4 veces' },
      { id: 'd3', op: '8 × [ ? ] = 56', ans: 7, placed: null, concepto: 'Factor incógnita: 8 × 7 = 56' },
      { id: 'd4', op: '3 × 9 =', ans: 27, placed: null, concepto: 'Producto directo: 3 veces 9 es 27' }
    ];

    this.selectedToken = null;
    this.renderArrastra();
  },

  renderArrastra() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    const availableTokens = this.dragItems
      .filter(item => item.placed === null)
      .map(item => item.ans)
      .sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div class="drag-container">
        <div class="drag-rule-badge">
          🧠 <strong>Truco SIMCE:</strong> La multiplicación es una suma que se repite y el orden de los factores no cambia el resultado.
        </div>

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
          Toca una ficha y luego toca el casillero correspondiente:
        </div>

        <div class="drag-tokens-bank">
          ${availableTokens.map(val => `
            <div class="drag-token ${this.selectedToken === val ? 'selected' : ''}" 
                 onclick="JuegosController.selectDragToken(${val}, this)">
              ${val}
            </div>
          `).join('')}
        </div>

        <div id="dragFeedback" style="min-height: 30px; text-align: center; font-weight: 800;"></div>

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
        AppState.addReward(30, 1);
        AppState.triggerConfetti();
        this.renderArrastra();
        const fb = document.getElementById('dragFeedback');
        if (fb) fb.innerHTML = '<span style="color: #10b981; font-size: 1.2rem;">🎉 ¡Excelente! Dominas las propiedades conmutativa y la suma iterada del SIMCE.</span>';
      } else {
        this.renderArrastra();
        const fb = document.getElementById('dragFeedback');
        if (fb) fb.innerHTML = `<span style="color: #10b981;">✅ ¡Correcto! ${item.concepto}.</span>`;
      }
    } else {
      if (window.soundSys) window.soundSys.playError();
      const fb = document.getElementById('dragFeedback');
      if (fb) fb.innerHTML = `<span style="color: #ef4444;">❌ Esa ficha no corresponde a "${item.op}". ¡Calcula nuevamente!</span>`;
    }
  },

  // ==============================================================
  // 7. DETECTIVE MATEMÁTICO (CASOS DE MISTERIO SIMCE)
  // ==============================================================
  startDetective() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    this.detectiveCases = [
      {
        titulo: 'Caso 1: Las Monedas de la Alcancía',
        secret: 42,
        pistas: [
          'Pertenece a la tabla del 6 y a la tabla del 7.',
          'Es un número par mayor que 35 pero menor que 45.',
          'La suma de sus dos dígitos es igual a 6 (4 + 2 = 6).'
        ],
        explicacion: '6 × 7 = 42. ¡Excelente deducción detectivesca!'
      },
      {
        titulo: 'Caso 2: Los Balones del Gimnasio',
        secret: 56,
        pistas: [
          'Es el resultado de multiplicar 7 × 8.',
          'Es un número par mayor que 50.',
          'Al sumarle 4 llegas exactamente a 60.'
        ],
        explicacion: '7 filas con 8 balones = 56 balones en total.'
      }
    ];

    this.currentCaseIndex = 0;
    this.renderDetectiveCase();
  },

  renderDetectiveCase() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    const c = this.detectiveCases[this.currentCaseIndex];

    body.innerHTML = `
      <div class="detective-case-box" style="max-width: 620px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <span style="font-size: 2.8rem;">🕵️‍♂️</span>
          <div>
            <h3 style="font-size: 1.5rem; font-weight: 900; color: #78350f;">${c.titulo}</h3>
            <p style="font-size: 0.9rem; color: #b45309; font-weight: 700;">Lee las pistas matemáticas para descubrir el número secreto:</p>
          </div>
        </div>

        <div class="clue-list">
          ${c.pistas.map((p, idx) => `
            <div class="clue-item">
              <span style="font-size: 1.3rem;">🔎</span>
              <span><strong>Pista ${idx + 1}:</strong> ${p}</span>
            </div>
          `).join('')}
        </div>

        <div class="detective-input-area">
          <input type="number" id="detectiveGuessInput" class="detective-input" placeholder="??" autofocus>
          <button class="btn btn-accent btn-lg" onclick="JuegosController.checkDetectiveGuess()">
            Revelar Misterio 🗝️
          </button>
        </div>

        <div id="detectiveFeedback" style="text-align: center; font-weight: 800; margin-top: 1.25rem; min-height: 32px;"></div>
      </div>
    `;
  },

  checkDetectiveGuess() {
    const input = document.getElementById('detectiveGuessInput');
    const fb = document.getElementById('detectiveFeedback');
    if (!input || !fb) return;

    const val = parseInt(input.value);
    const c = this.detectiveCases[this.currentCaseIndex];

    if (val === c.secret) {
      if (window.soundSys) window.soundSys.playSuccess();
      AppState.unlockAchievement('detective_pro', 'Detective Matemático');
      AppState.addReward(35, 1);
      AppState.triggerConfetti();

      fb.innerHTML = `
        <span style="color: #10b981; font-size: 1.3rem;">
          🎉 ¡CASO RESUELTO! El número es ${c.secret}. ${c.explicacion} (+35 pts)
        </span>
      `;

      setTimeout(() => {
        if (this.currentCaseIndex < this.detectiveCases.length - 1) {
          this.currentCaseIndex++;
          this.renderDetectiveCase();
        }
      }, 2500);
    } else {
      if (window.soundSys) window.soundSys.playError();
      fb.innerHTML = `
        <span style="color: #ef4444;">
          🧐 El número ${val || ''} no cumple con todas las pistas. Revisa atentamente las condiciones.
        </span>
      `;
    }
  },

  // ==============================================================
  // 8. SÚPER MERCADO SIMCE (CAJA REGISTRADORA Y PRECIOS COTIDIANOS)
  // ==============================================================
  startSupermercado() {
    this.marketRound = 1;
    this.marketCustomers = [
      {
        nombre: 'Cliente 1: Tomás',
        item: 'Jugos de Naranja',
        icono: '🧃',
        cantidad: 4,
        precioUnitario: 500,
        total: 2000,
        opciones: [2000, 1800, 2500, 2200],
        explicacion: '4 jugos × $500 pesos = $2.000 pesos en total.'
      },
      {
        nombre: 'Cliente 2: Sofía',
        item: 'Cajas de Cereales',
        icono: '🥣',
        cantidad: 3,
        precioUnitario: 800,
        total: 2400,
        opciones: [2400, 2100, 2800, 2600],
        explicacion: '3 cajas × $800 pesos = $2.400 pesos en total.'
      },
      {
        nombre: 'Cliente 3: Lucas',
        item: 'Paquetes de Galletas',
        icono: '🍪',
        cantidad: 6,
        precioUnitario: 400,
        total: 2400,
        opciones: [2400, 2000, 3000, 2800],
        explicacion: '6 paquetes × $400 pesos = $2.400 pesos en total.'
      },
      {
        nombre: 'Cliente 4: Martina',
        item: 'Barras de Cereal',
        icono: '🍫',
        cantidad: 7,
        precioUnitario: 300,
        total: 2100,
        opciones: [2100, 1800, 2400, 2700],
        explicacion: '7 barras × $300 pesos = $2.100 pesos en total.'
      }
    ];

    this.renderSupermarketRound();
  },

  renderSupermarketRound() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    if (this.marketRound > this.marketCustomers.length) {
      AppState.addReward(35, 1);
      AppState.triggerConfetti();
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🛒💰</div>
          <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">¡Cajero Experto del SIMCE!</h2>
          <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 1.5rem;">
            Calculaste todas las compras sin equivocarte en los precios ni en la multiplicación con dinero real.
          </p>
          <button class="btn btn-primary" onclick="JuegosController.startSupermercado()">Atender Nuevos Clientes 🔄</button>
        </div>
      `;
      return;
    }

    const c = this.marketCustomers[this.marketRound - 1];
    const opts = [...c.opciones].sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div class="supermarket-container">
        <div style="display: flex; justify-content: space-between; font-weight: 800; color: var(--primary-dark);">
          <span>Cliente ${this.marketRound} de ${this.marketCustomers.length}</span>
          <span>${c.nombre}</span>
        </div>

        <div class="market-conveyor-card">
          <div class="market-item-icon-show">${c.icono.repeat(c.cantidad)}</div>
          <div class="market-product-name">${c.cantidad} ${c.item}</div>
          <div class="market-unit-price-badge">Precio unitario: $${c.precioUnitario} pesos c/u</div>
        </div>

        <div class="market-register-screen">
          <div class="register-screen-eq">${c.cantidad} × $${c.precioUnitario} = [ ? ]</div>
          <div class="register-screen-sub">Calcula el total a cobrar en la caja:</div>
        </div>

        <div class="market-options-grid">
          ${opts.map(o => `
            <button class="market-opt-btn" onclick="JuegosController.checkSupermarketTotal(${o}, ${c.total}, '${c.explicacion}', this)">
              $${o.toLocaleString('es-CL')} pesos
            </button>
          `).join('')}
        </div>

        <div id="marketFeedback" style="min-height: 36px; font-weight: 800; font-size: 1.1rem; margin-top: 0.5rem;"></div>
      </div>
    `;
  },

  checkSupermarketTotal(val, total, explicacion, btnEl) {
    const fb = document.getElementById('marketFeedback');
    if (val === total) {
      if (window.soundSys) window.soundSys.playSuccess();
      btnEl.style.background = '#10b981';
      btnEl.style.color = '#ffffff';
      btnEl.style.borderColor = '#059669';

      fb.innerHTML = `<span style="color: #10b981;">🎉 ¡Cobro correcto! ${explicacion}</span>`;

      const allBtns = btnEl.parentElement.querySelectorAll('button');
      allBtns.forEach(b => b.disabled = true);

      setTimeout(() => {
        this.marketRound++;
        this.renderSupermarketRound();
      }, 1300);
    } else {
      if (window.soundSys) window.soundSys.playError();
      btnEl.style.background = '#fee2e2';
      btnEl.style.borderColor = '#ef4444';
      fb.innerHTML = `<span style="color: #ef4444;">❌ Cobro equivocado. Vuelve a calcular ${explicacion.split('=')[0]}.</span>`;
    }
  },

  // ==============================================================
  // 9. EL SALTO DE LA RANITA (RECTA NUMÉRICA Y PATRONES SIMCE)
  // ==============================================================
  startRanita() {
    this.ranitaRound = 1;
    this.ranitaChallenges = [
      {
        historia: 'La ranita da saltos de 5 en 5. Si da 4 saltos empezando en el 0:',
        paso: 5,
        saltos: 4,
        meta: 20,
        pregunta: '¿A qué número llegará la ranita tras 4 saltos de 5?',
        opciones: [20, 25, 15, 18],
        explicacion: '4 saltos de 5 en 5 = 5 × 4 = 20.'
      },
      {
        historia: 'La ranita salta de 6 en 6. Si da 5 saltos desde el 0:',
        paso: 6,
        saltos: 5,
        meta: 30,
        pregunta: '¿En qué número aterrizará la ranita tras 5 saltos?',
        opciones: [30, 36, 24, 32],
        explicacion: '5 saltos de 6 en 6 = 6 × 5 = 30.'
      },
      {
        historia: 'La ranita salta de 7 en 7. Si da 4 saltos desde el 0:',
        paso: 7,
        saltos: 4,
        meta: 28,
        pregunta: '¿En qué nenúfar aterrizará la ranita tras 4 saltos?',
        opciones: [28, 35, 21, 30],
        explicacion: '4 saltos de 7 en 7 = 7 × 4 = 28.'
      },
      {
        historia: 'La ranita salta de 8 en 8 y quiere alcanzar el nenúfar número 48.',
        paso: 8,
        saltos: 6,
        meta: 48,
        pregunta: '¿Cuántos saltos de 8 debe dar para llegar al 48?',
        opciones: [6, 5, 7, 8],
        explicacion: '48 dividido en saltos de 8 = 6 saltos (8 × 6 = 48).'
      }
    ];

    this.renderRanitaRound();
  },

  renderRanitaRound() {
    const body = document.getElementById('gameModalBody');
    if (!body) return;

    if (this.ranitaRound > this.ranitaChallenges.length) {
      AppState.addReward(35, 1);
      AppState.triggerConfetti();
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem;">🐸🌟</div>
          <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">¡Campeón de la Recta Numérica!</h2>
          <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 1.5rem;">
            Entendiste perfectamente cómo la multiplicación representa saltos iguales y patrones en la recta numérica del SIMCE.
          </p>
          <button class="btn btn-primary" onclick="JuegosController.startRanita()">Saltar de Nuevo 🔄</button>
        </div>
      `;
      return;
    }

    const ch = this.ranitaChallenges[this.ranitaRound - 1];
    const opts = [...ch.opciones].sort(() => Math.random() - 0.5);

    // Generar nenúfares en la recta numérica
    let padsHtml = '';
    for (let s = 0; s <= ch.saltos; s++) {
      const val = s * ch.paso;
      const isLast = s === ch.saltos;
      padsHtml += `
        <div class="lily-pad-node ${isLast ? 'target-goal' : ''}">
          ${val}
        </div>
      `;
    }

    body.innerHTML = `
      <div class="frog-pond-container">
        <div class="frog-mission-header">
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--primary);">Desafío ${this.ranitaRound} de ${this.ranitaChallenges.length}</div>
          <div class="frog-story-txt">🐸 ${ch.historia}</div>
          <div style="font-size: 1.25rem; font-weight: 900; color: #1e1b4b; margin-top: 0.25rem;">${ch.pregunta}</div>
        </div>

        <div style="text-align: center; margin-bottom: 0.5rem;">
          <span class="frog-sprite">🐸</span>
        </div>

        <div class="frog-track-area">
          <div class="frog-number-line">
            ${padsHtml}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 480px; margin: 0 auto;">
          ${opts.map(o => `
            <button class="btn btn-outline" style="font-size: 1.35rem; padding: 0.9rem;" onclick="JuegosController.checkRanitaJump(${o}, ${ch.meta === 48 && ch.pregunta.includes('Cuántos') ? ch.saltos : ch.meta}, '${ch.explicacion}', this)">
              ${ch.pregunta.includes('Cuántos') ? `${o} saltos` : o}
            </button>
          `).join('')}
        </div>

        <div id="ranitaFeedback" style="min-height: 36px; font-weight: 800; font-size: 1.1rem; margin-top: 1rem;"></div>
      </div>
    `;
  },

  checkRanitaJump(val, target, explicacion, btnEl) {
    const fb = document.getElementById('ranitaFeedback');
    if (val === target) {
      if (window.soundSys) window.soundSys.playSuccess();
      btnEl.style.background = '#10b981';
      btnEl.style.color = '#ffffff';
      btnEl.style.borderColor = '#059669';

      fb.innerHTML = `<span style="color: #065f46;">🎉 ¡Salto perfecto! ${explicacion}</span>`;

      const allBtns = btnEl.parentElement.querySelectorAll('button');
      allBtns.forEach(b => b.disabled = true);

      setTimeout(() => {
        this.ranitaRound++;
        this.renderRanitaRound();
      }, 1400);
    } else {
      if (window.soundSys) window.soundSys.playError();
      btnEl.style.background = '#fee2e2';
      btnEl.style.borderColor = '#ef4444';
      fb.innerHTML = `<span style="color: #ef4444;">💦 ¡Ups! La ranita cayó al agua. Calcula nuevamente los saltos.</span>`;
    }
  }
};
