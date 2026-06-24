const API_BASE = 'http://localhost:3000';

function mostrarAlerta(elementId, mensaje, tipo) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = mensaje;
  el.style.display = 'flex';
  const opuesto = tipo === 'error'
    ? elementId.replace('error', 'success')
    : elementId.replace('success', 'error');
  const elOpuesto = document.getElementById(opuesto);
  if (elOpuesto) elOpuesto.style.display = 'none';
}

function ocultarAlertas(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function setLoading(btn, cargando, textoOriginal) {
  if (cargando) {
    btn.disabled = true;
    btn.innerHTML = '<span>Cargando...</span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

function guardarSesion(usuario) {
  localStorage.setItem('cp_usuario', JSON.stringify(usuario));
}

function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem('cp_usuario'));
  } catch {
    return null;
  }
}

function cerrarSesion() {
  localStorage.removeItem('cp_usuario');
  window.location.href = './index.html';
}

// Si ya hay sesion activa, redirigir al inicio
(function verificarSesionActiva() {
  const sesion = obtenerSesion();
  if (sesion && sesion.id) {
    window.location.href = '../index.html';
  }
})();

const tabs = document.querySelectorAll('.login-tab');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');

function activarTab(nombre) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === nombre));
  if (nombre === 'login') {
    formLogin.style.display = 'flex';
    formRegistro.style.display = 'none';
    ocultarAlertas('login-error', 'login-success');
  } else {
    formLogin.style.display = 'none';
    formRegistro.style.display = 'flex';
    ocultarAlertas('reg-error', 'reg-success');
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => activarTab(tab.dataset.tab));
});

document.querySelectorAll('.link-tab').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    activarTab(link.dataset.tab);
  });
});

document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const esPassword = input.type === 'password';
    input.type = esPassword ? 'text' : 'password';
    btn.innerHTML = esPassword
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  });
});

// ---- Login ----

const btnLoginOriginal = document.getElementById('btn-login')?.innerHTML;

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarAlertas('login-error', 'login-success');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login');

  if (!email || !password) {
    mostrarAlerta('login-error', 'Por favor completa todos los campos.', 'error');
    return;
  }

  setLoading(btn, true, btnLoginOriginal);

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta('login-error', data.error || 'Credenciales incorrectas.', 'error');
      return;
    }

    guardarSesion(data.usuario);
    mostrarAlerta('login-success', `Bienvenido, ${data.usuario.nombre}! Redirigiendo...`, 'success');

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);

  } catch (err) {
    mostrarAlerta('login-error', 'No se pudo conectar con el servidor. Verifica que este corriendo.', 'error');
  } finally {
    setLoading(btn, false, btnLoginOriginal);
  }
});

// ---- Registro ----

const btnRegistroOriginal = document.getElementById('btn-registro')?.innerHTML;

formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarAlertas('reg-error', 'reg-success');

  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmar = document.getElementById('reg-confirmar').value;
  const btn = document.getElementById('btn-registro');

  if (!nombre || !email || !password || !confirmar) {
    mostrarAlerta('reg-error', 'Por favor completa todos los campos.', 'error');
    return;
  }

  if (password.length < 6) {
    mostrarAlerta('reg-error', 'La contrasena debe tener al menos 6 caracteres.', 'error');
    return;
  }

  if (password !== confirmar) {
    mostrarAlerta('reg-error', 'Las contrasenas no coinciden.', 'error');
    return;
  }

  setLoading(btn, true, btnRegistroOriginal);

  try {
    const res = await fetch(`${API_BASE}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta('reg-error', data.error || 'Error al crear la cuenta.', 'error');
      return;
    }

    mostrarAlerta('reg-success', 'Cuenta creada con exito! Ahora podes iniciar sesion.', 'success');

    // Limpiar formulario y cambiar a tab login
    formRegistro.reset();
    setTimeout(() => activarTab('login'), 1800);

  } catch (err) {
    mostrarAlerta('reg-error', 'No se pudo conectar con el servidor. Verifica que este corriendo.', 'error');
  } finally {
    setLoading(btn, false, btnRegistroOriginal);
  }
});