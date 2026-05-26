const API = 'http://localhost:3000';

let todosLosPokemones = [];
let filtroActivo = 'todos';

// ─── DATOS MAQUETA (para cuando el backend no esta levantado) ───────────────
const MAQUETA = [
  {
    id: 1,
    nombre: 'pikachu',
    especie: 'Pikachu',
    tipo: 'Electrico',
    nivel: 35,
    estadoSalud: 'sano',
    internado: false,
    shiny: false,
    efecto: 'ninguno',
    entrenador: { nombre: 'Ash' }
  },
  {
    id: 2,
    nombre: 'charizard',
    especie: 'Charizard',
    tipo: 'Fuego / Volador',
    nivel: 62,
    estadoSalud: 'herido',
    internado: false,
    shiny: false,
    efecto: 'quemado',
    entrenador: { nombre: 'Ash' }
  },
  {
    id: 3,
    nombre: 'mewtwo',
    especie: 'Mewtwo',
    tipo: 'Psiquico',
    nivel: 100,
    estadoSalud: 'critico',
    internado: true,
    shiny: true,
    efecto: 'confundido',
    entrenador: { nombre: 'Giovanni' }
  },
  {
    id: 4,
    nombre: 'snorlax',
    especie: 'Snorlax',
    tipo: 'Normal',
    nivel: 50,
    estadoSalud: 'sano',
    internado: false,
    shiny: false,
    efecto: 'dormido',
    entrenador: { nombre: 'Brock' }
  }
];

// ─── INIT ───────────────────────────────────────────────────────────────────
async function cargarPokemones() {
  try {
    const res = await fetch(`${API}/pokemon`);
    if (!res.ok) throw new Error();
    todosLosPokemones = await res.json();
  } catch {
    // Usar maqueta si el backend no responde
    todosLosPokemones = MAQUETA;
    mostrarToast('Modo maqueta activo. Backend no disponible.', true);
  }
  renderTabla();
}

// ─── FILTRO ─────────────────────────────────────────────────────────────────
function filtrarPor(filtro, btn) {
  filtroActivo = filtro;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTabla();
}

function renderTabla() {
  const busqueda = (document.getElementById('buscador').value || '').toLowerCase();

  let lista = todosLosPokemones.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda)
      || (p.especie && p.especie.toLowerCase().includes(busqueda));

    if (filtroActivo === 'todos') return matchBusqueda;
    if (filtroActivo === 'sano') return matchBusqueda && p.estadoSalud !== 'critico' && !p.internado;
    if (filtroActivo === 'critico') return matchBusqueda && p.estadoSalud === 'critico';
    if (filtroActivo === 'internado') return matchBusqueda && p.internado;
    return matchBusqueda;
  });

  const wrapper = document.getElementById('tabla-wrapper');

  if (lista.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-state">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="" />
        <p>No hay pokemones que coincidan con el filtro.</p>
      </div>
    `;
    return;
  }

  const filas = lista.map(p => {
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.shiny ? 'shiny/' : ''}${getPokeId(p.nombre)}.png`;
    const estadoBadge = getEstadoBadge(p.estadoSalud, p.internado);
    const efectoBadge = getEfectoBadge(p.efecto || 'ninguno');
    const shinyMarca = p.shiny
      ? '<span class="shiny-icon" title="Shiny"></span>'
      : '<span style="color: var(--gris-medio);">-</span>';
    const entrenadorNombre = p.entrenador ? p.entrenador.nombre : (p.entrenadorId || '-');

    // Botones segun estado
    let acciones = '';
    if (p.estadoSalud === 'critico' || p.internado) {
      acciones = `
        <button class="btn btn-sm btn-secondary" onclick="abrirEditar(${JSON.stringify(JSON.stringify(p))})">Editar</button>
        <a href="salas.html" class="btn btn-sm btn-blue">Ver Sala</a>
        <button class="btn btn-sm btn-danger" onclick="eliminarPokemon(${p.id}, '${p.nombre}')">Eliminar</button>
      `;
    } else {
      acciones = `
        <button class="btn btn-sm btn-success" onclick="iniciarCura(${p.id}, '${p.nombre}')">Curar</button>
        <button class="btn btn-sm btn-secondary" onclick="abrirEditar(${JSON.stringify(JSON.stringify(p))})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarPokemon(${p.id}, '${p.nombre}')">Eliminar</button>
      `;
    }

    return `
      <tr>
        <td>
          <img
            class="pokemon-mini-img"
            src="${spriteUrl}"
            alt="${p.nombre}"
            onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'"
          />
        </td>
        <td>
          <strong style="text-transform: capitalize;">${p.nombre}</strong>
          <br/><small style="color: var(--gris-texto);">${p.especie || ''}</small>
        </td>
        <td>${p.tipo || '-'}</td>
        <td>
          <span style="font-family: 'Press Start 2P', monospace; font-size: 0.7rem;">Lv.${p.nivel}</span>
        </td>
        <td>${estadoBadge}</td>
        <td>${efectoBadge}</td>
        <td>${shinyMarca}</td>
        <td>${entrenadorNombre}</td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${acciones}
          </div>
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
          <th>Shiny</th>
          <th>Entrenador</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// ─── CURAR POKEMON ──────────────────────────────────────────────────────────
function iniciarCura(id, nombre) {
  const overlay = document.getElementById('modal-curar');
  const barraFill = document.getElementById('barra-fill');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalTexto = document.getElementById('modal-texto');
  const modalBtn = document.getElementById('modal-btn-ok');
  const modalImg = document.getElementById('modal-pokemon-img');

  // Sprite del pokemon
  const pokeId = getPokeId(nombre);
  modalImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`;

  modalTitulo.textContent = `Curando a ${capitalize(nombre)}...`;
  modalTexto.textContent = 'La Enfermera Joy esta trabajando. Por favor espera.';
  modalBtn.style.display = 'none';
  barraFill.style.width = '0%';

  overlay.classList.add('visible');

  // Reproducir musica
  const audio = document.getElementById('audio-cura');
  if (audio) {
    audio.currentTime = 0;
    audio.volume = 0.6;
    audio.play().catch(() => {});
  }

  // Animar barra
  setTimeout(() => { barraFill.style.width = '100%'; }, 100);

  // Llamar API despues de 3s (duracion de la barra)
  setTimeout(async () => {
    try {
      const res = await fetch(`${API}/pokemon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoSalud: 'sano', efecto: 'ninguno' })
      });
      if (!res.ok) throw new Error();

      // Actualizar localmente
      const idx = todosLosPokemones.findIndex(p => p.id === id);
      if (idx !== -1) {
        todosLosPokemones[idx].estadoSalud = 'sano';
        todosLosPokemones[idx].efecto = 'ninguno';
      }
    } catch {
      // Maqueta: igual mostrar como curado
      const idx = todosLosPokemones.findIndex(p => p.id === id);
      if (idx !== -1) {
        todosLosPokemones[idx].estadoSalud = 'sano';
        todosLosPokemones[idx].efecto = 'ninguno';
      }
    }

    if (audio) audio.pause();
    modalTitulo.textContent = `${capitalize(nombre)} esta sano!`;
    modalTexto.textContent = 'Gracias por confiar en el Centro Pokemon.';
    modalBtn.style.display = 'block';
    renderTabla();
  }, 3200);
}

function cerrarModal() {
  document.getElementById('modal-curar').classList.remove('visible');
}

// ─── EDITAR POKEMON ─────────────────────────────────────────────────────────
function abrirEditar(jsonStr) {
  const p = JSON.parse(jsonStr);
  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-estado').value = p.estadoSalud;
  document.getElementById('edit-efecto').value = p.efecto || 'ninguno';
  document.getElementById('edit-nivel').value = p.nivel;
  document.getElementById('edit-nivel-valor').textContent = p.nivel;
  document.getElementById('modal-editar').classList.add('visible');
}

document.getElementById('edit-nivel').addEventListener('input', function() {
  document.getElementById('edit-nivel-valor').textContent = this.value;
});

function cerrarModalEditar() {
  document.getElementById('modal-editar').classList.remove('visible');
}

async function guardarEdicion() {
  const id = parseInt(document.getElementById('edit-id').value);
  const estadoSalud = document.getElementById('edit-estado').value;
  const efecto = document.getElementById('edit-efecto').value;
  const nivel = parseInt(document.getElementById('edit-nivel').value);

  try {
    const res = await fetch(`${API}/pokemon/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estadoSalud, efecto, nivel })
    });
    if (!res.ok) throw new Error();
  } catch {
    // Maqueta
  }

  const idx = todosLosPokemones.findIndex(p => p.id === id);
  if (idx !== -1) {
    todosLosPokemones[idx].estadoSalud = estadoSalud;
    todosLosPokemones[idx].efecto = efecto;
    todosLosPokemones[idx].nivel = nivel;
    todosLosPokemones[idx].internado = estadoSalud === 'critico';
  }

  cerrarModalEditar();
  renderTabla();
  mostrarToast('Pokemon actualizado correctamente.');
}

// ─── ELIMINAR POKEMON ────────────────────────────────────────────────────────
async function eliminarPokemon(id, nombre) {
  if (!confirm(`Seguro que queres eliminar a ${capitalize(nombre)} del sistema?`)) return;

  try {
    const res = await fetch(`${API}/pokemon/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
  } catch {
    // Maqueta
  }

  todosLosPokemones = todosLosPokemones.filter(p => p.id !== id);
  renderTabla();
  mostrarToast(`${capitalize(nombre)} fue dado de alta del sistema.`);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getPokeId(nombre) {
  // Mapa basico para maqueta
  const mapa = {
    pikachu: 25, charizard: 6, mewtwo: 150, snorlax: 143,
    bulbasaur: 1, charmander: 4, squirtle: 7, gengar: 94,
    eevee: 133, gyarados: 130, lapras: 131, dragonite: 149,
    alakazam: 65, machamp: 68, golem: 76, arcanine: 59
  };
  return mapa[nombre.toLowerCase()] || 132; // 132 = Ditto como fallback
}

function getEstadoBadge(estado, internado) {
  if (internado) return '<span class="estado-badge estado-internado">Internado</span>';
  if (estado === 'critico') return '<span class="estado-badge estado-critico">Critico</span>';
  if (estado === 'sano') return '<span class="estado-badge estado-sano">Sano</span>';
  return `<span class="estado-badge" style="background:var(--gris-claro); color: var(--gris-texto);">${capitalize(estado)}</span>`;
}

function getEfectoBadge(efecto) {
  const clases = {
    envenenado: 'efecto-envenenado',
    paralizado: 'efecto-paralizado',
    quemado: 'efecto-quemado',
    dormido: 'efecto-dormido',
    congelado: 'efecto-congelado',
    confundido: 'efecto-confundido',
    ninguno: 'efecto-ninguno'
  };
  const cls = clases[efecto] || 'efecto-ninguno';
  return `<span class="efecto-badge ${cls}">${capitalize(efecto)}</span>`;
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

// ─── INICIAR ─────────────────────────────────────────────────────────────────
cargarPokemones();