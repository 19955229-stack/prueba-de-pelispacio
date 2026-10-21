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
        tarjeta.style.animation = `scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${Math.min(index, 12) * 0.03}s forwards`;
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
  "super mario bros la pelicula": { subtitulo: "Super Mario Bros. La Película", anio: "2023", duracion: "1h 32m", calidad: "4K", imdb: "7.0",
    generos: ["Animación", "Aventura", "Comedia"],
    sinopsis: "Mario y Luigi, dos hermanos fontaneros de Brooklyn, llegan a un mundo mágico a través de una tubería misteriosa. Mario se une a la princesa Peach y a Toad para detener a Bowser, que planea conquistar el Reino Champiñón.", video: "https://mega.nz/embed/HGZgwJAK#qZG8YR5Ap8XfJo_C4-m8visB0AaPykEpVGaLx25hnPk" },
  "interstellar": { subtitulo: "Interstellar", anio: "2014", duracion: "2h 49m", calidad: "4K", imdb: "8.7",
    generos: ["Ciencia ficción", "Drama", "Aventura"],
    sinopsis: "Un grupo de astronautas viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad, mientras el tiempo corre distinto para cada uno de ellos.", video: "https://mega.nz/embed/iSYwWCoR#N0bArzak47gPbpRGGysPkxStQvg_2g0_4YEt_m7Kx50" },
  "angry birds": { subtitulo: "The Angry Birds Movie", anio: "2016", duracion: "1h 37m", calidad: "4K", imdb: "6.3",
    generos: ["Comedia", "Animación"],
    sinopsis: "Un pájaro de mal genio que vive en una isla feliz debe unir fuerzas con otras aves inadaptadas para descubrir la verdadera amenaza que se esconde tras la llegada de unos cerdos verdes.", video: "https://mega.nz/embed/Ox5hTJYR#U_Ao55c196pri-EB_ovxCKsY0ZGeK-wlh13wBFTymXI" },
  "spiderman into de spider verse": { subtitulo: "Spider-Man: Across the Spider-Verse", anio: "2023", duracion: "2h 20m", calidad: "4K", imdb: "8.6",
    generos: ["Acción", "Animación", "Aventura"],
    sinopsis: "Un joven de Brooklyn descubre que es uno de los muchos Spider-Man del multiverso y debe aprender a usar sus poderes para enfrentar una amenaza que pone en peligro varias realidades.", video: "https://mega.nz/embed/usxi0DjI#ruo-HItd996zorG8VzOfNUEH6OH2_g2ZKFL9u0HAW8M" },
  "la mascara": { subtitulo: "The Mask", anio: "1994", duracion: "1h 41m", calidad: "4K", imdb: "6.9",
    generos: ["Comedia", "Fantasía"],
    sinopsis: "Un empleado bancario tímido encuentra una máscara mágica que libera su lado más alocado y le da poderes fuera de lo común, metiéndolo en toda clase de líos.", video: "https://mega.nz/embed/aPxUnTxK#IS7S1TK6yiCv2bfo5z09wQmoMkl1emkuD1NS_zm5bdI" },
  "actividad paranormal": { subtitulo: "Paranormal Activity", anio: "2007", duracion: "1h 26m", calidad: "4K", imdb: "6.3",
    generos: ["Terror"],
    sinopsis: "Una pareja instala cámaras en su casa para descubrir qué provoca los extraños sucesos que ocurren cada noche mientras duermen.", video: "https://mega.nz/embed/vsAyHJSK#-DuSupBAdtufkcdezhDXLofIV8fRBPvjvgn4cMnPBxg" },
  "space jam": { subtitulo: "Space Jam: El juego del siglo", anio: "1996", duracion: "1h 32m", calidad: "4K", imdb: "6.8",
    generos: ["Comedia", "Deporte", "Fantasía"],
    sinopsis: "Michael Jordan se une a un grupo de conejos para jugar un juego de baloncesto contra los aliens.", video: "" },
  "los trolls": { subtitulo: "Trolls", anio: "2016", duracion: "1h 32m", calidad: "4K", imdb: "6.4",
    generos: ["Animación", "Comedia", "Musical"],
    sinopsis: "Los Trolls, siempre felices y cantarines, deben rescatar a varios de los suyos del reino vecino de los Bergens, criaturas gigantes que solo son felices comiéndoselos.", video: "https://mega.nz/embed/3TIG3CCT#jx4HPSv3MvDJ5clC2L2n1sSI7iKrLZJReWFydPF5h8w" },
  "mentiroso mentiroso": { subtitulo: "Liar Liar", anio: "1997", duracion: "1h 27m", calidad: "4K", imdb: "6.7",
    generos: ["Comedia"],
    sinopsis: "Un abogado que nunca dice la verdad se ve obligado, por el deseo de su hijo, a no poder mentir durante 24 horas justo cuando más lo necesita.", video: "https://mega.nz/embed/mDQygJqA#aGaMYee2Euxt8bHM4YebSzx96icxXnUp6DjDAG7ICd0" },
  "mi villano favorito 4": { subtitulo: "Despicable Me 4", anio: "2024", duracion: "1h 34m", calidad: "4K", imdb: "6.1",
    generos: ["Animación", "Comedia"],
    sinopsis: "Gru se convierte en padre de familia y debe enfrentar a un nuevo villano de su pasado, mientras sus minions provocan el caos de siempre.", video: "https://mega.nz/embed/yCRwGCiD#yLLFyg-YT9UKT-yeB_Kd3PBrdkgB5qz-4-RXDiJ3dw4" },
  "minecraft": { subtitulo: "A Minecraft Movie", anio: "2025", duracion: "1h 41m", calidad: "4K", imdb: "6.0",
    generos: ["Aventura", "Comedia", "Fantasía"],
    sinopsis: "Un grupo de personas es transportado al mundo cúbico de Minecraft, donde deberá aprender a sobrevivir, construir y enfrentar peligros para encontrar el camino de regreso a casa.", video: "https://mega.nz/embed/TeRRmCZA#sdUmarqwfEhZSwgUdHYhf1tu5_riDSAZ1H0rkfUvfsM" },
  "el extraño mundo de jack": { subtitulo: "The Nightmare Before Christmas", anio: "1993", duracion: "1h 16m", calidad: "4K", imdb: "8.0",
    generos: ["Animación", "Fantasía", "Musical"],
    sinopsis: "Jack Skellington, el Rey de Halloween, descubre la Navidad y decide adueñarse de ella, con resultados tan entrañables como desastrosos.", video: "https://mega.nz/embed/6bRnGTSI#NX8SrDKtvD62IeMXbTzaIT-YGEcR5CfVuoLh2te3BvQ" },
  "el cadaver de la novia": { subtitulo: "Corpse Bride", anio: "2005", duracion: "1h 17m", calidad: "4K", imdb: "7.3",
    generos: ["Animación", "Fantasía", "Romance"],
    sinopsis: "Un joven nervioso practica sus votos de matrimonio en el bosque y sin querer despierta a una novia cadáver que lo cree su prometido.", video: "https://mega.nz/embed/XSQxwApY#K6sxCjXF9VcU3AnEzNL0bP2z_b9dBzJDPiZHAXg15HA" },

  "el juego del calamar": { subtitulo: "Squid Game", anio: "2021", duracion: "2 Temporadas", calidad: "HD", imdb: "8.0",
    generos: ["Ciencia ficción", "Terror", "Drama"],
    sinopsis: "Un grupo de personas con deudas participa en una serie de juegos infantiles con premios millonarios, sin saber que perder significa la muerte.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/Co5nHAKD#GNTuef_L_jOC0PLp84ZtjzIeIjiWtcpFD9v7UN57pz0" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/nsJADToL#T2Vq1g0AnJxIz4LYadCZ6a8_7p_cpSB_TXYHq5O2IoQ" } ] },
  "la casa de papel": { subtitulo: "Money Heist", anio: "2017", duracion: "5 Temporadas", calidad: "HD", imdb: "8.2",
    generos: ["Crimen", "Drama", "Suspenso"],
    sinopsis: "Un grupo de atracadores liderado por 'El Profesor' planea el golpe más ambicioso de la historia: entrar a la Fábrica Nacional de Moneda y Timbre sin que nadie salga herido.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/rGJkQabJ#oYJn4DaOS88FCLg4QDxIFVw8nYcTqm-3DOmwl7OgXGI" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/PLZHxTDY#CUhswAvhGe-L5T43oxZolzWKp7tX5kMxiFTzKoyhUlk" } ] },
  "los simpsons": { subtitulo: "The Simpsons", anio: "1989", duracion: "5 Temporadas", calidad: "HD", imdb: "8.7",
    generos: ["Comedia", "Animación"],
    sinopsis: "La vida diaria de una familia y sus vecinos en un pueblo donde el humor absurdo es la norma de cada episodio.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/jhQSTYyY#r6gqpuSi2DsStNoG0j3TIsq0YURjmkZrQ6yClXymkEg" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/2o5hFQwY#3S4xaP1i6WMme0cY98kOH9-B0dA0lI7Pb6kr5OXeDyE" } ] },
  "the garfield show": { subtitulo: "The Garfield Show", anio: "2009", duracion: "2 Temporadas", calidad: "HD", imdb: "6.0",
    generos: ["Comedia", "Animación"],
    sinopsis: "Un gato naranja perezoso y glotón vive las aventuras cotidianas junto a su dueño, siempre buscando lasaña y evitando los lunes.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/3pB0UbhL#iSeNCrbPIa_kryFjab7DPWudjMmnuq2s27cdZYtkFZ8" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/jlYyyKrB#o6mgI7BJJykjimig6GmJMd8_0gHrbIJzGEGNWyZcc1I" } ] },
  "gravity falls": { subtitulo: "Gravity Falls", anio: "2012", duracion: "2 Temporadas", calidad: "HD", imdb: "8.9",
    generos: ["Comedia", "Misterio", "Animación"],
    sinopsis: "Dos hermanos gemelos exploran junto a su tío abuelo un pueblo lleno de misterios sobrenaturales durante un verano inolvidable.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "pablo escobar - el patrón del mal": { subtitulo: "Pablo Escobar", anio: "2019", duracion: "1 Temporada", calidad: "HD", imdb: "8.0",
    generos: ["Crimen", "Drama", "Suspenso"],
    sinopsis: "La historia de la vida y muerte del famoso narcotraficante colombiano Pablo Escobar.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/PxgQDQqY#fPYqk0VSW82c5ipuiYT-DqosQRhs9GherfazckJBbjU" }, { titulo: "Episodio 2", video: "" } ] },

  "bleach": { subtitulo: "Bleach", anio: "2004", duracion: "16 Temporadas", calidad: "HD", imdb: "7.9",
    generos: ["Shonen", "Acción", "Sobrenatural"],
    sinopsis: "Un joven obtiene los poderes de una shinigami y asume la tarea de guiar a los espíritus errantes y enfrentar a los peligrosos hollows.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/jSZ32CzJ#TQMLQuZi6Ez2dSm2wSuA5UaLKSaVEtI457F5AE34K2o" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/eTBGyAqT#xRYdnJOg4TYFuD7rFvj5w9vcoeBNFLhbhZ4bxc7DlWQ" } ] },
  "dragon ball z": { subtitulo: "Dragon Ball Z", anio: "1989", duracion: "9 Temporadas", calidad: "HD", imdb: "8.7",
    generos: ["Shonen", "Acción", "Aventura"],
    sinopsis: "Goku y sus amigos defienden la Tierra de guerreros cada vez más poderosos mientras persiguen las legendarias esferas del dragón.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/W0ZX2SQS#kkbIS5bgkm33Mp2-AVJbBD7Hsj6QHEMFSW2N4Ef79XA" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/alQEQCSS#sDicw68usKath1X7IHCLtuHPgTREGiraoRBKyqq1_Z8" } ] },
  "demon slayer": { subtitulo: "Kimetsu no Yaiba", anio: "2019", duracion: "4 Temporadas", calidad: "HD", imdb: "8.5",
    generos: ["Shonen", "Acción", "Fantasía"],
    sinopsis: "Tras la masacre de su familia, un joven se convierte en cazador de demonios para vengarse y encontrar una cura para su hermana convertida en demonio.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/qCAjVKYK#J0EtmQ0-OehfhPdo9PEGHHL5zmNk6h17dgtlYWy6mmk" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/vGxm0ITI#16uszHxyQKub8Id1ibApl62iQs75d23cIDXyWHTjpqQ" } ] },
  "takopi's original sin": { subtitulo: "Takopi's Original Sin", anio: "1999", duracion: "20+ Temporadas", calidad: "HD", imdb: "8.7",
    generos: ["Drama", "Ciencia ficción", "Suspenso"],
    sinopsis: "Takopi, un pequeño alienígena del Planeta Felicidad, llega a la Tierra para llevar alegría a la gente y conoce a Shizuka, una niña de primaria con una vida muy difícil; intenta ayudarla con sus inventos, pero sus buenas intenciones lo llevan a situaciones cada vez más oscuras.",
    episodios: [ { titulo: "Episodio 1", video: "" }, { titulo: "Episodio 2", video: "" } ] },
  "inuyasha": { subtitulo: "Inuyasha", anio: "2000", duracion: "7 Temporadas", calidad: "HD", imdb: "7.7",
    generos: ["Seinen", "Fantasía", "Aventura"],
    sinopsis: "Una joven viaja al pasado feudal de Japón y, junto a un hanyō de carácter fuerte, busca los fragmentos de una joya con poderes mágicos.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/DexWgaaA#bqXJqdw2alccda2ohDUDnMeg8IvhWCIZDhlXUEWxxKk" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/ue4DXD4I#gRlKNSO5qMaBVUC-FFRbhrwfMxowExN58A3Fp4B36Y8" } ] },
  "evangelion": { subtitulo: "Neon Genesis Evangelion", anio: "1995", duracion: "1 Temporada", calidad: "HD", imdb: "8.5",
    generos: ["Mecha", "Ciencia ficción", "Suspenso"],
    sinopsis: "Un adolescente es reclutado para pilotar un robot gigante y defender a la humanidad de misteriosas criaturas conocidas como Ángeles.",
    episodios: [ { titulo: "Episodio 1", video: "https://mega.nz/embed/3xg1WIJK#IA7ouf0An09HhhxhMf-94Fe5v7XUZKoXxE0bITaFxOw" }, { titulo: "Episodio 2", video: "https://mega.nz/embed/utIw2KJT#_TZYR1_fIxKTTs6Z4SeWmCNjXCXb3VWqvBVCWzd8aAU" } ] },
  "spiderman brand new day": { subtitulo: "Spider-Man: Brand New Day", anio: "2026", duracion: "2h 25m", calidad: "HD", imdb: "8.1",
    generos: ["Acción", "Aventura", "Ciencia ficción"],
    sinopsis: "Cuatro años después de Sin camino a casa, Peter Parker es un adulto que vive solo, tras borrarse voluntariamente de la vida y los recuerdos de quienes ama. Combate el crimen a tiempo completo en una Nueva York que ya no conoce su nombre, pero la presión provoca una transformación física que amenaza su existencia, mientras una extraña ola de crímenes da origen a una de las amenazas más poderosas que ha enfrentado.", video: "https://mega.nz/embed/3eIjFTwY#U-9Ue64F-bUyZQwRIQJGwvu7inLAzqjQbzjwJ5aRMiE" },
  // ---- Películas agregadas (sin video aún: pega el link de Mega en "video") ----
  "mad max furia en el camino": { subtitulo: "Mad Max: Fury Road", anio: "2015", duracion: "2h 0m", calidad: "4K", imdb: "8.1",
    generos: ["Acción", "Aventura", "Ciencia Ficción"],
    sinopsis: "En un desierto postapocalíptico, una guerrera y un fugitivo escapan de un tirano a bordo de un camión blindado, perseguidos por todo un ejército.", video: "" },
  "john wick": { subtitulo: "John Wick", anio: "2014", duracion: "1h 41m", calidad: "HD", imdb: "7.4",
    generos: ["Acción", "Suspenso"],
    sinopsis: "Un asesino retirado vuelve a su antiguo mundo para vengarse de quienes le arrebataron lo último que le quedaba de su pasado.", video: "" },
  "gladiador": { subtitulo: "Gladiator", anio: "2000", duracion: "2h 35m", calidad: "4K", imdb: "8.5",
    generos: ["Acción", "Drama", "Aventura"],
    sinopsis: "Un general romano traicionado y esclavizado se convierte en gladiador y busca vengar a su familia frente al emperador que lo destruyó.", video: "" },
  "duro de matar": { subtitulo: "Die Hard", anio: "1988", duracion: "2h 12m", calidad: "HD", imdb: "8.2",
    generos: ["Acción", "Suspenso"],
    sinopsis: "Un policía de Nueva York queda atrapado en un rascacielos tomado por terroristas la noche de Navidad y debe detenerlos él solo.", video: "" },
  "misión imposible repercusión": { subtitulo: "Mission: Impossible - Fallout", anio: "2018", duracion: "2h 28m", calidad: "4K", imdb: "7.7",
    generos: ["Acción", "Aventura", "Suspenso"],
    sinopsis: "Ethan Hunt y su equipo corren contra el tiempo para evitar una catástrofe tras una misión que salió mal.", video: "" },
  "top gun maverick": { subtitulo: "Top Gun: Maverick", anio: "2022", duracion: "2h 10m", calidad: "HD", imdb: "8.2",
    generos: ["Acción", "Drama"],
    sinopsis: "Tras más de treinta años de servicio, Maverick entrena a una nueva generación de pilotos para una misión casi imposible.", video: "" },
  "el caballero de la noche": { subtitulo: "The Dark Knight", anio: "2008", duracion: "2h 32m", calidad: "4K", imdb: "9.0",
    generos: ["Acción", "Crimen", "Drama"],
    sinopsis: "Batman se enfrenta al Joker, un criminal caótico que lleva a Ciudad Gótica al límite y pone a prueba todo en lo que cree.", video: "" },
  "casino royale": { subtitulo: "Casino Royale", anio: "2006", duracion: "2h 24m", calidad: "HD", imdb: "8.0",
    generos: ["Acción", "Aventura", "Suspenso"],
    sinopsis: "En su primera misión como agente 007, James Bond debe derrotar a un banquero de terroristas en una partida de póker de alto riesgo.", video: "" },
  "terminator 2 el juicio final": { subtitulo: "Terminator 2: Judgment Day", anio: "1991", duracion: "2h 17m", calidad: "4K", imdb: "8.6",
    generos: ["Acción", "Ciencia Ficción"],
    sinopsis: "Un cyborg viaja al pasado para proteger a un niño que será clave en el futuro, mientras otra máquina aún más letal lo persigue.", video: "" },
  "rápidos y furiosos 5": { subtitulo: "Fast Five", anio: "2011", duracion: "2h 10m", calidad: "HD", imdb: "7.3",
    generos: ["Acción", "Crimen"],
    sinopsis: "Dominic y su equipo planean un último gran golpe en Río de Janeiro mientras un agente federal les pisa los talones.", video: "" },
  "indiana jones en busca del arca perdida": { subtitulo: "Raiders of the Lost Ark", anio: "1981", duracion: "1h 55m", calidad: "4K", imdb: "8.4",
    generos: ["Acción", "Aventura"],
    sinopsis: "El arqueólogo Indiana Jones compite contra los nazis por encontrar el Arca de la Alianza antes de que su poder caiga en malas manos.", video: "" },
  "kill bill volumen 1": { subtitulo: "Kill Bill: Vol. 1", anio: "2003", duracion: "1h 51m", calidad: "HD", imdb: "8.2",
    generos: ["Acción", "Crimen"],
    sinopsis: "Una asesina despierta de un coma años después de ser traicionada y emprende una venganza contra quienes intentaron matarla.", video: "" },
  "máxima velocidad": { subtitulo: "Speed", anio: "1994", duracion: "1h 56m", calidad: "4K", imdb: "7.3",
    generos: ["Acción", "Suspenso"],
    sinopsis: "Un policía debe evitar que un autobús explote: si baja de cierta velocidad, la bomba que lleva a bordo estallará.", video: "" },
  "pantera negra": { subtitulo: "Black Panther", anio: "2018", duracion: "2h 14m", calidad: "HD", imdb: "7.3",
    generos: ["Acción", "Aventura"],
    sinopsis: "T'Challa regresa a Wakanda como nuevo rey, pero un viejo enemigo amenaza el futuro de su nación y del mundo.", video: "" },
  "avengers endgame": { subtitulo: "Avengers: Endgame", anio: "2019", duracion: "3h 1m", calidad: "4K", imdb: "8.4",
    generos: ["Acción", "Aventura", "Drama"],
    sinopsis: "Los Vengadores que quedan se reúnen para intentar revertir el daño causado por Thanos y restaurar el equilibrio del universo.", video: "" },
  "300": { subtitulo: "300", anio: "2006", duracion: "1h 57m", calidad: "HD", imdb: "7.6",
    generos: ["Acción", "Drama", "Bélica"],
    sinopsis: "El rey Leónidas y trescientos guerreros espartanos defienden un estrecho paso contra el inmenso ejército persa.", video: "" },
  "rambo primera sangre": { subtitulo: "First Blood", anio: "1982", duracion: "1h 33m", calidad: "4K", imdb: "7.7",
    generos: ["Acción", "Drama"],
    sinopsis: "Un veterano de guerra es acosado por la policía de un pueblo y termina librando una cacería en el bosque.", video: "" },
  "el transportador": { subtitulo: "The Transporter", anio: "2002", duracion: "1h 32m", calidad: "HD", imdb: "6.8",
    generos: ["Acción", "Crimen"],
    sinopsis: "Un conductor profesional que nunca hace preguntas rompe sus propias reglas al descubrir qué lleva en un paquete.", video: "" },
  "guardianes de la galaxia": { subtitulo: "Guardians of the Galaxy", anio: "2014", duracion: "2h 1m", calidad: "4K", imdb: "8.0",
    generos: ["Acción", "Aventura", "Ciencia Ficción"],
    sinopsis: "Un grupo de inadaptados espaciales se ve obligado a trabajar en equipo para proteger un poderoso objeto codiciado por un villano.", video: "" },
  "gladiador ii": { subtitulo: "Gladiator II", anio: "2024", duracion: "2h 28m", calidad: "HD", imdb: "6.6",
    generos: ["Acción", "Drama", "Aventura"],
    sinopsis: "Años después de la muerte de Máximo, un joven capturado por Roma entra a la arena y se ve ligado al destino del imperio.", video: "" },
  "qué pasó ayer": { subtitulo: "The Hangover", anio: "2009", duracion: "1h 40m", calidad: "4K", imdb: "7.7",
    generos: ["Comedia"],
    sinopsis: "Tres amigos despiertan tras una despedida de soltero en Las Vegas sin recordar nada y con el novio desaparecido.", video: "" },
  "mi pobre angelito": { subtitulo: "Home Alone", anio: "1990", duracion: "1h 43m", calidad: "HD", imdb: "7.7",
    generos: ["Comedia", "Familia"],
    sinopsis: "Un niño olvidado en casa durante las vacaciones de Navidad debe defenderla de dos ladrones torpes con todo tipo de trampas.", video: "" },
  "supercool": { subtitulo: "Superbad", anio: "2007", duracion: "1h 53m", calidad: "4K", imdb: "7.6",
    generos: ["Comedia"],
    sinopsis: "Dos amigos a punto de terminar la secundaria intentan conseguir alcohol para una fiesta y viven una noche descontrolada.", video: "" },
  "chicas pesadas": { subtitulo: "Mean Girls", anio: "2004", duracion: "1h 37m", calidad: "HD", imdb: "7.1",
    generos: ["Comedia"],
    sinopsis: "Una chica que siempre estudió en casa llega a un instituto y se mete en el peligroso mundo de las chicas más populares.", video: "" },
  "los cazafantasmas": { subtitulo: "Ghostbusters", anio: "1984", duracion: "1h 45m", calidad: "4K", imdb: "7.8",
    generos: ["Comedia", "Fantasía"],
    sinopsis: "Tres científicos abren un negocio para capturar fantasmas en Nueva York, hasta que una amenaza sobrenatural pone en jaque la ciudad.", video: "" },
  "ace ventura un detective diferente": { subtitulo: "Ace Ventura: Pet Detective", anio: "1994", duracion: "1h 26m", calidad: "HD", imdb: "6.9",
    generos: ["Comedia"],
    sinopsis: "Un excéntrico detective de mascotas investiga la desaparición de la mascota de un equipo de fútbol americano.", video: "" },
  "tonto y retonto": { subtitulo: "Dumb and Dumber", anio: "1994", duracion: "1h 47m", calidad: "4K", imdb: "7.3",
    generos: ["Comedia"],
    sinopsis: "Dos amigos poco brillantes cruzan el país para devolver una maleta, sin saber en qué lío se están metiendo.", video: "" },
  "papá por siempre": { subtitulo: "Mrs. Doubtfire", anio: "1993", duracion: "2h 5m", calidad: "HD", imdb: "7.1",
    generos: ["Comedia", "Familia"],
    sinopsis: "Un padre divorciado se disfraza de niñera anciana para poder pasar tiempo con sus hijos.", video: "" },
  "la boda de mi mejor amiga": { subtitulo: "Bridesmaids", anio: "2011", duracion: "2h 5m", calidad: "4K", imdb: "6.8",
    generos: ["Comedia"],
    sinopsis: "Una dama de honor ve cómo todo se complica mientras intenta organizar la boda de su mejor amiga.", video: "" },
  "ted": { subtitulo: "Ted", anio: "2012", duracion: "1h 46m", calidad: "HD", imdb: "6.9",
    generos: ["Comedia", "Fantasía"],
    sinopsis: "Un hombre y su oso de peluche, que cobró vida por un deseo de infancia, siguen siendo inseparables ya de adultos.", video: "" },
  "click y de repente es tu vida": { subtitulo: "Click", anio: "2006", duracion: "1h 47m", calidad: "4K", imdb: "6.4",
    generos: ["Comedia", "Fantasía", "Drama"],
    sinopsis: "Un arquitecto recibe un control remoto universal que le permite adelantar su vida, y empieza a perderse lo que más importa.", video: "" },
  "una noche en el museo": { subtitulo: "Night at the Museum", anio: "2006", duracion: "1h 48m", calidad: "HD", imdb: "6.5",
    generos: ["Comedia", "Aventura", "Familia"],
    sinopsis: "Un vigilante nocturno descubre que las piezas del museo cobran vida cada vez que cae la noche.", video: "" },
  "pequeña miss sunshine": { subtitulo: "Little Miss Sunshine", anio: "2006", duracion: "1h 41m", calidad: "4K", imdb: "7.8",
    generos: ["Comedia", "Drama"],
    sinopsis: "Una familia poco convencional viaja en una vieja camioneta para llevar a la hija menor a un concurso de belleza.", video: "" },
  "la hora pico": { subtitulo: "Rush Hour", anio: "1998", duracion: "1h 38m", calidad: "HD", imdb: "7.0",
    generos: ["Comedia", "Acción"],
    sinopsis: "Un detective de Hong Kong y un policía de Los Ángeles deben trabajar juntos para rescatar a la hija de un cónsul.", video: "" },
  "elf el duende": { subtitulo: "Elf", anio: "2003", duracion: "1h 37m", calidad: "4K", imdb: "7.1",
    generos: ["Comedia", "Familia", "Fantasía"],
    sinopsis: "Un humano criado por duendes viaja a Nueva York en busca de su verdadero padre y contagia el espíritu navideño.", video: "" },
  "el reportero la leyenda de ron burgundy": { subtitulo: "Anchorman: The Legend of Ron Burgundy", anio: "2004", duracion: "1h 34m", calidad: "HD", imdb: "7.1",
    generos: ["Comedia"],
    sinopsis: "Un presentador de noticias muy seguro de sí mismo ve amenazado su reinado con la llegada de una colega ambiciosa.", video: "" },
  "mi gran boda griega": { subtitulo: "My Big Fat Greek Wedding", anio: "2002", duracion: "1h 36m", calidad: "4K", imdb: "6.6",
    generos: ["Comedia", "Romance"],
    sinopsis: "Una mujer de familia griega muy tradicional se enamora de un hombre que no lo es, y ambas familias deben conocerse.", video: "" },
  "zoolander": { subtitulo: "Zoolander", anio: "2001", duracion: "1h 29m", calidad: "HD", imdb: "6.5",
    generos: ["Comedia"],
    sinopsis: "Un modelo de moda algo despistado se ve envuelto, sin saberlo, en un complot para asesinar a un líder extranjero.", video: "" },
  "jumanji en la selva": { subtitulo: "Jumanji: Welcome to the Jungle", anio: "2017", duracion: "1h 59m", calidad: "4K", imdb: "6.9",
    generos: ["Comedia", "Acción", "Aventura"],
    sinopsis: "Cuatro estudiantes quedan atrapados dentro de un videojuego y deben superarlo encarnando a sus personajes.", video: "" },
  "un día de campo con ferris bueller": { subtitulo: "Ferris Bueller's Day Off", anio: "1986", duracion: "1h 43m", calidad: "HD", imdb: "7.8",
    generos: ["Comedia"],
    sinopsis: "Un estudiante finge estar enfermo para pasar un día inolvidable por la ciudad con sus amigos, mientras el director intenta atraparlo.", video: "" },
  "el exorcista": { subtitulo: "The Exorcist", anio: "1973", duracion: "2h 2m", calidad: "4K", imdb: "8.1",
    generos: ["Terror"],
    sinopsis: "Una madre desesperada pide ayuda a dos sacerdotes cuando su hija comienza a mostrar un comportamiento aterrador.", video: "" },
  "el resplandor": { subtitulo: "The Shining", anio: "1980", duracion: "2h 26m", calidad: "HD", imdb: "8.4",
    generos: ["Terror", "Suspenso"],
    sinopsis: "Un escritor se muda con su familia a un hotel aislado durante el invierno y la locura empieza a apoderarse de él.", video: "" },
  "psicosis": { subtitulo: "Psycho", anio: "1960", duracion: "1h 49m", calidad: "4K", imdb: "8.5",
    generos: ["Terror", "Suspenso"],
    sinopsis: "Una mujer que huye con dinero robado se hospeda en un motel solitario administrado por un joven muy peculiar.", video: "" },
  "tiburón": { subtitulo: "Jaws", anio: "1975", duracion: "2h 4m", calidad: "HD", imdb: "8.1",
    generos: ["Terror", "Aventura", "Suspenso"],
    sinopsis: "Un jefe de policía, un biólogo y un pescador salen al mar para cazar a un enorme tiburón blanco que ataca una playa.", video: "" },
  "pesadilla en la calle del infierno": { subtitulo: "A Nightmare on Elm Street", anio: "1984", duracion: "1h 31m", calidad: "4K", imdb: "7.4",
    generos: ["Terror"],
    sinopsis: "Un grupo de adolescentes es perseguido en sus sueños por un asesino con garras que puede matarlos de verdad.", video: "" },
  "halloween la noche de las brujas": { subtitulo: "Halloween", anio: "1978", duracion: "1h 31m", calidad: "HD", imdb: "7.7",
    generos: ["Terror", "Suspenso"],
    sinopsis: "Quince años después de un crimen, un asesino escapa de un hospital psiquiátrico y vuelve a su pueblo la noche de Halloween.", video: "" },
  "scream vigilante nocturno": { subtitulo: "Scream", anio: "1996", duracion: "1h 51m", calidad: "4K", imdb: "7.4",
    generos: ["Terror", "Misterio"],
    sinopsis: "Un asesino enmascarado acecha a una joven y a sus amigos mientras juega con ellos usando las reglas de las películas de terror.", video: "" },
  "sinister": { subtitulo: "Sinister", anio: "2012", duracion: "1h 50m", calidad: "HD", imdb: "6.8",
    generos: ["Terror", "Misterio"],
    sinopsis: "Un escritor de crímenes reales encuentra unas películas caseras en su nuevo hogar y descubre una presencia que amenaza a su familia.", video: "" },
  "el conjuro": { subtitulo: "The Conjuring", anio: "2013", duracion: "1h 52m", calidad: "4K", imdb: "7.5",
    generos: ["Terror", "Misterio"],
    sinopsis: "Dos investigadores paranormales ayudan a una familia atormentada por una presencia oscura en su casa de campo.", video: "" },
  "la noche del demonio": { subtitulo: "Insidious", anio: "2010", duracion: "1h 43m", calidad: "HD", imdb: "6.8",
    generos: ["Terror", "Misterio"],
    sinopsis: "Unos padres descubren que el estado de su hijo en coma no es médico, sino algo mucho más oscuro.", video: "" },
  "it eso": { subtitulo: "It", anio: "2017", duracion: "2h 15m", calidad: "4K", imdb: "7.3",
    generos: ["Terror", "Drama"],
    sinopsis: "Un grupo de niños marginados se enfrenta a una criatura que se alimenta del miedo y toma la forma de un payaso.", video: "" },
  "el legado del diablo": { subtitulo: "Hereditary", anio: "2018", duracion: "2h 7m", calidad: "HD", imdb: "7.3",
    generos: ["Terror", "Drama"],
    sinopsis: "Tras la muerte de la abuela, una familia empieza a descubrir secretos perturbadores sobre su pasado.", video: "" },
  "huye": { subtitulo: "Get Out", anio: "2017", duracion: "1h 44m", calidad: "4K", imdb: "7.7",
    generos: ["Terror", "Misterio"],
    sinopsis: "Un joven visita por primera vez a la familia de su novia y se da cuenta de que algo muy extraño ocurre en esa casa.", video: "" },
  "un lugar en silencio": { subtitulo: "A Quiet Place", anio: "2018", duracion: "1h 30m", calidad: "HD", imdb: "7.5",
    generos: ["Terror", "Ciencia Ficción"],
    sinopsis: "Una familia debe vivir en silencio absoluto para sobrevivir a unas criaturas que cazan por el sonido.", video: "" },
  "la masacre de texas": { subtitulo: "The Texas Chain Saw Massacre", anio: "1974", duracion: "1h 23m", calidad: "4K", imdb: "7.4",
    generos: ["Terror"],
    sinopsis: "Un grupo de jóvenes que viaja por Texas cae en manos de una familia de caníbales.", video: "" },
  "el aro": { subtitulo: "The Ring", anio: "2002", duracion: "1h 55m", calidad: "HD", imdb: "7.1",
    generos: ["Terror", "Misterio"],
    sinopsis: "Una periodista investiga una cinta de video maldita que, según dicen, causa la muerte de quien la ve siete días después.", video: "" },
  "posesión infernal": { subtitulo: "The Evil Dead", anio: "1981", duracion: "1h 25m", calidad: "4K", imdb: "7.4",
    generos: ["Terror"],
    sinopsis: "Cinco amigos pasan un fin de semana en una cabaña aislada y despiertan sin querer a una fuerza demoníaca.", video: "" },
  "el juego del miedo": { subtitulo: "Saw", anio: "2004", duracion: "1h 43m", calidad: "HD", imdb: "7.6",
    generos: ["Terror", "Misterio"],
    sinopsis: "Dos hombres despiertan encadenados en un baño sucio, obligados a participar en el macabro juego de un misterioso asesino.", video: "" },
  "el bebé de rosemary": { subtitulo: "Rosemary's Baby", anio: "1968", duracion: "2h 17m", calidad: "4K", imdb: "8.0",
    generos: ["Terror", "Drama"],
    sinopsis: "Una joven embarazada empieza a sospechar que sus vecinos y su propio esposo ocultan algo siniestro sobre su bebé.", video: "" },
  "no respires": { subtitulo: "Don't Breathe", anio: "2016", duracion: "1h 28m", calidad: "HD", imdb: "7.1",
    generos: ["Terror", "Suspenso"],
    sinopsis: "Tres jóvenes entran a robar en la casa de un hombre ciego, pero él resulta ser mucho más peligroso de lo que imaginaban.", video: "" },
  "titanic": { subtitulo: "Titanic", anio: "1997", duracion: "3h 14m", calidad: "4K", imdb: "7.9",
    generos: ["Romance", "Drama"],
    sinopsis: "Una joven aristócrata y un artista pobre se enamoran a bordo del famoso transatlántico en su viaje inaugural.", video: "" },
  "diario de una pasión": { subtitulo: "The Notebook", anio: "2004", duracion: "2h 3m", calidad: "HD", imdb: "7.8",
    generos: ["Romance", "Drama"],
    sinopsis: "Un anciano le lee a una mujer la historia de un amor de juventud que desafió las diferencias sociales y el paso del tiempo.", video: "" },
  "orgullo y prejuicio": { subtitulo: "Pride & Prejudice", anio: "2005", duracion: "2h 9m", calidad: "4K", imdb: "7.8",
    generos: ["Romance", "Drama"],
    sinopsis: "Elizabeth Bennet y el reservado señor Darcy deben superar sus prejuicios y diferencias de clase para reconocer lo que sienten.", video: "" },
  "la la land una historia de amor": { subtitulo: "La La Land", anio: "2016", duracion: "2h 8m", calidad: "HD", imdb: "8.0",
    generos: ["Romance", "Drama", "Musical"],
    sinopsis: "Una aspirante a actriz y un pianista de jazz se enamoran en Los Ángeles mientras persiguen sus sueños.", video: "" },
  "antes del amanecer": { subtitulo: "Before Sunrise", anio: "1995", duracion: "1h 41m", calidad: "4K", imdb: "8.1",
    generos: ["Romance", "Drama"],
    sinopsis: "Dos desconocidos se conocen en un tren y pasan una noche recorriendo Viena, hablando de la vida y del amor.", video: "" },
  "mujer bonita": { subtitulo: "Pretty Woman", anio: "1990", duracion: "1h 59m", calidad: "HD", imdb: "7.1",
    generos: ["Romance", "Comedia"],
    sinopsis: "Un empresario contrata a una joven para que lo acompañe unos días y ambos terminan cambiando la vida del otro.", video: "" },
  "ghost la sombra del amor": { subtitulo: "Ghost", anio: "1990", duracion: "2h 7m", calidad: "4K", imdb: "7.1",
    generos: ["Romance", "Drama", "Fantasía"],
    sinopsis: "Un hombre asesinado queda atrapado como fantasma y se comunica con una médium para proteger a su novia.", video: "" },
  "cuando harry conoció a sally": { subtitulo: "When Harry Met Sally...", anio: "1989", duracion: "1h 36m", calidad: "HD", imdb: "7.6",
    generos: ["Romance", "Comedia"],
    sinopsis: "Durante años, un hombre y una mujer se preguntan si un hombre y una mujer pueden ser solo amigos.", video: "" },
  "un lugar llamado notting hill": { subtitulo: "Notting Hill", anio: "1999", duracion: "2h 4m", calidad: "4K", imdb: "7.2",
    generos: ["Romance", "Comedia"],
    sinopsis: "El dueño de una librería londinense se enamora de una famosa estrella de cine que entra por casualidad a su tienda.", video: "" },
  "realmente amor": { subtitulo: "Love Actually", anio: "2003", duracion: "2h 15m", calidad: "HD", imdb: "7.6",
    generos: ["Romance", "Comedia"],
    sinopsis: "Varias historias de amor se entrelazan en Londres durante las semanas previas a la Navidad.", video: "" },
  "bajo la misma estrella": { subtitulo: "The Fault in Our Stars", anio: "2014", duracion: "2h 6m", calidad: "4K", imdb: "7.7",
    generos: ["Romance", "Drama"],
    sinopsis: "Dos jóvenes que se conocen en un grupo de apoyo comparten una historia de amor marcada por la enfermedad.", video: "" },
  "antes de ti": { subtitulo: "Me Before You", anio: "2016", duracion: "1h 50m", calidad: "HD", imdb: "7.4",
    generos: ["Romance", "Drama"],
    sinopsis: "Una joven sin rumbo se convierte en cuidadora de un hombre que quedó en silla de ruedas, y ambos cambian el uno al otro.", video: "" },
  "moulin rouge": { subtitulo: "Moulin Rouge!", anio: "2001", duracion: "2h 7m", calidad: "4K", imdb: "7.6",
    generos: ["Romance", "Drama", "Musical"],
    sinopsis: "Un joven poeta se enamora de la estrella de un cabaret parisino, pero un duque celoso se interpone entre ellos.", video: "" },
  "casablanca": { subtitulo: "Casablanca", anio: "1942", duracion: "1h 42m", calidad: "HD", imdb: "8.5",
    generos: ["Romance", "Drama"],
    sinopsis: "En plena guerra, el dueño de un bar en Marruecos debe decidir entre su antiguo amor y hacer lo correcto.", video: "" },
  "querido john": { subtitulo: "Dear John", anio: "2010", duracion: "1h 48m", calidad: "4K", imdb: "6.3",
    generos: ["Romance", "Drama"],
    sinopsis: "Un soldado y una universitaria se enamoran durante unas vacaciones y tratan de mantener su relación a la distancia.", video: "" },
  "posdata te amo": { subtitulo: "P.S. I Love You", anio: "2007", duracion: "2h 6m", calidad: "HD", imdb: "7.1",
    generos: ["Romance", "Drama"],
    sinopsis: "Una viuda recibe cartas que su esposo dejó escritas antes de morir, para ayudarla a seguir adelante.", video: "" },
  "eterno resplandor de una mente sin recuerdos": { subtitulo: "Eternal Sunshine of the Spotless Mind", anio: "2004", duracion: "1h 48m", calidad: "4K", imdb: "8.3",
    generos: ["Romance", "Drama", "Ciencia Ficción"],
    sinopsis: "Una pareja se somete a un procedimiento para borrar el recuerdo del otro, pero en el proceso redescubre lo que los unió.", video: "" },
  "cartas a julieta": { subtitulo: "Letters to Juliet", anio: "2010", duracion: "1h 45m", calidad: "HD", imdb: "6.5",
    generos: ["Romance", "Comedia"],
    sinopsis: "Una joven en Verona responde una carta olvidada y se embarca en un viaje por Italia en busca de un amor perdido.", video: "" },
  "a todos los chicos de los que me enamoré": { subtitulo: "To All the Boys I've Loved Before", anio: "2018", duracion: "1h 39m", calidad: "4K", imdb: "7.0",
    generos: ["Romance", "Comedia"],
    sinopsis: "Las cartas secretas de una adolescente a sus antiguos amores se envían sin que ella lo sepa, y su vida se vuelve un caos.", video: "" },
  "dirty dancing": { subtitulo: "Dirty Dancing", anio: "1987", duracion: "1h 40m", calidad: "HD", imdb: "7.0",
    generos: ["Romance", "Drama", "Musical"],
    sinopsis: "Durante unas vacaciones de verano, una joven aprende a bailar y se enamora de su apuesto instructor.", video: "" },
  "matrix": { subtitulo: "The Matrix", anio: "1999", duracion: "2h 16m", calidad: "4K", imdb: "8.7",
    generos: ["Ciencia Ficción", "Acción"],
    sinopsis: "Un programador descubre que la realidad es una simulación creada por máquinas y se une a una rebelión para liberar a la humanidad.", video: "" },
  "blade runner": { subtitulo: "Blade Runner", anio: "1982", duracion: "1h 57m", calidad: "HD", imdb: "8.1",
    generos: ["Ciencia Ficción", "Drama", "Suspenso"],
    sinopsis: "Un cazador de androides persigue a un grupo de réplicas fugitivas en una Los Ángeles futurista y lluviosa.", video: "" },
  "star wars una nueva esperanza": { subtitulo: "Star Wars: Episode IV - A New Hope", anio: "1977", duracion: "2h 1m", calidad: "4K", imdb: "8.6",
    generos: ["Ciencia Ficción", "Aventura", "Acción"],
    sinopsis: "Un joven granjero se une a un caballero Jedi, un contrabandista y una princesa para enfrentar al Imperio Galáctico.", video: "" },
  "alien el octavo pasajero": { subtitulo: "Alien", anio: "1979", duracion: "1h 57m", calidad: "HD", imdb: "8.5",
    generos: ["Ciencia Ficción", "Terror"],
    sinopsis: "La tripulación de una nave comercial descubre que una criatura letal ha subido a bordo y los acecha uno a uno.", video: "" },
  "el origen": { subtitulo: "Inception", anio: "2010", duracion: "2h 28m", calidad: "4K", imdb: "8.8",
    generos: ["Ciencia Ficción", "Acción", "Suspenso"],
    sinopsis: "Un ladrón especializado en robar secretos a través de los sueños recibe la misión de implantar una idea en la mente de alguien.", video: "" },
  "avatar": { subtitulo: "Avatar", anio: "2009", duracion: "2h 42m", calidad: "HD", imdb: "7.9",
    generos: ["Ciencia Ficción", "Aventura", "Acción"],
    sinopsis: "Un exmarine entra en el cuerpo de un ser de otra especie en el planeta Pandora y debe elegir de qué lado está.", video: "" },
  "dune": { subtitulo: "Dune", anio: "2021", duracion: "2h 35m", calidad: "4K", imdb: "8.0",
    generos: ["Ciencia Ficción", "Aventura", "Drama"],
    sinopsis: "El joven Paul Atreides viaja al peligroso planeta desértico Arrakis, fuente de la sustancia más valiosa del universo.", video: "" },
  "volver al futuro": { subtitulo: "Back to the Future", anio: "1985", duracion: "1h 56m", calidad: "HD", imdb: "8.5",
    generos: ["Ciencia Ficción", "Comedia", "Aventura"],
    sinopsis: "Un adolescente viaja en el tiempo a 1955 en un auto modificado y debe asegurarse de que sus padres se enamoren.", video: "" },
  "parque jurásico": { subtitulo: "Jurassic Park", anio: "1993", duracion: "2h 7m", calidad: "4K", imdb: "8.2",
    generos: ["Ciencia Ficción", "Aventura"],
    sinopsis: "Un parque temático con dinosaurios clonados se sale de control cuando falla el sistema de seguridad.", video: "" },
  "et el extraterrestre": { subtitulo: "E.T. the Extra-Terrestrial", anio: "1982", duracion: "1h 55m", calidad: "HD", imdb: "7.9",
    generos: ["Ciencia Ficción", "Aventura", "Familia"],
    sinopsis: "Un niño esconde en su casa a un extraterrestre perdido y lo ayuda a regresar a su planeta antes de que el gobierno lo encuentre.", video: "" },
  "los juegos del hambre": { subtitulo: "The Hunger Games", anio: "2012", duracion: "2h 22m", calidad: "4K", imdb: "7.2",
    generos: ["Ciencia Ficción", "Acción", "Aventura"],
    sinopsis: "En un futuro distópico, una joven se ofrece como voluntaria para sustituir a su hermana en un cruel torneo televisado a muerte.", video: "" },
  "gravedad": { subtitulo: "Gravity", anio: "2013", duracion: "1h 31m", calidad: "HD", imdb: "7.7",
    generos: ["Ciencia Ficción", "Drama", "Suspenso"],
    sinopsis: "Dos astronautas quedan a la deriva en el espacio tras un accidente y deben encontrar la forma de regresar a la Tierra.", video: "" },
  "minority report": { subtitulo: "Minority Report", anio: "2002", duracion: "2h 25m", calidad: "4K", imdb: "7.6",
    generos: ["Ciencia Ficción", "Acción", "Misterio"],
    sinopsis: "En un futuro donde los crímenes se predicen antes de cometerse, un policía es acusado de un asesinato que aún no ha ocurrido.", video: "" },
  "ready player one": { subtitulo: "Ready Player One", anio: "2018", duracion: "2h 20m", calidad: "HD", imdb: "7.4",
    generos: ["Ciencia Ficción", "Aventura", "Acción"],
    sinopsis: "Un joven se sumerge en un mundo virtual en busca de un tesoro escondido que dará el control de ese universo a quien lo encuentre.", video: "" },
  "contacto": { subtitulo: "Contact", anio: "1997", duracion: "2h 30m", calidad: "4K", imdb: "7.5",
    generos: ["Ciencia Ficción", "Drama", "Misterio"],
    sinopsis: "Una científica recibe la primera señal de vida extraterrestre y se convierte en pieza clave del primer contacto.", video: "" },
  "la llegada": { subtitulo: "Arrival", anio: "2016", duracion: "1h 56m", calidad: "HD", imdb: "7.9",
    generos: ["Ciencia Ficción", "Drama", "Misterio"],
    sinopsis: "Una lingüista debe descifrar el idioma de unos visitantes alienígenas antes de que el mundo caiga en un conflicto.", video: "" },
  "yo robot": { subtitulo: "I, Robot", anio: "2004", duracion: "1h 55m", calidad: "4K", imdb: "7.1",
    generos: ["Ciencia Ficción", "Acción", "Misterio"],
    sinopsis: "En un futuro lleno de robots al servicio humano, un detective sospecha que una máquina cometió un asesinato.", video: "" },
  "star trek": { subtitulo: "Star Trek", anio: "2009", duracion: "2h 7m", calidad: "HD", imdb: "7.9",
    generos: ["Ciencia Ficción", "Aventura", "Acción"],
    sinopsis: "Una tripulación de jóvenes cadetes se une a bordo de la nave Enterprise para detener a un villano que viaja desde el futuro.", video: "" },
  "misión rescate": { subtitulo: "The Martian", anio: "2015", duracion: "2h 24m", calidad: "4K", imdb: "8.0",
    generos: ["Ciencia Ficción", "Drama", "Aventura"],
    sinopsis: "Un astronauta es dado por muerto y abandonado en Marte, donde debe ingeniárselas para sobrevivir hasta que lo rescaten.", video: "" },
  "ex machina": { subtitulo: "Ex Machina", anio: "2014", duracion: "1h 48m", calidad: "HD", imdb: "7.7",
    generos: ["Ciencia Ficción", "Drama", "Suspenso"],
    sinopsis: "Un programador es invitado a evaluar si una androide creada por su jefe tiene conciencia propia.", video: "" },
  "el rey león": { subtitulo: "The Lion King", anio: "1994", duracion: "1h 28m", calidad: "4K", imdb: "8.5",
    generos: ["Animación", "Aventura", "Drama"],
    sinopsis: "Un joven león huye tras la muerte de su padre y debe regresar para reclamar su lugar como rey de las Tierras del Reino.", video: "" },
  "toy story": { subtitulo: "Toy Story", anio: "1995", duracion: "1h 21m", calidad: "HD", imdb: "8.3",
    generos: ["Animación", "Comedia", "Aventura"],
    sinopsis: "Los juguetes de un niño cobran vida cuando él no está, y un vaquero y un astronauta de juguete tienen que aprender a convivir.", video: "" },
  "buscando a nemo": { subtitulo: "Finding Nemo", anio: "2003", duracion: "1h 40m", calidad: "4K", imdb: "8.2",
    generos: ["Animación", "Aventura", "Comedia"],
    sinopsis: "Un pez payaso cruza el océano en busca de su hijo, ayudado por una pez cirujano con muy mala memoria.", video: "" },
  "shrek": { subtitulo: "Shrek", anio: "2001", duracion: "1h 30m", calidad: "HD", imdb: "7.9",
    generos: ["Animación", "Comedia", "Aventura"],
    sinopsis: "Un ogro gruñón emprende una misión para rescatar a una princesa, acompañado por un burro muy parlanchín.", video: "" },
  "frozen una aventura congelada": { subtitulo: "Frozen", anio: "2013", duracion: "1h 42m", calidad: "4K", imdb: "7.4",
    generos: ["Animación", "Aventura", "Musical"],
    sinopsis: "Una joven se une a un montañés, su reno y un muñeco de nieve para encontrar a su hermana, que ha congelado el reino sin querer.", video: "" },
  "coco": { subtitulo: "Coco", anio: "2017", duracion: "1h 45m", calidad: "HD", imdb: "8.4",
    generos: ["Animación", "Aventura", "Musical"],
    sinopsis: "Un niño que sueña con ser músico viaja al mundo de los muertos para descubrir la historia de su familia.", video: "" },
  "up una aventura de altura": { subtitulo: "Up", anio: "2009", duracion: "1h 36m", calidad: "4K", imdb: "8.3",
    generos: ["Animación", "Aventura", "Comedia"],
    sinopsis: "Un anciano ata miles de globos a su casa para cumplir su sueño de viajar, sin saber que un niño explorador va a bordo.", video: "" },
  "intensamente": { subtitulo: "Inside Out", anio: "2015", duracion: "1h 35m", calidad: "HD", imdb: "8.1",
    generos: ["Animación", "Comedia", "Aventura"],
    sinopsis: "Las emociones que viven en la mente de una niña intentan ayudarla a superar una mudanza a una ciudad nueva.", video: "" },
  "el viaje de chihiro": { subtitulo: "Spirited Away", anio: "2001", duracion: "2h 5m", calidad: "4K", imdb: "8.6",
    generos: ["Animación", "Fantasía", "Aventura"],
    sinopsis: "Una niña queda atrapada en un mundo de espíritus y debe trabajar en una casa de baños para rescatar a sus padres.", video: "" },
  "mi vecino totoro": { subtitulo: "My Neighbor Totoro", anio: "1988", duracion: "1h 26m", calidad: "HD", imdb: "8.1",
    generos: ["Animación", "Fantasía", "Familia"],
    sinopsis: "Dos hermanas que se mudan al campo hacen amistad con unos espíritus del bosque, entre ellos el gigante Totoro.", video: "" },
  "los increíbles": { subtitulo: "The Incredibles", anio: "2004", duracion: "1h 55m", calidad: "4K", imdb: "8.0",
    generos: ["Animación", "Acción", "Familia"],
    sinopsis: "Una familia de superhéroes retirados vuelve a la acción para detener a un enemigo que amenaza a la ciudad.", video: "" },
  "ratatouille": { subtitulo: "Ratatouille", anio: "2007", duracion: "1h 51m", calidad: "HD", imdb: "8.1",
    generos: ["Animación", "Comedia", "Familia"],
    sinopsis: "Una rata con un gran talento para la cocina se alía con un joven aprendiz en un famoso restaurante de París.", video: "" },
  "walle": { subtitulo: "WALL-E", anio: "2008", duracion: "1h 38m", calidad: "4K", imdb: "8.4",
    generos: ["Animación", "Ciencia Ficción", "Romance"],
    sinopsis: "Un pequeño robot que limpia la Tierra abandonada conoce a una robot exploradora y la sigue a través del espacio.", video: "" },
  "kung fu panda": { subtitulo: "Kung Fu Panda", anio: "2008", duracion: "1h 32m", calidad: "HD", imdb: "7.6",
    generos: ["Animación", "Acción", "Comedia"],
    sinopsis: "Un panda perezoso y amante de la comida es elegido por sorpresa como el Guerrero Dragón.", video: "" },
  "moana un mar de aventuras": { subtitulo: "Moana", anio: "2016", duracion: "1h 47m", calidad: "4K", imdb: "7.6",
    generos: ["Animación", "Aventura", "Musical"],
    sinopsis: "Una joven navegante cruza el océano junto al semidiós Maui para salvar a su isla y devolver el corazón de una diosa.", video: "" },
  "cómo entrenar a tu dragón": { subtitulo: "How to Train Your Dragon", anio: "2010", duracion: "1h 38m", calidad: "HD", imdb: "8.1",
    generos: ["Animación", "Aventura", "Fantasía"],
    sinopsis: "Un joven vikingo que debía cazar dragones se hace amigo de uno de ellos y cambia para siempre la vida de su aldea.", video: "" },
  "encanto": { subtitulo: "Encanto", anio: "2021", duracion: "1h 42m", calidad: "4K", imdb: "7.2",
    generos: ["Animación", "Comedia", "Musical"],
    sinopsis: "En una casa mágica de Colombia, una joven es la única de su familia que no ha recibido un don especial.", video: "" },
  "aladdín": { subtitulo: "Aladdin", anio: "1992", duracion: "1h 30m", calidad: "HD", imdb: "8.0",
    generos: ["Animación", "Aventura", "Musical"],
    sinopsis: "Un joven ladrón encuentra una lámpara mágica con un genio dentro y se hace pasar por príncipe para conquistar a Jazmín.", video: "" },
  "la bella y la bestia": { subtitulo: "Beauty and the Beast", anio: "1991", duracion: "1h 24m", calidad: "4K", imdb: "8.0",
    generos: ["Animación", "Romance", "Musical"],
    sinopsis: "Una joven se queda prisionera en el castillo de una bestia y descubre que detrás de su aspecto hay un buen corazón.", video: "" },
  "zootrópolis": { subtitulo: "Zootopia", anio: "2016", duracion: "1h 48m", calidad: "HD", imdb: "8.0",
    generos: ["Animación", "Aventura", "Comedia"],
    sinopsis: "Una coneja policía y un zorro astuto investigan una conspiración en una ciudad habitada solo por animales.", video: "" },
  "el padrino": { subtitulo: "The Godfather", anio: "1972", duracion: "2h 55m", calidad: "4K", imdb: "9.2",
    generos: ["Drama", "Crimen"],
    sinopsis: "El patriarca de una poderosa familia mafiosa entrega el control a su hijo menor, quien se ve arrastrado al negocio familiar.", video: "" },
  "forrest gump": { subtitulo: "Forrest Gump", anio: "1994", duracion: "2h 22m", calidad: "HD", imdb: "8.8",
    generos: ["Drama", "Romance"],
    sinopsis: "Un hombre de gran corazón y pocas luces vive, sin proponérselo, algunos de los momentos más importantes de la historia de su país.", video: "" },
  "cadena perpetua": { subtitulo: "The Shawshank Redemption", anio: "1994", duracion: "2h 22m", calidad: "4K", imdb: "9.3",
    generos: ["Drama"],
    sinopsis: "Un banquero condenado injustamente forma una amistad en prisión y mantiene viva la esperanza durante décadas.", video: "" },
  "la lista de schindler": { subtitulo: "Schindler's List", anio: "1993", duracion: "3h 15m", calidad: "HD", imdb: "9.0",
    generos: ["Drama", "Historia", "Bélica"],
    sinopsis: "Un empresario alemán salva la vida de más de mil judíos empleándolos en su fábrica durante la Segunda Guerra Mundial.", video: "" },
  "el club de la pelea": { subtitulo: "Fight Club", anio: "1999", duracion: "2h 19m", calidad: "4K", imdb: "8.8",
    generos: ["Drama", "Suspenso"],
    sinopsis: "Un oficinista insomne conoce a un vendedor de jabones carismático y juntos fundan un club clandestino de peleas.", video: "" },
  "una mente brillante": { subtitulo: "A Beautiful Mind", anio: "2001", duracion: "2h 15m", calidad: "HD", imdb: "8.2",
    generos: ["Drama", "Biografía"],
    sinopsis: "La vida del matemático John Nash, un genio que enfrenta una enfermedad mental mientras persigue sus ideas.", video: "" },
  "la milla verde": { subtitulo: "The Green Mile", anio: "1999", duracion: "3h 9m", calidad: "4K", imdb: "8.6",
    generos: ["Drama", "Fantasía"],
    sinopsis: "Un guardia de una prisión conoce a un condenado a muerte con un don extraordinario que cambia a todos a su alrededor.", video: "" },
  "el pianista": { subtitulo: "The Pianist", anio: "2002", duracion: "2h 30m", calidad: "HD", imdb: "8.5",
    generos: ["Drama", "Biografía", "Bélica"],
    sinopsis: "Un pianista judío polaco lucha por sobrevivir a la ocupación nazi de Varsovia.", video: "" },
  "parásitos": { subtitulo: "Parasite", anio: "2019", duracion: "2h 12m", calidad: "4K", imdb: "8.5",
    generos: ["Drama", "Suspenso", "Comedia"],
    sinopsis: "Una familia pobre se infiltra poco a poco en la vida de una familia adinerada, con consecuencias inesperadas.", video: "" },
  "el lobo de wall street": { subtitulo: "The Wolf of Wall Street", anio: "2013", duracion: "3h 0m", calidad: "HD", imdb: "8.2",
    generos: ["Drama", "Biografía", "Comedia"],
    sinopsis: "El ascenso y la caída de un corredor de bolsa que construyó una fortuna a base de fraude, excesos y ambición.", video: "" },
  "joker": { subtitulo: "Joker", anio: "2019", duracion: "2h 2m", calidad: "4K", imdb: "8.4",
    generos: ["Drama", "Crimen", "Suspenso"],
    sinopsis: "Un comediante fracasado que vive al margen de Ciudad Gótica se va hundiendo en la locura hasta convertirse en un símbolo del caos.", video: "" },
  "whiplash": { subtitulo: "Whiplash", anio: "2014", duracion: "1h 47m", calidad: "HD", imdb: "8.5",
    generos: ["Drama", "Música"],
    sinopsis: "Un joven baterista entra a un conservatorio de élite y choca con un profesor tan brillante como despiadado.", video: "" },
  "en busca del destino": { subtitulo: "Good Will Hunting", anio: "1997", duracion: "2h 6m", calidad: "4K", imdb: "8.3",
    generos: ["Drama", "Romance"],
    sinopsis: "Un joven conserje con un talento matemático extraordinario aprende a enfrentar su pasado con ayuda de un terapeuta.", video: "" },
  "rocky": { subtitulo: "Rocky", anio: "1976", duracion: "2h 0m", calidad: "HD", imdb: "8.1",
    generos: ["Drama", "Deporte"],
    sinopsis: "Un modesto boxeador de Filadelfia recibe la oportunidad de pelear por el título mundial de los pesos pesados.", video: "" },
  "seven los siete pecados capitales": { subtitulo: "Se7en", anio: "1995", duracion: "2h 7m", calidad: "4K", imdb: "8.6",
    generos: ["Drama", "Crimen", "Misterio"],
    sinopsis: "Dos detectives persiguen a un asesino en serie que basa sus crímenes en los siete pecados capitales.", video: "" },
  "la vida es bella": { subtitulo: "Life Is Beautiful", anio: "1997", duracion: "1h 56m", calidad: "HD", imdb: "8.6",
    generos: ["Drama", "Comedia", "Bélica"],
    sinopsis: "Un padre usa la imaginación y el humor para proteger a su hijo del horror de un campo de concentración.", video: "" },
  "el discurso del rey": { subtitulo: "The King's Speech", anio: "2010", duracion: "1h 58m", calidad: "4K", imdb: "8.0",
    generos: ["Drama", "Biografía", "Historia"],
    sinopsis: "El futuro rey de Inglaterra trabaja con un terapeuta poco convencional para superar su tartamudez.", video: "" },
  "oppenheimer": { subtitulo: "Oppenheimer", anio: "2023", duracion: "3h 0m", calidad: "HD", imdb: "8.3",
    generos: ["Drama", "Biografía", "Historia"],
    sinopsis: "La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica durante la Segunda Guerra Mundial.", video: "" },
  "el renacido": { subtitulo: "The Revenant", anio: "2015", duracion: "2h 36m", calidad: "4K", imdb: "8.0",
    generos: ["Drama", "Aventura", "Acción"],
    sinopsis: "Un cazador abandonado a su suerte en la naturaleza salvaje emprende un viaje desesperado para sobrevivir y vengarse.", video: "" },
  "la sociedad de los poetas muertos": { subtitulo: "Dead Poets Society", anio: "1989", duracion: "2h 8m", calidad: "HD", imdb: "8.1",
    generos: ["Drama"],
    sinopsis: "Un profesor poco convencional inspira a sus alumnos de un colegio estricto a pensar por sí mismos y vivir con pasión.", video: "" }
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
  if (elemPoster) {
    // Si el póster no existe o no carga, se muestra un cartel con el título
    // y el fondo oscuro, para que el texto siga leyéndose bien.
    const mostrarRespaldo = function () {
      elemPoster.onerror = null;
      elemPoster.style.display = 'none';
      if (contenedor) contenedor.style.backgroundImage = 'none';
      if (document.querySelector('.detalle-poster-respaldo')) return;
      const caja = document.createElement('div');
      caja.className = 'detalle-poster detalle-poster-respaldo';
      caja.setAttribute('role', 'img');
      caja.setAttribute('aria-label', titulo);
      const icono = document.createElement('span');
      icono.textContent = '🎬';
      const texto = document.createElement('strong');
      texto.textContent = titulo;
      caja.appendChild(icono);
      caja.appendChild(texto);
      elemPoster.insertAdjacentElement('afterend', caja);
    };
    elemPoster.onerror = mostrarRespaldo;
    if (poster) elemPoster.setAttribute('src', poster); else mostrarRespaldo();
  }
  if (contenedor && poster) contenedor.style.backgroundImage = 'url("' + poster + '")';

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

  if (!loginForm) return; // Esta página no tiene formulario de login

  let intentos = 0; // Contador de intentos

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    // Validación de las dos cuentas
    const esAdmin67 = email === "administrador67@gmail.com" && password === "chock000";
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
