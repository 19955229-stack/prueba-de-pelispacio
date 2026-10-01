/* ==========================================================
   PeliSpacio - menu.js
   1) Menú lateral (hogar, series, animes, películas premium):
      se pliega / despliega hacia la IZQUIERDA.
   2) Menú principal (proyecto, películas, planes, nosotros,
      contacto): se pliega / despliega hacia ARRIBA.
   Recuerda el estado con localStorage.
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {

  function leer(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }
  // Quita la clase que desactiva las animaciones, una vez pintada la página
  function activarAnimaciones(elemento) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { elemento.classList.remove('sin-anim'); });
    });
  }

  /* ---------- 1) MENÚ LATERAL → izquierda ---------- */
  const app = document.querySelector('.app-container');
  const btnLateral = document.getElementById('sidebar-toggle');

  if (app && btnLateral) {
    const CLAVE_LATERAL = 'pelispacio_menu_lateral';
    const esMovil = window.matchMedia('(max-width: 768px)').matches;
    const icono = btnLateral.querySelector('i');

    function aplicarLateral(plegado) {
      app.classList.toggle('menu-plegado', plegado);
      btnLateral.setAttribute('aria-expanded', String(!plegado));
      btnLateral.setAttribute('aria-label', plegado ? 'Desplegar menú' : 'Plegar menú');
      if (icono) {
        icono.className = plegado ? 'fa-solid fa-bars' : 'fa-solid fa-angles-left';
      }
    }

    app.classList.add('sin-anim');
    // En móvil empieza plegado; en escritorio recuerda lo último elegido
    aplicarLateral(esMovil ? true : leer(CLAVE_LATERAL) === 'plegado');
    activarAnimaciones(app);

    btnLateral.addEventListener('click', function () {
      const plegar = !app.classList.contains('menu-plegado');
      aplicarLateral(plegar);
      if (!esMovil) guardar(CLAVE_LATERAL, plegar ? 'plegado' : 'abierto');
    });
  }

  /* ---------- 2) MENÚ PRINCIPAL → arriba ---------- */
  const menu = document.querySelector('.menu-principal');
  const btnArriba = document.getElementById('menu-toggle-arriba');

  if (menu && btnArriba) {
    const CLAVE_PRINCIPAL = 'pelispacio_menu_principal';
    const texto = btnArriba.querySelector('.menu-toggle-texto');

    function aplicarPrincipal(plegado) {
      menu.classList.toggle('plegado', plegado);
      btnArriba.setAttribute('aria-expanded', String(!plegado));
      if (texto) texto.textContent = plegado ? 'Mostrar menú' : 'Ocultar menú';
    }

    menu.classList.add('sin-anim');
    aplicarPrincipal(leer(CLAVE_PRINCIPAL) === 'plegado');
    activarAnimaciones(menu);

    btnArriba.addEventListener('click', function () {
      const plegar = !menu.classList.contains('plegado');
      aplicarPrincipal(plegar);
      guardar(CLAVE_PRINCIPAL, plegar ? 'plegado' : 'abierto');
    });
  }
});
