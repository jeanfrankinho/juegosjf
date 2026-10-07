/**
 * simce.js - Módulo de Ensayo Matemático tipo SIMCE para 4° Básico
 * Contextos reales: compras, organización en cuadrícula, útiles escolares, puntajes, vida cotidiana
 */

const SimceController = {
  currentIndex: 0,
  userAnswers: {}, // { 0: 'A', 1: 'C', ... }
  isCompleted: false,

  // 10 preguntas contextualizadas alineadas al currículum chileno de 4° básico
  questions: [
    {
      id: 1,
      contextoTag: 'Compras y Precios',
      icono: '🛒',
      enunciado: 'En la librería del colegio, Tomás compró 6 cuadernos para el nuevo semestre. Si cada cuaderno costó $800 pesos, ¿cuánto dinero pagó Tomás en total?',
      ilustracion: '6 cuadernos a $800 pesos cada uno.',
      opciones: [
        { letra: 'A', texto: '$4.200 pesos' },
        { letra: 'B', texto: '$4.800 pesos' },
        { letra: 'C', texto: '$5.400 pesos' },
        { letra: 'D', texto: '$4.600 pesos' }
      ],
      correcta: 'B',
      explicacion: 'Para calcular el total se multiplica la cantidad de cuadernos por su valor unitario: 6 × $800 = $4.800 (o 6 × 8 = 48, agregando los dos ceros).'
    },
    {
      id: 2,
      contextoTag: 'Organización de Grupos',
      icono: '🪑',
      enunciado: 'Para el acto escolar de 4° básico, el profesor de educación física ordenó las sillas en 7 filas iguales. Si en cada fila colocó 8 sillas, ¿cuántas sillas hay en total para el público?',
      ilustracion: '7 filas con 8 sillas cada una.',
      opciones: [
        { letra: 'A', texto: '54 sillas' },
        { letra: 'B', texto: '58 sillas' },
        { letra: 'C', texto: '56 sillas' },
        { letra: 'D', texto: '62 sillas' }
      ],
      correcta: 'C',
      explicacion: 'Organizar en filas y columnas forma un arreglo rectangular: 7 filas × 8 sillas = 56 sillas en total.'
    },
    {
      id: 3,
      contextoTag: 'Cantidad de Objetos',
      icono: '✏️',
      enunciado: 'La profesora de artes recibió una caja grande con 9 paquetes de lápices de cera. Si cada paquete contiene 6 lápices de diferentes colores, ¿cuántos lápices tiene en total para repartir?',
      ilustracion: '9 paquetes con 6 lápices cada uno.',
      opciones: [
        { letra: 'A', texto: '54 lápices' },
        { letra: 'B', texto: '48 lápices' },
        { letra: 'C', texto: '63 lápices' },
        { letra: 'D', texto: '56 lápices' }
      ],
      correcta: 'A',
      explicacion: 'Multiplicamos los 9 paquetes por los 6 lápices de cada uno: 9 × 6 = 54 lápices de cera.'
    },
    {
      id: 4,
      contextoTag: 'Juegos y Puntajes',
      icono: '🎲',
      enunciado: 'En una competencia de matemática, Sofía acertó 8 desafíos de nivel estrella. Si cada desafío otorgaba 9 puntos de bonificación, ¿cuántos puntos sumó Sofía?',
      ilustracion: '8 desafíos de 9 puntos cada uno.',
      opciones: [
        { letra: 'A', texto: '64 puntos' },
        { letra: 'B', texto: '72 puntos' },
        { letra: 'C', texto: '81 puntos' },
        { letra: 'D', texto: '70 puntos' }
      ],
      correcta: 'B',
      explicacion: 'Al sumar 9 puntos repetidos 8 veces calculamos: 8 × 9 = 72 puntos acumulados.'
    },
    {
      id: 5,
      contextoTag: 'Situaciones Escolares',
      icono: '📚',
      enunciado: 'En la biblioteca escolar, un estante nuevo cuenta con 5 repisas. Si el bibliotecario coloca exactamente 8 libros de cuentos en cada repisa, ¿cuántos libros caben en el estante?',
      ilustracion: '5 repisas con 8 libros de cuentos cada una.',
      opciones: [
        { letra: 'A', texto: '35 libros' },
        { letra: 'B', texto: '45 libros' },
        { letra: 'C', texto: '40 libros' },
        { letra: 'D', texto: '48 libros' }
      ],
      correcta: 'C',
      explicacion: 'Multiplicamos 5 repisas por 8 libros: 5 × 8 = 40 libros en el estante.'
    },
    {
      id: 6,
      contextoTag: 'Vida Cotidiana',
      icono: '💰',
      enunciado: 'Matías decide ahorrar $500 pesos en su alcancía todos los días durante 7 días seguidos (una semana completa). ¿Cuánto dinero logró juntar al finalizar la semana?',
      ilustracion: '7 días ahorrando $500 diarios.',
      opciones: [
        { letra: 'A', texto: '$3.500 pesos' },
        { letra: 'B', texto: '$3.000 pesos' },
        { letra: 'C', texto: '$4.000 pesos' },
        { letra: 'D', texto: '$3.700 pesos' }
      ],
      correcta: 'A',
      explicacion: 'Ahorro diario repetido 7 días: 7 × $500 = $3.500 pesos.'
    },
    {
      id: 7,
      contextoTag: 'Distribución de Materiales',
      icono: '📦',
      enunciado: 'Para una feria científica escolar, se armaron 6 mesas de trabajo. Si a cada mesa se le entregaron 4 lupas y 4 cuadernos de campo (un pack de 8 materiales por mesa), ¿cuántos materiales se entregaron en las 6 mesas?',
      ilustracion: '6 mesas con 8 materiales cada una.',
      opciones: [
        { letra: 'A', texto: '42 materiales' },
        { letra: 'B', texto: '46 materiales' },
        { letra: 'C', texto: '48 materiales' },
        { letra: 'D', texto: '52 materiales' }
      ],
      correcta: 'C',
      explicacion: 'Son 6 mesas y cada una tiene 8 materiales: 6 × 8 = 48 materiales en total.'
    },
    {
      id: 8,
      contextoTag: 'Alimentación y Cocina',
      icono: '🥐',
      enunciado: 'En el taller de repostería del colegio hornearon galletas saludables. Las colocaron en 4 bandejas metálicas y en cada bandeja entraron 9 galletas bien separadas. ¿Cuántas galletas hornearon en total?',
      ilustracion: '4 bandejas con 9 galletas en cada una.',
      opciones: [
        { letra: 'A', texto: '32 galletas' },
        { letra: 'B', texto: '36 galletas' },
        { letra: 'C', texto: '40 galletas' },
        { letra: 'D', texto: '38 galletas' }
      ],
      correcta: 'B',
      explicacion: '4 bandejas con 9 galletas cada una corresponde a 4 × 9 = 36 galletas.'
    },
    {
      id: 9,
      contextoTag: 'Paseo Escolar y Transporte',
      icono: '🚌',
      enunciado: 'Para el paseo a la granja educativa salieron 3 buses escolares. Si en cada bus viajaron 10 estudiantes con sus mochilas, ¿cuántos estudiantes fueron en los 3 buses?',
      ilustracion: '3 buses escolares con 10 estudiantes en cada uno.',
      opciones: [
        { letra: 'A', texto: '28 estudiantes' },
        { letra: 'B', texto: '33 estudiantes' },
        { letra: 'C', texto: '30 estudiantes' },
        { letra: 'D', texto: '40 estudiantes' }
      ],
      correcta: 'C',
      explicacion: 'Usando la propiedad de la tabla del 10: 3 × 10 = 30 estudiantes.'
    },
    {
      id: 10,
      contextoTag: 'Huerto Escolar',
      icono: '🌱',
      enunciado: 'En el huerto escolar de 4° básico sembraron lechugas en 9 surcos paralelos. En cada surco plantaron exactamente 7 lechugas. ¿Cuántas lechugas sembraron en todo el huerto?',
      ilustracion: '9 surcos con 7 lechugas cada uno.',
      opciones: [
        { letra: 'A', texto: '56 lechugas' },
        { letra: 'B', texto: '63 lechugas' },
        { letra: 'C', texto: '70 lechugas' },
        { letra: 'D', texto: '61 lechugas' }
      ],
      correcta: 'B',
      explicacion: 'Multiplicamos los 9 surcos por 7 plantas en cada surco: 9 × 7 = 63 lechugas.'
    }
  ],

  init() {
    this.currentIndex = 0;
    this.userAnswers = {};
    this.isCompleted = false;
    this.renderSidebar();
    this.renderCurrentQuestion();
  },

  renderSidebar() {
    const grid = document.getElementById('simceNavGrid');
    if (!grid) return;

    grid.innerHTML = this.questions.map((q, idx) => {
      const isAnswered = this.userAnswers[idx] !== undefined;
      const isActive = idx === this.currentIndex;
      let cls = 'question-nav-btn';
      if (isActive) cls += ' active';
      if (isAnswered) cls += ' answered';

      return `
        <button class="${cls}" onclick="SimceController.goToQuestion(${idx})">
          <span style="font-size: 0.8rem; opacity: 0.8;">Pregunta</span>
          <span style="font-size: 1.2rem; font-weight: 900;">${idx + 1}</span>
          <span class="q-status-dot"></span>
        </button>
      `;
    }).join('');

    const answeredCount = Object.keys(this.userAnswers).length;
    const counterEl = document.getElementById('simceProgressTxt');
    if (counterEl) {
      counterEl.textContent = `Respondidas: ${answeredCount} de ${this.questions.length}`;
    }
  },

  goToQuestion(idx) {
    if (window.soundSys) window.soundSys.playClick();
    this.currentIndex = idx;
    this.renderSidebar();
    this.renderCurrentQuestion();
  },

  renderCurrentQuestion() {
    const mainBox = document.getElementById('simceMainArea');
    if (!mainBox) return;

    const q = this.questions[this.currentIndex];
    const currentAnswer = this.userAnswers[this.currentIndex];

    mainBox.innerHTML = `
      <div class="simce-main-content">
        <div>
          <div class="question-header-badge">
            <span class="q-badge">Pregunta ${this.currentIndex + 1} de ${this.questions.length}</span>
            <span class="q-context-tag">${q.contextoTag}</span>
          </div>

          <div class="question-body">
            <div class="question-context">${q.enunciado}</div>

            <div class="question-illustration-card">
              <span class="q-illustration-icon">${q.icono}</span>
              <div class="q-illustration-desc">
                <strong>Situación ilustrada:</strong> ${q.ilustracion}
              </div>
            </div>

            <div class="alternatives-grid">
              ${q.opciones.map(opt => `
                <div class="alternative-card ${currentAnswer === opt.letra ? 'selected' : ''}" 
                     onclick="SimceController.selectAnswer('${opt.letra}')">
                  <div class="alt-letter">${opt.letra}</div>
                  <div class="alt-text">${opt.texto}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="simce-nav-footer">
          <button class="btn btn-outline" 
                  ${this.currentIndex === 0 ? 'disabled style="opacity: 0.4;"' : ''} 
                  onclick="SimceController.prevQuestion()">
            ⬅️ Anterior
          </button>

          <div>
            ${this.currentIndex < this.questions.length - 1 ? `
              <button class="btn btn-primary" onclick="SimceController.nextQuestion()">
                Siguiente ➡️
              </button>
            ` : `
              <button class="btn btn-success" onclick="SimceController.submitExam()">
                🏁 Finalizar Ensayo SIMCE
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  selectAnswer(letra) {
    if (window.soundSys) window.soundSys.playClick();
    this.userAnswers[this.currentIndex] = letra;
    this.renderSidebar();
    this.renderCurrentQuestion();
  },

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.goToQuestion(this.currentIndex - 1);
    }
  },

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.goToQuestion(this.currentIndex + 1);
    }
  },

  submitExam() {
    const answeredCount = Object.keys(this.userAnswers).length;
    const totalCount = this.questions.length;

    if (answeredCount < totalCount) {
      const pending = totalCount - answeredCount;
      const confirmEnd = confirm(`Aún tienes ${pending} ${pending === 1 ? 'pregunta sin responder' : 'preguntas sin responder'}. ¿Deseas finalizar el ensayo de todas formas?`);
      if (!confirmEnd) return;
    }

    this.calculateAndShowResults();
  },

  calculateAndShowResults() {
    let correctCount = 0;
    this.questions.forEach((q, idx) => {
      if (this.userAnswers[idx] === q.correcta) {
        correctCount++;
      }
    });

    const pct = Math.round((correctCount / this.questions.length) * 100);
    let nivel = 'Insuficiente';
    let nivelCls = 'level-insuficiente';
    let mensaje = 'Sigue practicando las tablas con los juegos para reforzar tu cálculo mental.';

    if (correctCount >= 8) {
      nivel = 'Nivel Adecuado';
      nivelCls = 'level-adecuado';
      mensaje = '¡Excelente desempeño! Demuestras un gran dominio de la multiplicación en situaciones cotidianas.';
      AppState.unlockAchievement('simce_aprobado', 'Genio SIMCE 4° Básico');
      if (window.soundSys) window.soundSys.playLevelUp();
      AppState.triggerConfetti();
    } else if (correctCount >= 5) {
      nivel = 'Nivel Elemental';
      nivelCls = 'level-elemental';
      mensaje = '¡Buen trabajo! Resuelves muchos problemas, pero aún puedes afianzar algunas tablas clave.';
      if (window.soundSys) window.soundSys.playSuccess();
    } else {
      if (window.soundSys) window.soundSys.playError();
    }

    // Sumar puntos al perfil
    AppState.addReward(correctCount * 10, correctCount >= 8 ? 3 : 1);

    const mainContainer = document.getElementById('simceContainerWrapper');
    if (!mainContainer) return;

    // Generar desglose pregunta por pregunta
    const reviewHtml = this.questions.map((q, idx) => {
      const studentAns = this.userAnswers[idx] || 'Sin responder';
      const isCorrect = studentAns === q.correcta;
      return `
        <div class="review-item-card ${isCorrect ? 'correct' : 'incorrect'}">
          <div class="review-item-header">
            <span>Pregunta ${idx + 1}: ${q.contextoTag}</span>
            <span style="color: ${isCorrect ? '#10b981' : '#ef4444'}; font-weight: 900;">
              ${isCorrect ? '✅ Correcta' : '❌ Incorrecta'}
            </span>
          </div>
          <p style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">${q.enunciado}</p>
          <div style="font-size: 0.9rem; margin-bottom: 0.5rem;">
            <span>Tu respuesta: <strong>Opción ${studentAns}</strong> | </span>
            <span>Respuesta correcta: <strong>Opción ${q.correcta}</strong></span>
          </div>
          <div class="review-explanation">
            <strong>Explicación didáctica:</strong> ${q.explicacion}
          </div>
        </div>
      `;
    }).join('');

    mainContainer.innerHTML = `
      <div class="simce-results-view">
        <div class="results-header-card">
          <h2>📊 Resultado del Ensayo SIMCE</h2>
          <p style="font-size: 1.1rem; opacity: 0.95;">Evaluación de Multiplicación y Resolución de Problemas - 4° Básico</p>
          <div class="achievement-level-pill ${nivelCls}">${nivel}</div>
        </div>

        <div class="results-stats-row">
          <div class="result-stat-box">
            <div class="result-stat-val">${correctCount} / 10</div>
            <div class="result-stat-lbl">Preguntas Correctas</div>
          </div>
          <div class="result-stat-box">
            <div class="result-stat-val">${pct}%</div>
            <div class="result-stat-lbl">Porcentaje de Logro</div>
          </div>
          <div class="result-stat-box">
            <div class="result-stat-val">+${correctCount * 10}</div>
            <div class="result-stat-lbl">Puntos Ganados ⭐</div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 2rem;">
          <h4 style="font-weight: 900; color: var(--primary-dark); margin-bottom: 0.35rem;">💬 Retroalimentación Pedagógica:</h4>
          <p style="color: var(--text-dark); font-size: 1rem; font-weight: 600;">${mensaje}</p>
        </div>

        <h3 style="font-size: 1.4rem; font-weight: 900; margin-bottom: 1rem; color: var(--text-dark);">
          🔍 Revisión Detallada de Respuestas:
        </h3>

        <div class="answers-review-list">
          ${reviewHtml}
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
          <button class="btn btn-primary btn-lg" onclick="SimceController.restartExam()">
            🔄 Realizar el Ensayo Nuevamente
          </button>
          <button class="btn btn-outline btn-lg" onclick="SimceController.returnToMenu()">
            🏠 Volver al Menú Principal
          </button>
        </div>
      </div>
    `;
  },

  restartExam() {
    this.restoreExamLayout();
    this.init();
  },

  returnToMenu() {
    // Activar pestaña de tablas en el menú
    const tabTables = document.querySelector('.tab-btn[data-tab="tabAprender"]');
    if (tabTables) tabTables.click();
  },

  restoreExamLayout() {
    const mainContainer = document.getElementById('simceContainerWrapper');
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <div class="simce-container">
        <!-- Panel lateral con las 10 preguntas -->
        <aside class="simce-sidebar">
          <div>
            <div class="simce-sidebar-header">
              <h3>Preguntas SIMCE</h3>
              <p>Selecciona una pregunta para responderla:</p>
            </div>
            <div class="simce-questions-grid" id="simceNavGrid"></div>
          </div>
          <div class="simce-sidebar-footer">
            <div class="simce-progress-counter" id="simceProgressTxt">Respondidas: 0 de 10</div>
          </div>
        </aside>

        <!-- Área principal de la pregunta actual -->
        <main id="simceMainArea"></main>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SimceController.init();
});
