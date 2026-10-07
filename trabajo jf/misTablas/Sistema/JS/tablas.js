/**
 * tablas.js - Módulo de Aprendizaje Interactivo de las Tablas (2 al 10)
 * Visualización de patrones, grupos de objetos, explicaciones y desafíos
 */

const TablasController = {
  currentTable: 2,
  currentStep: 1,
  practiceScore: 0,
  practiceQuestionIndex: 0,
  practiceQuestions: [],

  // Patrones didácticos y secretos matemáticos para 4° básico
  patrones: {
    2: {
      titulo: '¡El Doble Mágico y Números Pares!',
      secreto: 'Todos los resultados de la tabla del 2 terminan en 0, 2, 4, 6 u 8. Multiplicar por 2 es sumar el mismo número dos veces.',
      icono: '✌️',
      objeto: '🍎'
    },
    3: {
      titulo: '¡Saltos de 3 en 3 y Suma de Cifras!',
      secreto: 'Si sumas los dígitos del resultado, siempre obtendrás 3, 6 o 9 (por ejemplo en 3 × 4 = 12: 1 + 2 = 3). ¡Comprueba el truco!',
      icono: '☘️',
      objeto: '⭐'
    },
    4: {
      titulo: '¡El Doble del Doble!',
      secreto: 'Para multiplicar por 4, saca el doble dos veces. Por ejemplo: 4 × 5 -> el doble de 5 es 10, y el doble de 10 es 20.',
      icono: '🍀',
      objeto: '🚀'
    },
    5: {
      titulo: '¡La Regla del 0 y el 5!',
      secreto: '¡Fácil como mirar el reloj! Todos los resultados terminan en 0 o en 5. Si multiplicas por un número par termina en 0; si es impar termina en 5.',
      icono: '🖐️',
      objeto: '🍪'
    },
    6: {
      titulo: '¡El Doble de la Tabla del 3!',
      secreto: 'La tabla del 6 es el doble de la del 3. Además, si multiplicas 6 por un número par, ¡el resultado termina en ese mismo número! (6 × 4 = 24, 6 × 8 = 48).',
      icono: '🎲',
      objeto: '✏️'
    },
    7: {
      titulo: '¡Los Días de la Semana!',
      secreto: 'Piensa en las semanas del calendario: 1 semana son 7 días, 2 semanas son 14 días, 3 semanas son 21 días. ¡Avanza sumando 7 cada vez!',
      icono: '🗓️',
      objeto: '⚽'
    },
    8: {
      titulo: '¡El Doble del Doble del Doble!',
      secreto: 'Multiplicar por 8 es duplicar tres veces. Por ejemplo, 8 × 3: doble de 3 es 6, doble de 6 es 12, doble de 12 es 24.',
      icono: '🐙',
      objeto: '🎈'
    },
    9: {
      titulo: '¡La Fascinante Suma del 9 y Truco de Dedos!',
      secreto: '¡Increíble truco matemático! Los dos dígitos de cada resultado siempre suman 9 (18 -> 1+8=9, 27 -> 2+7=9, 36 -> 3+6=9, 81 -> 8+1=9).',
      icono: '🪄',
      objeto: '🐱'
    },
    10: {
      titulo: '¡El Poder del Cero Agregado!',
      secreto: '¡El truco más veloz del mundo! Para multiplicar cualquier número por 10, simplemente escribe el número y agrégale un 0 a la derecha.',
      icono: '🔟',
      objeto: '💎'
    }
  },

  // Inicializar grilla de tarjetas de tablas en la pantalla principal
  initGrid() {
    const grid = document.getElementById('tablesGridContainer');
    if (!grid) return;

    grid.innerHTML = '';
    for (let t = 2; t <= 10; t++) {
      const p = this.patrones[t];
      const data = (AppState.student.tablasProgreso && AppState.student.tablasProgreso[t]) || { progreso: 0, estrellas: 0 };
      
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += s <= data.estrellas ? '⭐' : '☆';
      }

      const card = document.createElement('div');
      card.className = 'table-card';
      const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#3b82f6', '#14b8a6'];
      const bgCol = colors[(t - 2) % colors.length];

      card.innerHTML = `
        <div class="table-num-badge" style="background: ${bgCol};">
          ${t}
        </div>
        <div class="table-title">Tabla del ${t}</div>
        <div class="table-pattern-hint">${p.titulo}</div>
        <div class="table-stars">${starsHtml}</div>
        <div class="table-progress-bar">
          <div class="table-progress-fill" style="width: ${data.progreso}%;"></div>
        </div>
        <button class="btn btn-primary btn-sm btn-block" onclick="TablasController.openTableModal(${t})">
          Explorar &amp; Practicar 🚀
        </button>
      `;
      grid.appendChild(card);
    }
  },

  // Abrir modal de aprendizaje interactivo
  openTableModal(tableNum) {
    this.currentTable = tableNum;
    this.currentStep = 1;
    if (window.soundSys) window.soundSys.playClick();

    const modal = document.getElementById('tableModalOverlay');
    const title = document.getElementById('tableModalTitle');
    if (title) title.textContent = `Aventura con la Tabla del ${tableNum}`;

    this.renderPatternView();
    if (modal) modal.classList.add('active');
  },

  closeTableModal() {
    const modal = document.getElementById('tableModalOverlay');
    if (modal) modal.classList.remove('active');
  },

  // Renderizar la vista conceptual (grupos de objetos y patrones)
  renderPatternView() {
    const p = this.patrones[this.currentTable];
    const body = document.getElementById('tableModalBody');
    if (!body) return;

    // Selector numérico del 1 al 10
    let pillsHtml = '';
    for (let i = 1; i <= 10; i++) {
      const activeClass = i === this.currentStep ? 'active' : '';
      pillsHtml += `
        <button class="op-pill-btn ${activeClass}" onclick="TablasController.selectStep(${i})">
          ${this.currentTable} × ${i}
        </button>
      `;
    }

    // Generar grupos visuales de objetos
    const groupsCount = this.currentStep;
    const itemsPerGroup = this.currentTable;
    const totalResult = groupsCount * itemsPerGroup;

    let groupsHtml = '';
    for (let g = 1; g <= groupsCount; g++) {
      let itemsStr = '';
      for (let k = 1; k <= itemsPerGroup; k++) {
        itemsStr += `<span>${p.objeto}</span>`;
      }
      groupsHtml += `
        <div class="visual-group-box">
          <div class="visual-group-items">${itemsStr}</div>
          <div class="visual-group-label">Grupo ${g} (${itemsPerGroup})</div>
        </div>
      `;
    }

    body.innerHTML = `
      <div class="table-learn-container">
        <!-- Pestaña de navegación interna -->
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="TablasController.renderPatternView()">
            👀 Ver Grupos &amp; Patrones
          </button>
          <button class="btn btn-secondary btn-sm" onclick="TablasController.startPractice()">
            🎯 ¡Poner a Prueba mis Poderes!
          </button>
        </div>

        <!-- Caja de Patrón Didáctico -->
        <div class="pattern-box">
          <div class="pattern-icon">${p.icono}</div>
          <div class="pattern-text">
            <h4>${p.titulo}</h4>
            <p>${p.secreto}</p>
          </div>
        </div>

        <!-- Botones selectores de multiplicación -->
        <div class="operation-nav-pills">
          ${pillsHtml}
        </div>

        <!-- Visualizador interactivo de Grupos -->
        <div class="matrix-visualizer-card">
          <div class="matrix-title">
            ${this.currentTable} × ${this.currentStep} = <span style="color: #ec4899;">${totalResult}</span>
          </div>
          <div class="matrix-explanation">
            Significa <strong>${this.currentStep} ${this.currentStep === 1 ? 'grupo' : 'grupos'}</strong> con <strong>${this.currentTable} objetos</strong> cada uno:
            <br>
            <span style="font-size: 0.9rem; color: #64748b;">
              ${Array(this.currentStep).fill(this.currentTable).join(' + ')} = ${totalResult}
            </span>
          </div>

          <div class="visual-groups-wrap">
            ${groupsHtml}
          </div>
        </div>
      </div>
    `;
  },

  selectStep(step) {
    if (window.soundSys) window.soundSys.playClick();
    this.currentStep = step;
    this.renderPatternView();
  },

  // ==============================================================
  // MÓDULO DE PRÁCTICA DINÁMICA DE LA TABLA
  // ==============================================================
  startPractice() {
    if (window.soundSys) window.soundSys.playClick();
    this.practiceScore = 0;
    this.practiceQuestionIndex = 0;
    this.generatePracticeQuestions();
    this.renderPracticeQuestion();
  },

  generatePracticeQuestions() {
    this.practiceQuestions = [];
    const t = this.currentTable;
    // Generar 5 desafíos variados (multiplicación directa, factor incógnita, problema contextual)
    const steps = [2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5).slice(0, 5);

    steps.forEach((mult, idx) => {
      const correct = t * mult;
      let wrongAnswers = [
        correct + t,
        correct - t > 0 ? correct - t : correct + 2 * t,
        correct + Math.floor(Math.random() * 5) + 1
      ].filter(x => x !== correct);

      // Desafíos variados:
      if (idx % 2 === 0) {
        // Encontrar resultado
        this.practiceQuestions.push({
          type: 'result',
          title: `¿Cuánto es ${t} × ${mult}?`,
          hint: `Suma ${t} un total de ${mult} veces, o usa el patrón de la tabla del ${t}.`,
          correct: correct,
          options: [correct, ...wrongAnswers].sort(() => Math.random() - 0.5)
        });
      } else {
        // Factor faltante
        this.practiceQuestions.push({
          type: 'missing',
          title: `Completa: ${t} × [ ? ] = ${correct}`,
          hint: `¿Por qué número debes multiplicar ${t} para obtener ${correct}?`,
          correct: mult,
          options: [mult, mult + 1, mult > 1 ? mult - 1 : mult + 2, mult + 2].sort(() => Math.random() - 0.5)
        });
      }
    });
  },

  renderPracticeQuestion() {
    const body = document.getElementById('tableModalBody');
    if (!body) return;

    if (this.practiceQuestionIndex >= this.practiceQuestions.length) {
      this.finishPractice();
      return;
    }

    const q = this.practiceQuestions[this.practiceQuestionIndex];
    const totalQ = this.practiceQuestions.length;
    const currentNum = this.practiceQuestionIndex + 1;

    body.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span style="font-weight: 800; color: var(--primary-dark);">Desafío ${currentNum} de ${totalQ}</span>
          <span style="font-weight: 800; color: var(--accent);">Puntaje: ${this.practiceScore} ⭐</span>
        </div>

        <div style="background: #f1f5f9; height: 10px; border-radius: 5px; margin-bottom: 2rem; overflow: hidden;">
          <div style="background: var(--primary); height: 100%; width: ${(currentNum / totalQ) * 100}%;"></div>
        </div>

        <div style="background: #ffffff; border: 3px solid var(--primary-light); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.8rem; font-weight: 900; margin-bottom: 1.5rem; color: var(--text-dark);">${q.title}</h3>
          
          <div id="practiceFeedbackBox" style="min-height: 48px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.05rem;">
            <span style="color: var(--text-muted);">Selecciona la alternativa correcta:</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            ${q.options.map(opt => `
              <button class="btn btn-outline" style="font-size: 1.4rem; padding: 1rem;" onclick="TablasController.checkPracticeAnswer(${opt}, this)">
                ${opt}
              </button>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-sm btn-outline" onclick="TablasController.renderPatternView()">
          ⬅️ Volver a ver patrones y grupos
        </button>
      </div>
    `;
  },

  checkPracticeAnswer(selected, btnEl) {
    const q = this.practiceQuestions[this.practiceQuestionIndex];
    const feedbackBox = document.getElementById('practiceFeedbackBox');

    if (selected === q.correct) {
      if (window.soundSys) window.soundSys.playSuccess();
      this.practiceScore += 10;
      AppState.addReward(10, 0);

      btnEl.style.background = '#10b981';
      btnEl.style.color = '#ffffff';
      btnEl.style.borderColor = '#059669';

      feedbackBox.innerHTML = `
        <span style="color: #10b981; animation: popIn 0.3s ease;">
          🎉 ¡Excelente! ¡Respuesta correcta!
        </span>
      `;

      // Deshabilitar todos los botones para evitar doble clic
      const allBtns = btnEl.parentElement.querySelectorAll('button');
      allBtns.forEach(b => b.disabled = true);

      setTimeout(() => {
        this.practiceQuestionIndex++;
        this.renderPracticeQuestion();
      }, 1200);

    } else {
      if (window.soundSys) window.soundSys.playError();
      btnEl.style.background = '#fee2e2';
      btnEl.style.borderColor = '#ef4444';
      btnEl.style.color = '#dc2626';

      feedbackBox.innerHTML = `
        <span style="color: #ef4444;">
          💡 <strong>Pista didáctica:</strong> ${q.hint} ¡Intenta con otra opción!
        </span>
      `;
    }
  },

  finishPractice() {
    if (window.soundSys) window.soundSys.playLevelUp();
    AppState.triggerConfetti();

    // Actualizar progreso de la tabla
    const currentTableData = AppState.student.tablasProgreso[this.currentTable] || { progreso: 0, estrellas: 0 };
    currentTableData.progreso = 100;
    currentTableData.estrellas = 3;
    currentTableData.completada = true;
    AppState.student.tablasProgreso[this.currentTable] = currentTableData;

    // Desbloquear logro de primera tabla o maestro del 2
    AppState.unlockAchievement('primera_tabla', '¡Primer Paso!');
    if (this.currentTable === 2) {
      AppState.unlockAchievement('maestro_2', 'Doble Poder');
    }

    AppState.save();
    AppState.renderProgressTab();
    this.initGrid();

    const body = document.getElementById('tableModalBody');
    if (!body) return;

    body.innerHTML = `
      <div style="max-width: 500px; margin: 0 auto; text-align: center; padding: 2rem 1rem;">
        <div style="font-size: 4rem; margin-bottom: 0.5rem;">🏆</div>
        <h2 style="font-size: 2rem; font-weight: 900; color: var(--primary-dark); margin-bottom: 0.5rem;">
          ¡Misión Cumplida!
        </h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Has practicado la <strong>Tabla del ${this.currentTable}</strong> con éxito y sumaste <strong>${this.practiceScore} puntos</strong> a tu aventura.
        </p>

        <div style="font-size: 2.2rem; margin-bottom: 1.5rem;">
          ⭐⭐⭐
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="TablasController.closeTableModal()">
            🏠 Continuar en el Menú
          </button>
          <button class="btn btn-secondary" onclick="TablasController.startPractice()">
            🔄 Repetir para Practicar Más
          </button>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  TablasController.initGrid();
});
