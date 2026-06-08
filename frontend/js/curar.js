const API = 'http://localhost:3000';

let todosLosPokemones = [];
let filtroActivo = 'todos';

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
    entrenador: { nombre: 'Ash' },
    entrenadorId: 1
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
    entrenador: { nombre: 'Ash' },
    entrenadorId: 1
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
    entrenador: { nombre: 'Giovanni' },
    entrenadorId: 2
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
    entrenador: { nombre: 'Brock' },
    entrenadorId: 3
  }
];

async function cargarPokemones() {
  try {
    const res = await fetch(`${API}/pokemon`);
    if (!res.ok) throw new Error();
    todosLosPokemones = await res.json();
  } catch {
    todosLosPokemones = MAQUETA;
    mostrarToast('Modo maqueta activo. Backend no disponible.', true);
  }
  renderTabla();
}

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
    const entrenadorNombre = p.entrenador ? p.entrenador.nombre : 'Salvaje';

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
        <strong style="text-transform: capitalize;">${p.nombre}</strong>${p.shiny ? ' <span style="color:var(--amarillo)">★</span>' : ''}
        <br/><small style="color: var(--gris-texto);">${p.especie || ''}</small>
        </td>
        <td>${p.tipo || '-'}</td>
        <td>
          <span style="font-family: 'Press Start 2P', monospace; font-size: 0.7rem;">Lv.${p.nivel}</span>
        </td>
        <td>${estadoBadge}</td>
        <td>${efectoBadge}</td>
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
          <th>Entrenador</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

function calcularTarifa(pokemon) {
  let base = 0;
  if (pokemon.estadoSalud === 'debil') base = 50;
  else if (pokemon.estadoSalud === 'herido') base = 100;
  else if (pokemon.estadoSalud === 'grave') base = 250;
  else if (pokemon.estadoSalud === 'critico') base = 600;
  else base = 20;

  let extraEfecto = 0;
  if (pokemon.efecto === 'envenenado') extraEfecto = 80;
  else if (pokemon.efecto === 'paralizado') extraEfecto = 60;
  else if (pokemon.efecto === 'quemado') extraEfecto = 90;
  else if (pokemon.efecto === 'dormido') extraEfecto = 40;
  else if (pokemon.efecto === 'congelado') extraEfecto = 120;
  else if (pokemon.efecto === 'confundido') extraEfecto = 50;
  else extraEfecto = 0;

  let total = base + extraEfecto;
  if (pokemon.shiny) total = Math.round(total * 1.25);

  const esSalvaje = pokemon.entrenadorId === null || !pokemon.entrenador;
  if (esSalvaje) total = 0;

  return { base, extraEfecto, total, esSalvaje };
}

function iniciarCura(id, nombre) {
  const overlay = document.getElementById('modal-curar');
  const barraFill = document.getElementById('barra-fill');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalTexto = document.getElementById('modal-texto');
  const modalBtn = document.getElementById('modal-btn-ok');
  const modalImg = document.getElementById('modal-pokemon-img');

  const pokemon = todosLosPokemones.find(p => p.id === id);
  const tarifa = calcularTarifa(pokemon);

  const pokeId = getPokeId(nombre);
  modalImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`;

  modalTitulo.textContent = `Curando a ${capitalize(nombre)}...`;
  modalTexto.textContent = 'La Enfermera Joy esta trabajando. Por favor espera.';
  modalBtn.style.display = 'none';
  barraFill.style.width = '0%';

  overlay.classList.add('visible');

  const audio = document.getElementById('audio-cura');
  if (audio) {
    audio.currentTime = 0;
    audio.volume = 0.6;
    audio.play().catch(() => {});
  }

  setTimeout(() => { barraFill.style.width = '100%'; }, 100);

  setTimeout(async () => {
    try {
      const res = await fetch(`${API}/pokemon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoSalud: 'sano', efecto: 'ninguno' })
      });
      if (!res.ok) throw new Error();

      const idx = todosLosPokemones.findIndex(p => p.id === id);
      if (idx !== -1) {
        todosLosPokemones[idx].estadoSalud = 'sano';
        todosLosPokemones[idx].efecto = 'ninguno';
      }
    } catch {
      const idx = todosLosPokemones.findIndex(p => p.id === id);
      if (idx !== -1) {
        todosLosPokemones[idx].estadoSalud = 'sano';
        todosLosPokemones[idx].efecto = 'ninguno';
      }
    }

    if (audio) audio.pause();
    modalTitulo.textContent = `${capitalize(nombre)} esta curado!`;

    if (tarifa.esSalvaje) {
      modalTexto.innerHTML = `
        El tratamiento fue completamente gratis.<br/>
        <span style="font-weight: 800; color: var(--verde-sano);">¡Descuento del 100% por ser Pokemon Salvaje!</span>
      `;
    } else {
      modalTexto.innerHTML = `
        <div style="text-align: left; margin: 0 auto; max-width: 280px; font-size: 0.82rem; background: var(--gris-claro); padding: 10px; border-radius: 8px;">
          <strong>Detalle de Factura:</strong><br/>
          • Base de consulta: $${tarifa.base} Pokedolares<br/>
          • Tratamiento de ${pokemon.efecto}: $${tarifa.extraEfecto} Pokedolares<br/>
          ${pokemon.shiny ? '• Recargo de medicina Shiny (+25%)<br/>' : ''}
          <div style="border-top: 1px solid var(--gris-medio); margin-top: 6px; padding-top: 6px; font-weight: 800; font-size: 0.9rem; color: var(--rosa-oscuro);">
            Total Cobrado: $${tarifa.total} Pokedolares
          </div>
        </div>
      `;
    }

    modalBtn.style.display = 'block';
    renderTabla();
  }, 3200);
}

function cerrarModal() {
  document.getElementById('modal-curar').classList.remove('visible');
}

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

async function eliminarPokemon(id, nombre) {
  if (!confirm(`Seguro que queres eliminar a ${capitalize(nombre)} del sistema?`)) return;

  try {
    const res = await fetch(`${API}/pokemon/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
  } catch {
  }

  todosLosPokemones = todosLosPokemones.filter(p => p.id !== id);
  renderTabla();
  mostrarToast(`${capitalize(nombre)} fue dado de alta del sistema.`);
}

function getPokeId(nombre) {
  const mapa = {
    pikachu: 25, charizard: 6, mewtwo: 150, snorlax: 143,
    bulbasaur: 1, charmander: 4, squirtle: 7, gengar: 94,
    eevee: 133, gyarados: 130, lapras: 131, dragonite: 149,
    alakazam: 65, machamp: 68, golem: 76, arcanine: 59
  };
  return mapa[nombre.toLowerCase()] || 132;
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

cargarPokemones();