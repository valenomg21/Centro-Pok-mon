const API = 'http://localhost:3000';

let debounceTimer;
let pokemonDataCache = null;

const inputNombre = document.getElementById('input-nombre');
const pokemonImg = document.getElementById('pokemon-img');
const previewNombre = document.getElementById('preview-nombre');
const previewTipo = document.getElementById('preview-tipo');
const previewTipos = document.getElementById('preview-tipos');

inputNombre.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const nombre = inputNombre.value.trim().toLowerCase();
    if (nombre.length >= 3) {
      buscarPokemon(nombre);
    } else {
      resetPreview();
    }
  }, 600);
});

async function buscarPokemon(nombre) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    if (!res.ok) {
      resetPreview();
      return;
    }
    const data = await res.json();
    pokemonDataCache = data;

    const img = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

    pokemonImg.src = img;
    pokemonImg.style.width = '140px';
    pokemonImg.style.opacity = '1';
    previewNombre.textContent = capitalize(data.name);
    previewNombre.style.color = 'var(--negro)';

    const tipos = data.types.map(t => t.type.name);
    previewTipos.innerHTML = tipos.map(t =>
      `<span class="type-badge type-${t}">${traducirTipo(t)}</span>`
    ).join('');
    previewTipo.textContent = '';

    document.getElementById('input-tipo').value = tipos.map(traducirTipo).join(' / ');
    if (!document.getElementById('input-especie').value) {
      document.getElementById('input-especie').value = capitalize(data.species.name);
    }
  } catch {
    resetPreview();
  }
}

function resetPreview() {
  pokemonDataCache = null;
  pokemonImg.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
  pokemonImg.style.width = '80px';
  pokemonImg.style.opacity = '0.3';
  previewNombre.textContent = 'Esperando nombre...';
  previewNombre.style.color = 'var(--gris-texto)';
  previewTipos.innerHTML = '';
  previewTipo.textContent = 'Tipo: --';
  document.getElementById('input-tipo').value = '';
}

const inputNivel = document.getElementById('input-nivel');
const nivelValor = document.getElementById('nivel-valor');
inputNivel.addEventListener('input', () => {
  nivelValor.textContent = inputNivel.value;
});

const shinyToggle = document.getElementById('shiny-toggle');
const inputShiny = document.getElementById('input-shiny');
const shinyTexto = document.getElementById('shiny-texto');
const previewShiny = document.getElementById('preview-shiny');

shinyToggle.addEventListener('click', () => {
  inputShiny.checked = !inputShiny.checked;
  if (inputShiny.checked) {
    shinyToggle.classList.add('active');
    shinyTexto.textContent = 'Es shiny!';
    previewShiny.style.display = 'block';
    if (pokemonDataCache) {
      const shinyImg = pokemonDataCache.sprites.other['official-artwork'].front_shiny || pokemonDataCache.sprites.front_shiny;
      if (shinyImg) pokemonImg.src = shinyImg;
    }
  } else {
    shinyToggle.classList.remove('active');
    shinyTexto.textContent = 'No es shiny';
    previewShiny.style.display = 'none';
    if (pokemonDataCache) {
      const normalImg = pokemonDataCache.sprites.other['official-artwork'].front_default || pokemonDataCache.sprites.front_default;
      pokemonImg.src = normalImg;
    }
  }
});

const salvajeToggle = document.getElementById('salvaje-toggle');
const inputSalvaje = document.getElementById('input-salvaje');
const salvajeTexto = document.getElementById('salvaje-texto');
const grupoEntrenador = document.getElementById('grupo-entrenador');

salvajeToggle.addEventListener('click', () => {
  inputSalvaje.checked = !inputSalvaje.checked;
  if (inputSalvaje.checked) {
    salvajeToggle.classList.add('active');
    salvajeTexto.textContent = 'Es salvaje!';
    grupoEntrenador.style.display = 'none';
  } else {
    salvajeToggle.classList.remove('active');
    salvajeTexto.textContent = 'No es salvaje';
    grupoEntrenador.style.display = 'block';
  }
});

const inputCritico = document.getElementById('input-critico');
const panelCritico = document.getElementById('panel-critico');
const inputEstado = document.getElementById('input-estado');

inputCritico.addEventListener('change', () => {
  if (inputCritico.checked) {
    panelCritico.style.display = 'block';
    inputEstado.value = 'critico';
  } else {
    panelCritico.style.display = 'none';
    if (inputEstado.value === 'critico') inputEstado.value = 'grave';
  }
});

inputEstado.addEventListener('change', () => {
  if (inputEstado.value === 'critico') {
    inputCritico.checked = true;
    panelCritico.style.display = 'block';
  } else {
    inputCritico.checked = false;
    panelCritico.style.display = 'none';
  }
});

async function cargarSelectores() {
  try {
    const res = await fetch(`${API}/entrenadores`);
    const entrenadores = await res.json();
    const sel = document.getElementById('input-entrenador');
    sel.innerHTML = '<option value="">Selecciona entrenador...</option>';
    entrenadores.forEach(e => {
      sel.innerHTML += `<option value="${e.id}">${e.nombre} (${e.region})</option>`;
    });
  } catch {
    document.getElementById('input-entrenador').innerHTML = '<option value="">Backend no disponible</option>';
  }

  try {
    const res = await fetch(`${API}/salas`);
    const salas = await res.json();
    const sel = document.getElementById('input-sala');
    sel.innerHTML = '<option value="">Selecciona sala...</option>';
    salas.forEach(s => {
      const disponible = !s.ocupada ? '' : ' (ocupada)';
      sel.innerHTML += `<option value="${s.id}" ${s.ocupada ? 'disabled' : ''}>${s.nombre} - ${s.tipo}${disponible}</option>`;
    });
  } catch {
    document.getElementById('input-sala').innerHTML = '<option value="">Backend no disponible</option>';
  }
}

cargarSelectores();

async function registrarPokemon() {
  const nombre = inputNombre.value.trim();
  const especie = document.getElementById('input-especie').value.trim();
  const tipo = document.getElementById('input-tipo').value.trim();
  const nivel = parseInt(inputNivel.value);
  const estadoSalud = inputEstado.value;
  const efecto = document.getElementById('input-efecto').value;
  const shiny = inputShiny.checked;
  const salvaje = inputSalvaje.checked;
  const critico = inputCritico.checked;
  const entrenadorIdRaw = document.getElementById('input-entrenador').value;
  const salaId = parseInt(document.getElementById('input-sala').value);

  if (!nombre || !especie || !tipo) {
    mostrarToast('Completa el nombre, especie y tipo del pokemon.', true);
    return;
  }
  if (!salvaje && !entrenadorIdRaw) {
    mostrarToast('Selecciona un entrenador.', true);
    return;
  }
  if (!salaId) {
    mostrarToast('Selecciona una sala.', true);
    return;
  }

  const entrenadorId = salvaje ? null : parseInt(entrenadorIdRaw);

  const payload = {
    nombre,
    especie,
    tipo,
    nivel,
    estadoSalud: critico ? 'critico' : estadoSalud,
    internado: critico,
    shiny,
    efecto,
    entrenadorId,
    salaId
  };

  try {
    const sesion = JSON.parse(localStorage.getItem('cp_usuario'));
    const token = sesion?.token;

    const res = await fetch(`${API}/pokemon`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();

    mostrarToast(`${capitalize(nombre)} fue registrado exitosamente!`);

    if (critico) {
      setTimeout(() => {
        window.location.href = 'salas.html';
      }, 1800);
    } else {
      setTimeout(limpiarFormulario, 1800);
    }
  } catch {
    mostrarToast(`[MAQUETA] ${capitalize(nombre)} seria registrado. Backend no disponible.`);
    if (critico) {
      setTimeout(() => { window.location.href = 'salas.html'; }, 1800);
    }
  }
}

function limpiarFormulario() {
  inputNombre.value = '';
  document.getElementById('input-especie').value = '';
  document.getElementById('input-tipo').value = '';
  inputNivel.value = 5;
  nivelValor.textContent = '5';
  inputEstado.value = 'sano';
  document.getElementById('input-efecto').value = 'ninguno';
  inputShiny.checked = false;
  inputCritico.checked = false;
  inputSalvaje.checked = false;
  shinyToggle.classList.remove('active');
  shinyTexto.textContent = 'No es shiny';
  salvajeToggle.classList.remove('active');
  salvajeTexto.textContent = 'No es salvaje';
  grupoEntrenador.style.display = 'block';
  previewShiny.style.display = 'none';
  panelCritico.style.display = 'none';
  pokemonDataCache = null;
  resetPreview();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const traducciones = {
  fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Electrico',
  psychic: 'Psiquico', ice: 'Hielo', dragon: 'Dragon', dark: 'Siniestro',
  fairy: 'Hada', normal: 'Normal', fighting: 'Lucha', flying: 'Volador',
  poison: 'Veneno', ground: 'Tierra', rock: 'Roca', bug: 'Bicho',
  ghost: 'Fantasma', steel: 'Acero'
};

function traducirTipo(tipo) {
  return traducciones[tipo] || capitalize(tipo);
}

function mostrarToast(msg, error = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast${error ? ' error' : ''}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}