const API = 'http://localhost:3000';

let todasLasSalas = [];
let todosLosInternados = [];
let todosLosPokemones = [];
let vistaActiva = 'salas';

// ─── MAQUETA ─────────────────────────────────────────────────────────────────
const SALAS_MAQUETA = [
  {
    id: 1,
    nombre: 'Sala A - Criticos',
    tipo: 'Cuidados Intensivos',
    ocupada: true,
    centro: { nombre: 'Centro Pokemon Pueblo Paleta' },
    pacientes: [
      { id: 3, nombre: 'mewtwo', especie: 'Mewtwo', tipo: 'Psiquico', nivel: 100, estadoSalud: 'critico', shiny: true, efecto: 'confundido', entrenador: { nombre: 'Giovanni' } }
    ]
  },
  {
    id: 2,
    nombre: 'Sala B - Recuperacion',
    tipo: 'Recuperacion',
    ocupada: false,
    centro: { nombre: 'Centro Pokemon Pueblo Paleta' },
    pacientes: []
  },
  {
    id: 3,
    nombre: 'Sala C - Observacion',
    tipo: 'Observacion',
    ocupada: false,
    centro: { nombre: 'Centro Pokemon Pueblo Paleta' },
    pacientes: []
  }
];

const POKEMON_MAQUETA = [
  { id: 1, nombre: 'pikachu', especie: 'Pikachu', tipo: 'Electrico', nivel: 35, estadoSalud: 'sano', internado: false },
  { id: 2, nombre: 'charizard', especie: 'Charizard', tipo: 'Fuego', nivel: 62, estadoSalud: 'herido', internado: false },
  { id: 4, nombre: 'snorlax', especie: 'Snorlax', tipo: 'Normal', nivel: 50, estadoSalud: 'sano', internado: false }
];

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function cargarDatos() {
  try {
    const [resSalas, resPokemon] = await Promise.all([
      fetch(`${API}/salas`),
      fetch(`${API}/pokemon`)
    ]);
    if (!resSalas.ok || !resPokemon.ok) throw new Error();
    todasLasSalas = await resSalas.json();
    todosLosPokemones = await resPokemon.json();
    todosLosInternados = todosLosPokemones.filter(p => p.internado);
  } catch {
    todasLasSalas = SALAS_MAQUETA;
    todosLosPokemones = POKEMON_MAQUETA;
    todosLosInternados = SALAS_MAQUETA[0].pacientes;
    mostrarToast('Modo maqueta activo. Backend no disponible.', true);
  }
  actualizarStats();
  renderVista();
  poblarSelectores();
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function actualizarStats() {
  const total = todasLasSalas.length;
  const libres = todasLasSalas.filter(s => !s.ocupada).length;
  const internados = todasLasSalas.reduce((acc, s) => acc + (s.pacientes ? s.pacientes.length : 0), 0);

  document.getElementById('stat-salas-total').textContent = total;
  document.getElementById('stat-salas-libres').textContent = libres;
  document.getElementById('stat-internados').textContent = internados;
}

// ─── VISTAS ───────────────────────────────────────────────────────────────────
function cambiarVista(vista, btn) {
  vistaActiva = vista;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('vista-salas').style.display = vista === 'salas' ? 'block' : 'none';
  document.getElementById('vista-lista').style.display = vista === 'lista' ? 'block' : 'none';
  renderVista();
}

function renderVista() {
  if (vistaActiva === 'salas') renderSalas();
  else renderListaInternados();
}

// ─── RENDER SALAS ─────────────────────────────────────────────────────────────
function renderSalas() {
  const grid = document.getElementById('salas-grid');

  if (todasLasSalas.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="" />
        <p>No hay salas registradas en el sistema.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = todasLasSalas.map(sala => {
    const pacientes = sala.pacientes || [];
    const ocupada = pacientes.length > 0 || sala.ocupada;

    const pacientesHTML = pacientes.length > 0
      ? `<ul class="sala-pacientes">
          ${pacientes.map(p => {
            const pokeId = getPokeId(p.nombre);
            return `
              <li class="sala-paciente-item">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png"
                  alt="${p.nombre}"
                  onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'"
                />
                <div>
                  <div style="font-weight: 700; text-transform: capitalize;">${p.nombre}</div>
                  <div style="font-size: 0.75rem; color: var(--gris-texto);">Lv.${p.nivel} - ${getEfectoTexto(p.efecto)}</div>
                </div>
                <span class="estado-badge estado-critico" style="margin-left: auto; font-size: 0.65rem;">Critico</span>
              </li>
            `;
          }).join('')}
        </ul>`
      : `<p style="font-size: 0.82rem; color: var(--gris-texto); padding: 8px 0;">Sala disponible. Sin pacientes.</p>`;

    return `
      <div class="sala-card ${ocupada ? 'ocupada' : ''}">
        <div class="sala-header">
          <span class="sala-nombre">${sala.nombre}</span>
          <span class="sala-tipo">${sala.tipo}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <span class="estado-badge ${ocupada ? 'estado-critico' : 'estado-sano'}">
            ${ocupada ? 'Ocupada' : 'Libre'}
          </span>
          ${sala.centro ? `<span style="font-size: 0.75rem; color: var(--gris-texto); margin-left: 8px;">${sala.centro.nombre}</span>` : ''}
        </div>
        ${pacientesHTML}
        ${pacientes.length > 0 ? `
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            ${pacientes.map(p => `
              <button class="btn btn-sm btn-success" onclick="darDeAlta(${p.id}, '${p.nombre}', ${sala.id})">
                Alta: ${capitalize(p.nombre)}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ─── RENDER LISTA INTERNADOS ──────────────────────────────────────────────────
function renderListaInternados() {
  const wrapper = document.getElementById('tabla-internados');
  const lista = todasLasSalas.flatMap(s =>
    (s.pacientes || []).map(p => ({ ...p, salaNombre: s.nombre }))
  );

  if (lista.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-state">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="" />
        <p>No hay pokemones internados actualmente.</p>
      </div>
    `;
    return;
  }

  const filas = lista.map(p => {
    const pokeId = getPokeId(p.nombre);
    return `
      <tr>
        <td>
          <img
            class="pokemon-mini-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png"
            alt="${p.nombre}"
            onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'"
          />
        </td>
        <td><strong style="text-transform: capitalize;">${p.nombre}</strong></td>
        <td>${p.tipo || '-'}</td>
        <td><span style="font-family: 'Press Start 2P', monospace; font-size: 0.7rem;">Lv.${p.nivel}</span></td>
        <td><span class="estado-badge estado-critico">Critico</span></td>
        <td><span class="efecto-badge efecto-${p.efecto || 'ninguno'}">${capitalize(p.efecto || 'ninguno')}</span></td>
        <td>${p.salaNombre}</td>
        <td>${p.entrenador ? p.entrenador.nombre : '-'}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="darDeAlta(${p.id}, '${p.nombre}', null)">
            Dar de Alta
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarInternado(${p.id}, '${p.nombre}')">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  wrapper.innerHTML = `
    <table class="pokemon-table">
      <thead>
        <tr>
          <th></th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Nivel</th>
          <th>Estado</th>
          <th>Efecto</th>
          <th>Sala</th>
          <th>Entrenador</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// ─── DAR DE ALTA ─────────────────────────────────────────────────────────────
async function darDeAlta(id, nombre, salaId) {
  if (!confirm(`Dar de alta a ${capitalize(nombre)}? Sera marcado como sano y dejara la sala.`)) return;

  try {
    await fetch(`${API}/pokemon/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estadoSalud: 'sano', internado: false, efecto: 'ninguno' })
    });
    if (salaId) {
      await fetch(`${API}/salas/${salaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocupada: false })
      });
    }
  } catch {
    // Maqueta
  }

  // Actualizar localmente
  todasLasSalas = todasLasSalas.map(s => ({
    ...s,
    pacientes: (s.pacientes || []).filter(p => p.id !== id),
    ocupada: (s.pacientes || []).filter(p => p.id !== id).length > 0
  }));

  actualizarStats();
  renderVista();
  mostrarToast(`${capitalize(nombre)} fue dado de alta exitosamente.`);
}

// ─── ELIMINAR INTERNADO ───────────────────────────────────────────────────────
async function eliminarInternado(id, nombre) {
  if (!confirm(`Eliminar a ${capitalize(nombre)} del sistema? Esta accion no se puede deshacer.`)) return;

  try {
    await fetch(`${API}/pokemon/${id}`, { method: 'DELETE' });
  } catch {
    // Maqueta
  }

  todasLasSalas = todasLasSalas.map(s => ({
    ...s,
    pacientes: (s.pacientes || []).filter(p => p.id !== id)
  }));

  actualizarStats();
  renderVista();
  mostrarToast(`${capitalize(nombre)} eliminado del sistema.`);
}

// ─── MODAL INTERNAR ──────────────────────────────────────────────────────────
function abrirModalSala() {
  document.getElementById('modal-sala').classList.add('visible');
}

function cerrarModalSala() {
  document.getElementById('modal-sala').classList.remove('visible');
}

function poblarSelectores() {
  // Pokemon disponibles (no internados)
  const selPokemon = document.getElementById('sala-pokemon-select');
  const disponibles = todosLosPokemones.filter(p => !p.internado);
  selPokemon.innerHTML = '<option value="">Selecciona un pokemon...</option>';
  disponibles.forEach(p => {
    selPokemon.innerHTML += `<option value="${p.id}">${capitalize(p.nombre)} (Lv.${p.nivel})</option>`;
  });

  // Salas disponibles
  const selSala = document.getElementById('sala-destino-select');
  const salasLibres = todasLasSalas.filter(s => !s.ocupada);
  selSala.innerHTML = '<option value="">Selecciona una sala...</option>';
  salasLibres.forEach(s => {
    selSala.innerHTML += `<option value="${s.id}">${s.nombre} - ${s.tipo}</option>`;
  });
}

async function internarPokemon() {
  const pokemonId = parseInt(document.getElementById('sala-pokemon-select').value);
  const salaId = parseInt(document.getElementById('sala-destino-select').value);
  const motivo = document.getElementById('sala-motivo').value;

  if (!pokemonId) { mostrarToast('Selecciona un pokemon.', true); return; }
  if (!salaId) { mostrarToast('Selecciona una sala.', true); return; }

  try {
    await fetch(`${API}/pokemon/${pokemonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internado: true, estadoSalud: 'critico' })
    });
    await fetch(`${API}/salas/${salaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ocupada: true })
    });
  } catch {
    // Maqueta
  }

  // Actualizar localmente
  const pokemon = todosLosPokemones.find(p => p.id === pokemonId);
  if (pokemon) {
    pokemon.internado = true;
    pokemon.estadoSalud = 'critico';
    const sala = todasLasSalas.find(s => s.id === salaId);
    if (sala) {
      sala.ocupada = true;
      if (!sala.pacientes) sala.pacientes = [];
      sala.pacientes.push(pokemon);
    }
  }

  cerrarModalSala();
  actualizarStats();
  renderVista();
  poblarSelectores();
  mostrarToast(`Pokemon internado en sala correctamente.`);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getPokeId(nombre) {
  const mapa = {
    pikachu: 25, charizard: 6, mewtwo: 150, snorlax: 143,
    bulbasaur: 1, charmander: 4, squirtle: 7, gengar: 94,
    eevee: 133, gyarados: 130, lapras: 131, dragonite: 149,
    alakazam: 65, machamp: 68, golem: 76, arcanine: 59
  };
  return mapa[(nombre || '').toLowerCase()] || 132;
}

function getEfectoTexto(efecto) {
  return efecto && efecto !== 'ninguno' ? capitalize(efecto) : 'Sin efecto';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mostrarToast(msg, error = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast${error ? ' error' : ''}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── INICIAR ──────────────────────────────────────────────────────────────────
cargarDatos();