/* ==========================================================
   PeliSpacio - script.js (Transiciones y Navegación Limpias)
   ========================================================== */

/* ----------------------------------------------------------
   0. Utilidad compartida: normalizar texto para comparar
   ---------------------------------------------------------- */
function normalizarGenero(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

document.addEventListener('DOMContentLoaded', function () {
  // Asegura que la página NUNCA quede opaca al cargar o regresar
  document.body.style.opacity = '1';
  document.body.style.filter = 'none';

  inicializarBuscadorYFiltros();
  inicializarPaginaDetalle();
  inicializarFormulario();
  inicializarNombreUsuario();
  
  // Módulos Interactivos Avanzados
  inicializarEfectosTilt();
  inicializarNavegacionTeclado();
  inicializarBotonSubirArriba();
  inicializarHeaderScroll();
});

/* ----------------------------------------------------------
   0.1 Nombre de usuario (guardado en el navegador)
   ---------------------------------------------------------- */
const CLAVE_USUARIO = 'pelispacio_username';

function obtenerNombreUsuario() {
  return localStorage.getItem(CLAVE_USUARIO) || 'Invitado';
}

function guardarNombreUsuario(nombre) {
  localStorage.setItem(CLAVE_USUARIO, nombre);
}

/* ----------------------------------------------------------
   0.2 Modal propio para pedir el nombre (no depende de prompt())
   ---------------------------------------------------------- */
function pedirNombreUsuario(mensaje, valorActual, alConfirmar) {
  let overlay = document.getElementById('modal-nombre-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-nombre-overlay';
    overlay.className = 'modal-nombre-overlay';
    overlay.innerHTML = `
      <div class="modal-nombre-caja">
        <h3 id="modal-nombre-titulo"></h3>
        <input type="text" id="modal-nombre-input" maxlength="25" placeholder="Tu nombre">
        <div class="modal-nombre-botones">
          <button type="button" id="modal-nombre-cancelar" class="modal-nombre-btn secundario">Cancelar</button>
          <button type="button" id="modal-nombre-aceptar" class="modal-nombre-btn primario">Aceptar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const titulo = document.getElementById('modal-nombre-titulo');
  const input = document.getElementById('modal-nombre-input');
  const btnAceptar = document.getElementById('modal-nombre-aceptar');
  const btnCancelar = document.getElementById('modal-nombre-cancelar');

  titulo.textContent = mensaje;
  input.value = valorActual || '';
  overlay.classList.add('activo');
  setTimeout(() => input.focus(), 50);

  function cerrar() {
    overlay.classList.remove('activo');
    btnAceptar.removeEventListener('click', aceptar);
    btnCancelar.removeEventListener('click', cerrar);
    input.removeEventListener('keydown', teclaEnter);
  }

  function aceptar() {
    const valor = input.value.trim();
    cerrar();
    if (valor) alConfirmar(valor);
  }

  function teclaEnter(evento) {
    if (evento.key === 'Enter') aceptar();
  }

  btnAceptar.addEventListener('click', aceptar);
  btnCancelar.addEventListener('click', cerrar);
  input.addEventListener('keydown', teclaEnter);
}

/* ----------------------------------------------------------
   0.3 Modal OBLIGATORIO: iniciar sesión antes de ver algo
   ---------------------------------------------------------- */
function requiereCuenta(alTenerCuenta) {
  const actual = obtenerNombreUsuario();
  if (actual && actual !== 'Invitado') {
    alTenerCuenta();
    return;
  }
  mostrarModalLogin(function () {
    const actualizado = obtenerNombreUsuario();
    pedirNombreUsuario('¿Con qué nombre de perfil quieres entrar?', actualizado === 'Invitado' ? '' : actualizado, function (nombrePerfil) {
      guardarNombreUsuario(nombrePerfil);
      mostrarToast('¡Bienvenido, ' + nombrePerfil + '!');
      alTenerCuenta();
    });
  });
}

function mostrarModalLogin(alIniciarSesion) {
  let overlay = document.getElementById('modal-login-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-login-overlay';
    overlay.className = 'modal-nombre-overlay';
    overlay.innerHTML = `
      <div class="modal-login-caja">
        <button type="button" id="modal-login-cerrar-x" class="modal-login-cerrar-x" aria-label="Cerrar">&times;</button>
        <h1 class="modal-login-marca">PelisPacio 🎬</h1>
        <h2>Iniciar Sesión</h2>
        <p class="modal-login-aviso">Necesitas iniciar sesión para ver este contenido.</p>
        <form id="modal-login-form">
          <input type="email" id="modal-login-email" placeholder="Correo electrónico" required>
          <input type="password" id="modal-login-password" placeholder="Contraseña" required>
          <button type="submit" class="modal-login-btn">Entrar</button>
        </form>
        <p>¿No tienes cuenta? <a href="suscrip.html">Regístrate aquí</a></p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const form = document.getElementById('modal-login-form');
  const btnCerrarX = document.getElementById('modal-login-cerrar-x');
  const email = document.getElementById('modal-login-email');
  const password = document.getElementById('modal-login-password');

  email.value = '';
  password.value = '';
  overlay.classList.add('activo');
  setTimeout(() => email.focus(), 50);

  function cerrar() {
    overlay.classList.remove('activo');
    form.removeEventListener('submit', enviar);
    btnCerrarX.removeEventListener('click', cerrar);
  }

  function enviar(evento) {
    evento.preventDefault();
    cerrar();
    alIniciarSesion();
  }

  form.addEventListener('submit', enviar);
  btnCerrarX.addEventListener('click', cerrar);
}

function inicializarNombreUsuario() {
  const elemento = document.getElementById('username-display');
  if (elemento) {
    elemento.textContent = obtenerNombreUsuario();
    elemento.classList.add('username-editable');
    elemento.title = 'Haz clic para cambiar tu nombre de usuario';

    elemento.addEventListener('click', function () {
      const actual = obtenerNombreUsuario();
      pedirNombreUsuario('¿Cómo quieres que te llamemos?', actual === 'Invitado' ? '' : actual, function (nuevoNombre) {
        guardarNombreUsuario(nuevoNombre);
        elemento.textContent = nuevoNombre;
        mostrarToast('¡Listo! Ahora eres ' + nuevoNombre);
      });
    });
  }

  // Formulario de inicio de sesión: pregunta el nombre de perfil antes de entrar
  const formularioLogin = document.getElementById('login-form');
  if (formularioLogin) {
    formularioLogin.addEventListener('submit', function (evento) {
      evento.preventDefault();

      const actual = obtenerNombreUsuario();
      pedirNombreUsuario('¿Con qué nombre de perfil quieres entrar?', actual === 'Invitado' ? '' : actual, function (nombrePerfil) {
        guardarNombreUsuario(nombrePerfil);
        window.location.href = 'hogar.html';
      });
    });
  }
}

/* ----------------------------------------------------------
   1. Búsqueda + Filtros con Animación Fluid
   ---------------------------------------------------------- */
function inicializarBuscadorYFiltros() {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  const buscador = document.getElementById('buscador');
  const chips = document.querySelectorAll('.chip');
  const tarjetas = document.querySelectorAll('.movie-card');
  const sinResultados = document.getElementById('sin-resultados');

  let filtroActivo = 'todas';

  function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function aplicarFiltros() {
    // Si hay una ficha desplegada (sinopsis + video), la cerramos antes de refiltrar
    cerrarDetalleExpandible(grid);

    const textoBusqueda = buscador ? normalizar(buscador.value.trim()) : '';
    let visibles = 0;

    tarjetas.forEach(function (tarjeta, index) {
      const titulo = tarjeta.getAttribute('data-title') || '';
      const categorias = (tarjeta.getAttribute('data-category') || '').split(' ');

      const coincideCategoria = filtroActivo === 'todas' || categorias.includes(filtroActivo);
      const coincideBusqueda = textoBusqueda === '' || normalizar(titulo).includes(textoBusqueda);

      const mostrar = coincideCategoria && coincideBusqueda;
      
      if (mostrar) {
        tarjeta.style.display = 'flex';
        tarjeta.style.animation = `scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.03}s forwards`;
        visibles++;
      } else {
        tarjeta.style.display = 'none';
      }
    });

    if (sinResultados) {
      sinResultados.style.display = visibles === 0 ? 'block' : 'none';
      if (visibles === 0) sinResultados.style.animation = 'fadeInUp 0.3s forwards';
    }
  }

  if (buscador) {
    buscador.addEventListener('input', aplicarFiltros);
    buscador.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        buscador.value = '';
        aplicarFiltros();
        mostrarToast('Búsqueda limpiada');
      }
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const filtro = chip.getAttribute('data-filter');
      if (!filtro) return;

      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filtroActivo = filtro;
      aplicarFiltros();
    });
  });

  // Si se llega desde una etiqueta de género (ej. peliculas.html?categoria=accion)
  const categoriaURL = new URLSearchParams(window.location.search).get('categoria');
  if (categoriaURL) {
    const chipCoincidente = document.querySelector('.chip[data-filter="' + categoriaURL + '"]');
    if (chipCoincidente) {
      chips.forEach(c => c.classList.remove('active'));
      chipCoincidente.classList.add('active');
      filtroActivo = categoriaURL;
    }
    aplicarFiltros();
  }
}

/* ----------------------------------------------------------
   2. Redirección Limpia (SIN EFECTO OPACO)
   ---------------------------------------------------------- */
function irADetallePelicula(boton) {
  const paginaActual = window.location.pathname.split('/').pop();
  const esVistaPrevia = paginaActual === 'peliculas.html';

  if (esVistaPrevia) {
    // La vista previa pública siempre pide iniciar sesión, sin importar
    // si el navegador ya tenía un nombre guardado de una visita anterior.
    mostrarModalLogin(function () {
      pedirNombreUsuario('¿Con qué nombre de perfil quieres entrar?', '', function (nombrePerfil) {
        guardarNombreUsuario(nombrePerfil);
        mostrarToast('¡Bienvenido, ' + nombrePerfil + '!');
        continuarADetallePelicula(boton);
      });
    });
  } else {
    continuarADetallePelicula(boton);
  }
}

function continuarADetallePelicula(boton) {
  const tarjeta = boton.closest('.movie-card');
  if (!tarjeta) return;

  boton.style.transform = 'scale(0.95)';

  const titulo = tarjeta.querySelector('h3, h4') ? tarjeta.querySelector('h3, h4').textContent.trim() : '';
  const posterSrc = tarjeta.querySelector('img') ? tarjeta.querySelector('img').getAttribute('src') : '';
  const clave = (tarjeta.getAttribute('data-title') || '').trim().toLowerCase();

  const parametros = new URLSearchParams({
    clave: clave,
    titulo: titulo,
    poster: posterSrc
  });

  setTimeout(() => {
    window.location.href = 'pelicula.html?' + parametros.toString();
  }, 100);
}

/* ----------------------------------------------------------
   2.1 Ficha desplegable (sinopsis + video) en Inicio/Películas/Series/Animes
   ---------------------------------------------------------- */
/* Catálogo central: la clave es el "data-title" de la tarjeta.
   Para poner el video real, pega el link de embed de Mega en "video" (ej: "https://mega.nz/embed/xxxxxxx#clave"). */
const DETALLES_CATALOGO = {
  "coyote vs acme": { subtitulo: "Coyote vs. Acme", anio: "2026", duracion: "1h 35m", calidad: "4K", imdb: "4.9",
    generos: ["Comedia", "Animación", "Acción"],
    sinopsis: "El Coyote del Desierto demanda a la compañía ACME después de que sus estrafalarios inventos para atrapar al Correcaminos le fallan una y otra vez, desatando un juicio tan absurdo como divertido.", video: "" },
  "oppenheimer": { subtitulo: "Oppenheimer", anio: "2023", duracion: "3h 0m", calidad: "4K", imdb: "8.9",
    generos: ["Drama", "Historia", "Biografía"],
    sinopsis: "La historia del físico J. Robert Oppenheimer y su papel al frente del Proyecto Manhattan, y las consecuencias morales de haber ayudado a crear la bomba atómica.", video: "" },
  "interstellar": { subtitulo: "Interstellar", anio: "2014", duracion: "2h 49m", calidad: "4K", imdb: "8.7",
    generos: ["Ciencia ficción", "Drama", "Aventura"],
    sinopsis: "Un grupo de astronautas viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad, mientras el tiempo corre distinto para cada uno de ellos.", video: "" },
  "angry birds": { subtitulo: "The Angry Birds Movie", anio: "2016", duracion: "1h 37m", calidad: "4K", imdb: "6.3",
    generos: ["Comedia", "Animación"],
    sinopsis: "Un pájaro huraño que vive en una isla feliz debe unir fuerzas con otras aves inadaptadas para descubrir la verdadera amenaza que se esconde tras la llegada de unos cerdos verdes.", video: "https://mega.nz/embed/Ox5hTJYR#U_Ao55c196pri-EB_ovxCKsY0ZGeK-wlh13wBFTymXI" },
  "spiderman into de spider verse": { subtitulo: "Spider-Man: Across the Spider-Verse", anio: "2023", duracion: "2h 20m", calidad: "4K", imdb: "8.6",
    generos: ["Acción", "Animación", "Aventura"],
    sinopsis: "Un joven de Brooklyn descubre que es uno de los muchos Spider-Man del multiverso y debe aprender a usar sus poderes para enfrentar una amenaza que pone en peligro varias realidades.", video: "" },
  "la mascara": { subtitulo: "The Mask", anio: "1994", duracion: "1h 41m", calidad: "4K", imdb: "6.9",
    generos: ["Comedia", "Fantasía"],
    sinopsis: "Un empleado bancario tímido encuentra una máscara mágica que libera su lado más alocado y le da poderes fuera de lo común, metiéndolo en toda clase de líos.", video: "" },
  "actividad paranormal": { subtitulo: "Paranormal Activity", anio: "2007", duracion: "1h 26m", calidad: "4K", imdb: "6.3",
    generos: ["Terror"],
    sinopsis: "Una pareja instala cámaras en su casa para descubrir qué provoca los extraños sucesos que ocurren cada noche mientras duermen.", video: "https://mega.nz/embed/vsAyHJSK#-DuSupBAdtufkcdezhDXLofIV8fRBPvjvgn4cMnPBxg" },
  "toy story 2": { subtitulo: "Toy Story 2", anio: "1999", duracion: "1h 32m", calidad: "4K", imdb: "7.9",
    generos: ["Animación", "Comedia", "Aventura"],
    sinopsis: "Woody es secuestrado por un coleccionista de juguetes y sus amigos emprenden una misión de rescate para traerlo de vuelta antes de que sea demasiado tarde.", video: "" },
  "los trolls": { subtitulo: "Trolls", anio: "2016", duracion: "1h 32m", calidad: "4K", imdb: "6.4",
    generos: ["Animación", "Comedia", "Musical"],
    sinopsis: "Los Trolls, siempre felices y cantarines, deben rescatar a varios de los suyos del reino vecino de los Bergens, criaturas gigantes que solo son felices comiéndoselos.", video: "" },
  "mentiroso mentiroso": { subtitulo: "Liar Liar", anio: "1997", duracion: "1h 27m", calidad: "4K", imdb: "6.7",
    generos: ["Comedia"],
    sinopsis: "Un abogado que nunca dice la verdad se ve obligado, por el deseo de su hijo, a no poder mentir durante 24 horas justo cuando más lo necesita.", video: "" },
  "mi villano favorito 4": { subtitulo: "Despicable Me 4", anio: "2024", duracion: "1h 34m", calidad: "4K", imdb: "6.1",
    generos: ["Animación", "Comedia"],
    sinopsis: "Gru se convierte en padre de familia y debe enfrentar a un nuevo villano de su pasado, mientras sus minions provocan el caos de siempre.", video: "" },
  "minecraft": { subtitulo: "A Minecraft Movie", anio: "2025", duracion: "1h 41m", calidad: "4K", imdb: "6.0",
    generos: ["Aventura", "Comedia", "Fantasía"],
    sinopsis: "Un grupo de personas es transportado al mundo cúbico de Minecraft, donde deberá aprender a sobrevivir, construir y enfrentar peligros para encontrar el camino de regreso a casa.", video: "" },
  "el extraño mundo de jack": { subtitulo: "The Nightmare Before Christmas", anio: "1993", duracion: "1h 16m", calidad: "4K", imdb: "8.0",
    generos: ["Animación", "Fantasía", "Musical"],
    sinopsis: "Jack Skellington, el Rey de Halloween, descubre la Navidad y decide adueñarse de ella, con resultados tan entrañables como desastrosos.", video: "" },
  "el cadaver de la novia": { subtitulo: "Corpse Bride", anio: "2005", duracion: "1h 17m", calidad: "4K", imdb: "7.3",
    generos: ["Animación", "Fantasía", "Romance"],
    sinopsis: "Un joven nervioso practica sus votos de matrimonio en el bosque y sin querer despierta a una novia cadáver que lo cree su prometido.", video: "" },

  "stranger things": { subtitulo: "Squid Game", anio: "2021", duracion: "2 Temporadas", calidad: "HD", imdb: "8.0",
    generos: ["Ciencia ficción", "Terror", "Drama"],
    sinopsis: "Un grupo de personas con deudas participa en una serie de juegos infantiles con premios millonarios, sin saber que perder significa la muerte.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/Co5nHAKD#GNTuef_L_jOC0PLp84ZtjzIeIjiWtcpFD9v7UN57pz0" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/nsJADToL#T2Vq1g0AnJxIz4LYadCZ6a8_7p_cpSB_TXYHq5O2IoQ" } ] },
  "la casa de papel": { subtitulo: "Money Heist", anio: "2017", duracion: "5 Temporadas", calidad: "HD", imdb: "8.2",
    generos: ["Crimen", "Drama", "Suspenso"],
    sinopsis: "Un grupo de atracadores liderado por 'El Profesor' planea el golpe más ambicioso de la historia: entrar a la Fábrica Nacional de Moneda y Timbre sin que nadie salga herido.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/rGJkQabJ#oYJn4DaOS88FCLg4QDxIFVw8nYcTqm-3DOmwl7OgXGI" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/PLZHxTDY#CUhswAvhGe-L5T43oxZolzWKp7tX5kMxiFTzKoyhUlk" } ] },
  "breaking bad": { subtitulo: "The Simpsons", anio: "1989", duracion: "5 Temporadas", calidad: "HD", imdb: "8.7",
    generos: ["Comedia", "Animación"],
    sinopsis: "La vida diaria de una familia y sus vecinos en un pueblo donde el humor absurdo es la norma de cada episodio.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/jhQSTYyY#r6gqpuSi2DsStNoG0j3TIsq0YURjmkZrQ6yClXymkEg" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/2o5hFQwY#3S4xaP1i6WMme0cY98kOH9-B0dA0lI7Pb6kr5OXeDyE" } ] },
  "wednesday": { subtitulo: "The Garfield Show", anio: "2009", duracion: "2 Temporadas", calidad: "HD", imdb: "6.0",
    generos: ["Comedia", "Animación"],
    sinopsis: "Un gato naranja perezoso y glotón vive las aventuras cotidianas junto a su dueño, siempre buscando lasaña y evitando los lunes.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/3pB0UbhL#iSeNCrbPIa_kryFjab7DPWudjMmnuq2s27cdZYtkFZ8" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/jlYyyKrB#o6mgI7BJJykjimig6GmJMd8_0gHrbIJzGEGNWyZcc1I" } ] },
  "the office": { subtitulo: "Gravity Falls", anio: "2012", duracion: "2 Temporadas", calidad: "HD", imdb: "8.9",
    generos: ["Comedia", "Misterio", "Animación"],
    sinopsis: "Dos hermanos gemelos exploran junto a su tío abuelo un pueblo lleno de misterios sobrenaturales durante un verano inolvidable.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "juego de tronos": { subtitulo: "Game of Thrones", anio: "2011", duracion: "8 Temporadas", calidad: "HD", imdb: "9.2",
    generos: ["Fantasía", "Drama", "Aventura"],
    sinopsis: "Varias familias nobles luchan por el control del Trono de Hierro mientras una amenaza antigua se acerca desde más allá del muro.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/PxgQDQqY#fPYqk0VSW82c5ipuiYT-DqosQRhs9GherfazckJBbjU" }, { titulo: "Episodio 2", video: "" } ] },

  "bleach": { subtitulo: "Bleach", anio: "2004", duracion: "16 Temporadas", calidad: "HD", imdb: "7.9",
    generos: ["Shonen", "Acción", "Sobrenatural"],
    sinopsis: "Un joven obtiene los poderes de una shinigami y asume la tarea de guiar a los espíritus errantes y enfrentar a los peligrosos hollows.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "dragon ball z": { subtitulo: "Dragon Ball Z", anio: "1989", duracion: "9 Temporadas", calidad: "HD", imdb: "8.7",
    generos: ["Shonen", "Acción", "Aventura"],
    sinopsis: "Goku y sus amigos defienden la Tierra de guerreros cada vez más poderosos mientras persiguen las legendarias esferas del dragón.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/W0ZX2SQS#kkbIS5bgkm33Mp2-AVJbBD7Hsj6QHEMFSW2N4Ef79XA" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/alQEQCSS#sDicw68usKath1X7IHCLtuHPgTREGiraoRBKyqq1_Z8" } ] },
  "demon slayer": { subtitulo: "Kimetsu no Yaiba", anio: "2019", duracion: "4 Temporadas", calidad: "HD", imdb: "8.5",
    generos: ["Shonen", "Acción", "Fantasía"],
    sinopsis: "Tras la masacre de su familia, un joven se convierte en cazador de demonios para vengarse y encontrar una cura para su hermana convertida en demonio.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "Takopi's Original Sin": { subtitulo: "Takopi's Original Sin", anio: "1999", duracion: "20+ Temporadas", calidad: "HD", imdb: "8.7",
    generos: ["Shonen", "Acción", "Aventura"],
    sinopsis: "Un joven pirata de cuerpo elástico reúne una tripulación para encontrar el mayor tesoro del mundo y convertirse en el Rey de los Piratas.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "inuyasha": { subtitulo: "Inuyasha", anio: "2000", duracion: "7 Temporadas", calidad: "HD", imdb: "7.7",
    generos: ["Seinen", "Fantasía", "Aventura"],
    sinopsis: "Una joven viaja al pasado feudal de Japón y, junto a un hanyō de carácter fuerte, busca los fragmentos de una joya con poderes mágicos.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "evangelion": { subtitulo: "Neon Genesis Evangelion", anio: "1995", duracion: "1 Temporada", calidad: "HD", imdb: "8.5",
    generos: ["Mecha", "Ciencia ficción", "Suspenso"],
    sinopsis: "Un adolescente es reclutado para pilotar un robot gigante y defender a la humanidad de misteriosas criaturas conocidas como Ángeles.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/3xg1WIJK#IA7ouf0An09HhhxhMf-94Fe5v7XUZKoXxE0bITaFxOw" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/utIw2KJT#_TZYR1_fIxKTTs6Z4SeWmCNjXCXb3VWqvBVCWzd8aAU" } ] }
};

function cerrarDetalleExpandible(contenedor) {
  if (!contenedor) return;
  const panelAbierto = contenedor.querySelector('.detalle-expandible');
  if (panelAbierto) panelAbierto.remove();

  const tarjetaActiva = contenedor.querySelector('.movie-card.tarjeta-activa');
  if (tarjetaActiva) tarjetaActiva.classList.remove('tarjeta-activa');
}

function crearVideoHTML(linkMega, titulo) {
  return linkMega
    ? `<iframe src="${linkMega}" title="Video de ${titulo}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen loading="lazy"></iframe>`
    : `<div class="video-no-disponible"><i class="fa-solid fa-video-slash"></i><p>Todavía no se agregó el video de este título.</p></div>`;
}

function mostrarDetalleTarjeta(boton) {
  const tarjeta = boton.closest('.movie-card');
  if (!tarjeta) return;

  const contenedor = tarjeta.closest('.movies-grid') || tarjeta.closest('.movies-flex-container') || tarjeta.parentElement;
  const eraEstaTarjeta = tarjeta.classList.contains('tarjeta-activa');

  // Cierra cualquier ficha que ya estuviera abierta en este mismo bloque (solo una a la vez)
  cerrarDetalleExpandible(contenedor);

  // Si el botón pertenecía a la tarjeta que ya estaba abierta, con cerrarla basta (toggle)
  if (eraEstaTarjeta) return;

  const claveTitulo = (tarjeta.getAttribute('data-title') || '').trim().toLowerCase();
  const datos = DETALLES_CATALOGO[claveTitulo] || {};

  const titulo = tarjeta.querySelector('h4') ? tarjeta.querySelector('h4').textContent.trim() : 'Sin título';
  const poster = tarjeta.querySelector('img') ? tarjeta.querySelector('img').getAttribute('src') : '';

  const subtitulo = datos.subtitulo || '';
  const anio = datos.anio || '';
  const duracion = datos.duracion || '';
  const calidad = datos.calidad || 'HD';
  const imdb = datos.imdb || '';
  const generos = datos.generos || (tarjeta.getAttribute('data-category') || '').split(' ').filter(Boolean);
  const sinopsis = datos.sinopsis || tarjeta.getAttribute('data-sinopsis') || 'Sinopsis no disponible por el momento.';
  const videoMega = datos.video || tarjeta.getAttribute('data-video') || '';

  const badgesHTML = [
    `<span class="badge-pill badge-calidad">${calidad}</span>`,
    anio ? `<span class="badge-pill">${anio}</span>` : '',
    duracion ? `<span class="badge-pill">${duracion}</span>` : '',
    imdb ? `<span class="badge-pill badge-imdb">⭐ ${imdb}</span>` : ''
  ].join('');

  const generosHTML = generos.map(g => `<span class="badge-genero">${g}</span>`).join('');

  const panel = document.createElement('div');
  panel.className = 'detalle-expandible';

  panel.innerHTML = `
    <button type="button" class="detalle-cerrar" aria-label="Cerrar">&times;</button>
    <div class="detalle-expandible-contenido">
      <img src="${poster}" alt="${titulo}" class="detalle-expandible-poster">
      <div class="detalle-expandible-info">
        <h3>${titulo}</h3>
        ${subtitulo ? `<p class="detalle-expandible-subtitulo">${subtitulo}</p>` : ''}
        <div class="detalle-expandible-badges">${badgesHTML}</div>
        <p class="detalle-expandible-sinopsis">${sinopsis}</p>
        ${generosHTML ? `<div class="detalle-expandible-generos">${generosHTML}</div>` : ''}

        <div class="detalle-expandible-reproducir">
          <h4>Reproducir</h4>
          <div class="servidor-actual"><i class="fa-solid fa-server"></i> Servidor: Mega</div>
          <div class="detalle-expandible-video">${crearVideoHTML(videoMega, titulo)}</div>
        </div>
      </div>
    </div>
  `;

  tarjeta.insertAdjacentElement('afterend', panel);
  tarjeta.classList.add('tarjeta-activa');

  panel.querySelector('.detalle-cerrar').addEventListener('click', function () {
    cerrarDetalleExpandible(contenedor);
  });

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ----------------------------------------------------------
   3. Reproductor Dinámico
   ---------------------------------------------------------- */
function inicializarPaginaDetalle() {
  const contenedor = document.getElementById('detalle-fondo');
  if (!contenedor) return;

  const parametros = new URLSearchParams(window.location.search);
  const clave = (parametros.get('clave') || '').trim().toLowerCase();
  const titulo = parametros.get('titulo') || 'Película';
  const poster = parametros.get('poster') || '';

  const datos = DETALLES_CATALOGO[clave] || {};

  document.title = titulo + ' • PeliSpacio';

  const setTexto = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTexto('detalle-titulo', titulo);
  setTexto('detalle-subtitulo', datos.subtitulo || '');
  setTexto('detalle-badge-calidad', datos.calidad || 'HD');
  setTexto('detalle-badge-anio', datos.anio || '');
  setTexto('detalle-badge-duracion', datos.duracion || '');
  setTexto('detalle-badge-imdb', datos.imdb || '');
  setTexto('detalle-descripcion', datos.sinopsis || 'Sinopsis no disponible por el momento.');

  const elemPoster = document.getElementById('detalle-poster');
  if (elemPoster) elemPoster.setAttribute('src', poster);
  if (contenedor) contenedor.style.backgroundImage = 'url("' + poster + '")';

  const contenedorGeneros = document.getElementById('detalle-generos');
  if (contenedorGeneros) {
    contenedorGeneros.innerHTML = '';
    (datos.generos || []).forEach(genero => {
      const enlace = document.createElement('a');
      enlace.textContent = genero;
      enlace.href = 'hogar.html';
      contenedorGeneros.appendChild(enlace);
    });
  }

  const videoResponsive = document.getElementById('video-responsive');
  const listaEpisodios = document.getElementById('episodios-lista');
  const episodios = datos.episodios || null;

  const reproducirEpisodio = (ep, boton) => {
    if (listaEpisodios) {
      listaEpisodios.querySelectorAll('.episodio-btn').forEach(b => b.classList.remove('activo'));
    }
    if (boton) boton.classList.add('activo');
    if (videoResponsive) {
      videoResponsive.innerHTML = crearVideoHTML(ep.video || '', titulo + ' - ' + (ep.titulo || 'Episodio'));
    }
  };

  if (listaEpisodios) {
    listaEpisodios.innerHTML = '';
    if (episodios && episodios.length) {
      listaEpisodios.style.display = 'flex';
      episodios.forEach((ep, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'episodio-btn' + (indice === 0 ? ' activo' : '');
        boton.innerHTML = `<i class="fa-solid fa-play"></i> ${ep.titulo || ('Episodio ' + (indice + 1))}`;
        boton.addEventListener('click', () => reproducirEpisodio(ep, boton));
        listaEpisodios.appendChild(boton);
      });
    } else {
      listaEpisodios.style.display = 'none';
    }
  }

  if (videoResponsive) {
    if (episodios && episodios.length) {
      videoResponsive.innerHTML = crearVideoHTML(episodios[0].video || '', titulo + ' - ' + (episodios[0].titulo || 'Episodio 1'));
    } else {
      videoResponsive.innerHTML = crearVideoHTML(datos.video || '', titulo);
    }
  }
}

/* ----------------------------------------------------------
   4. Formulario Interactivo
   ---------------------------------------------------------- */
function inicializarFormulario() {
  const formulario = document.getElementById('contact-form');
  if (!formulario) return;

  const parametros = new URLSearchParams(window.location.search);
  const plan = parametros.get('plan');
  const selectPlan = document.getElementById('subject');
  if (plan && selectPlan) selectPlan.value = plan;

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('name').value.trim();
    const correo = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('message').value.trim();

    if (!nombre || !correo || !mensaje) {
      mostrarToast('Por favor completa todos los campos', 'error');
      return;
    }

    const btnSubmit = formulario.querySelector('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando...';
    }

    setTimeout(() => {
      mostrarToast(`¡Gracias ${nombre}! Mensaje enviado correctamente.`, 'exito');
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Enviar Mensaje';
      }
      formulario.reset();
    }, 1000);
  });
}

/* ----------------------------------------------------------
   5. Efectos y Notificaciones Toast
   ---------------------------------------------------------- */
function mostrarToast(mensaje, tipo = 'info') {
  let toast = document.getElementById('toast-container');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-container';
    document.body.appendChild(toast);
  }

  const item = document.createElement('div');
  item.className = `toast-item ${tipo}`;
  item.textContent = mensaje;
  toast.appendChild(item);

  setTimeout(() => {
    item.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => item.remove(), 300);
  }, 3000);
}

function inicializarEfectosTilt() {
  const tarjetas = document.querySelectorAll('.movie-card, .plan-card');
  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('mousemove', (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      tarjeta.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) translateY(-5px)`;
    });

    tarjeta.addEventListener('mouseleave', () => {
      tarjeta.style.transform = '';
    });
  });
}

function inicializarNavegacionTeclado() {
  document.addEventListener('keydown', (e) => {
    const buscador = document.getElementById('buscador');
    if (e.key === '/' && document.activeElement !== buscador) {
      if (buscador) {
        e.preventDefault();
        buscador.focus();
      }
    }
  });
}

function inicializarBotonSubirArriba() {
  const btn = document.createElement('button');
  btn.id = 'btn-top';
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}

function inicializarHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* Inyección de CSS para Animaciones y Componentes UI */
const cssDinamico = document.createElement('style');
cssDinamico.textContent = `
  @keyframes scaleUp {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeOut {
    to { opacity: 0; transform: translateY(-10px); }
  }

  #toast-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .toast-item {
    background: #111827;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    border-left: 4px solid #0099ff;
    animation: scaleUp 0.3s ease;
  }
  .toast-item.exito { border-left-color: #22c55e; }
  .toast-item.error { border-left-color: #ef4444; }

  #btn-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0099ff;
    color: #fff;
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, transform 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  #btn-top.visible { opacity: 1; pointer-events: auto; }
  #btn-top:hover { transform: scale(1.1); }

  .loader-video {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #fff;
    font-weight: bold;
  }

  .modal-nombre-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11, 20, 30, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .modal-nombre-overlay.activo {
    opacity: 1;
    pointer-events: auto;
  }
  .modal-nombre-caja {
    background: #ffffff;
    border-radius: 14px;
    padding: 28px;
    width: 90%;
    max-width: 340px;
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    text-align: center;
    transform: translateY(10px);
    transition: transform 0.2s ease;
  }
  .modal-nombre-overlay.activo .modal-nombre-caja {
    transform: translateY(0);
  }
  .modal-nombre-caja h3 {
    color: #0b3c5d;
    margin-bottom: 16px;
    font-size: 1.1rem;
  }
  .modal-nombre-caja input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #d7dee5;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 18px;
    outline: none;
  }
  .modal-nombre-caja input:focus {
    border-color: #0e6ba8;
  }
  .modal-nombre-botones {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  .modal-nombre-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .modal-nombre-btn.primario {
    background: #0e6ba8;
    color: #fff;
  }
  .modal-nombre-btn.primario:hover {
    background: #0b5485;
  }
  .modal-nombre-btn.secundario {
    background: #eef1f4;
    color: #4a5b6b;
  }
  .modal-nombre-btn.secundario:hover {
    background: #e2e7eb;
  }

  .modal-login-caja {
    background: #ffffff;
    border-radius: 14px;
    padding: 32px 30px 24px;
    width: 90%;
    max-width: 360px;
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    text-align: center;
    border-top: 5px solid #ba25d5;
    position: relative;
  }
  .modal-login-cerrar-x {
    position: absolute;
    top: 10px;
    right: 14px;
    background: none;
    border: none;
    font-size: 1.4rem;
    line-height: 1;
    color: #9aa8b5;
    cursor: pointer;
    padding: 4px;
  }
  .modal-login-cerrar-x:hover {
    color: #4a5b6b;
  }
  .modal-login-marca {
    color: #0e6ba8;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .modal-login-caja h2 {
    color: #0b3c5d;
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  .modal-login-aviso {
    color: #627d98;
    font-size: 0.85rem;
    margin-bottom: 18px;
    line-height: 1.4;
  }
  .modal-login-caja input {
    width: 100%;
    padding: 12px 14px;
    margin-bottom: 14px;
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    background-color: #f8fafc;
    color: #1a2b3c;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s ease;
  }
  .modal-login-caja input:focus {
    border-color: #0e6ba8;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(14, 107, 168, 0.15);
  }
  .modal-login-btn {
    width: 100%;
    padding: 13px;
    background-color: #ba25d5;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }
  .modal-login-btn:hover {
    background-color: #9c1eb5;
  }
  .modal-login-btn:active {
    transform: scale(0.98);
  }
  .modal-login-caja p {
    margin-top: 16px;
    font-size: 0.9rem;
    color: #627d98;
  }
  .modal-login-caja p a {
    color: #0e6ba8;
    font-weight: 600;
    text-decoration: none;
  }
  .modal-login-caja p a:hover {
    color: #ba25d5;
  }
`;
document.head.appendChild(cssDinamico);
document.addEventListener('DOMContentLoaded', () => {
  const subscriptionForm = document.getElementById('subscription-form');

  if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const selectedPlan = document.querySelector('input[name="plan"]:checked').value;

      guardarNombreUsuario(username.trim() || 'Invitado');

      alert(`¡Suscripción exitosa!\n\nUsuario: ${username}\nCorreo: ${email}\nPlan: ${selectedPlan.toUpperCase()}`);
      
      window.location.href = 'hogar.html';
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const loginBox = document.getElementById("login-box");
  const userDashboard = document.getElementById("user-dashboard");
  const logoutBtn = document.getElementById("logout-btn");
  const message = document.getElementById("message");

  let intentos = 0; // Contador de intentos

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    // Validación de las dos cuentas
    const esAdmin67 = email === "administrador67@gmail.com" && password === "chock2011";
    const esAdmin68 = email === "administrador68@gmail.com" && password === "chock123";

    if (esAdmin67 || esAdmin68) {
      // Credenciales correctas: muestra el dashboard sin cambiar el nombre
      loginBox.classList.add("hidden");
      userDashboard.classList.remove("hidden");
      
      message.style.color = "green";
      message.textContent = "Has accedido correctamente.";
      intentos = 0; // Reiniciar contador
    } else {
      // Credenciales incorrectas
      intentos++;

      if (intentos >= 3) {
        // Bloquear tras 3 intentos
        message.style.color = "red";
        message.textContent = "Has superado el límite de 3 intentos. Acceso bloqueado.";
        
        alert("¡Has alcanzado el máximo de 3 intentos fallidos!");

        // Deshabilitar formulario
        loginEmail.disabled = true;
        loginPassword.disabled = true;
        document.getElementById("btn-entrar-link").disabled = true;
      } else {
        // Alerta y mensaje de error en rojo
        message.style.color = "red";
        message.textContent = `Correo o contraseña incorrectos. Llevas ${intentos} de 3 intentos.`;
        
        alert(`Correo o contraseña incorrectos. Te quedan ${3 - intentos} intento(s).`);
      }
    }
  });

  logoutBtn.addEventListener("click", function () {
    userDashboard.classList.add("hidden");
    loginBox.classList.remove("hidden");
    loginForm.reset();
    message.textContent = "";
  });
});
