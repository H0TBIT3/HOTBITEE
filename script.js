const PRODUCTOS = [
  { id: "gomi-bite", nombre: "Gomi Bite 0.1", imagen: "GOMI BITE.jpeg", categoria: "cajas", precio: 26000 },
  { id: "gomi-2-0", nombre: "Gomi 2.0", imagen: "GOMI 2.0.jpeg", categoria: "bandejas", precio: 34000 },
  { id: "fruti-hot", nombre: "Fruti Hot 0.1", imagen: "FRUTI HOT.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-rush", nombre: "Gomi Rush", imagen: "GOMI RUSH.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-rush-pe", nombre: "Gomi Rush 0.1", imagen: "GOMI RUSH PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-love", nombre: "Gomi Love", imagen: "GOMI LOVE.jpeg", categoria: "bandejas", precio: 33000 },
  { id: "gomi-love-pe", nombre: "Gomi Love 0.1", imagen: "GOMI LOVE PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-crazy", nombre: "Gomi Crazy", imagen: "GOMI CRAZY.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-crazy-pe", nombre: "Gomi Crazy 0.1", imagen: "GOMI CRAZY PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-hot", nombre: "Gomi Hot", imagen: "GOMI HOT.jpeg", categoria: "bandejas", precio: 34000 },
  { id: "gomi-hot-pe", nombre: "Gomi Hot 0.1", imagen: "GOMI HOT PE.jpeg", categoria: "cajas", precio: 22000 },
  { id: "gomi-fusion", nombre: "Gomi Fusion", imagen: "GOMI FUSION.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-fusion-pe", nombre: "Gomi Fusion 0.1", imagen: "GOMI FUSION PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-boom", nombre: "Gomi Boom", imagen: "GOMI BOOM.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-boom-pe", nombre: "Gomi Boom 0.1", imagen: "GOMI BOOM PE.jpeg", categoria: "cajas", precio: 26000 },
  { id: "gomi-extrem", nombre: "Gomi Extrem", imagen: "GOMI EXTREM.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-extrem-pe", nombre: "Gomi Extrem 0.1", imagen: "GOMI EXTREM PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-fire", nombre: "Gomi Fire", imagen: "GOMI FIRE.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-fire-pe", nombre: "Gomi Fire 0.1", imagen: "GOMI FIRE PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-volcanic", nombre: "Gomi Volcanic", imagen: "GOMI VOLCANIC.jpeg", categoria: "bandejas", precio: 38000 },
  { id: "gomi-volcanic-pe", nombre: "Gomi Volcanic 0.1", imagen: "GOMI VOLCANIC PE.jpeg", categoria: "cajas", precio: 26000 }
];

const TELEFONO_WHATSAPP = "573216554791";
const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});
const productosPorId = new Map(PRODUCTOS.map((producto) => [producto.id, producto]));
const carrito = new Map();
const favoritos = new Set();

const listaProductos = document.querySelector("#lista-productos");
const contadorProductos = document.querySelector("#contador-productos");
const contadorCarrito = document.querySelector("#contador-carrito");
const contadorFavoritos = document.querySelector("#contador-favoritos");
const listaCarrito = document.querySelector("#lista-carrito");
const listaFavoritos = document.querySelector("#lista-favoritos");
const subtotalCarrito = document.querySelector("#subtotal-carrito");
const filaDescuento = document.querySelector("#fila-descuento");
const descuentoCarrito = document.querySelector("#descuento-carrito");
const mensajeDescuento = document.querySelector("#mensaje-descuento");
const totalCarrito = document.querySelector("#total-carrito");
const overlay = document.querySelector("#overlay");
const panelCarrito = document.querySelector("#panel-carrito");
const panelFavoritos = document.querySelector("#panel-favoritos");

function crearImagen(producto, clase = "") {
  const imagen = document.createElement("img");
  imagen.src = encodeURI(producto.imagen);
  imagen.alt = `${producto.nombre} Hot Bite`;
  imagen.loading = "lazy";
  if (clase) imagen.className = clase;
  return imagen;
}

function renderizarProductos(filtro = "todos") {
  const visibles = PRODUCTOS.filter((producto) =>
    filtro === "todos" || producto.categoria === filtro
  );

  listaProductos.replaceChildren();
  visibles.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "card";

    const botonFavorito = document.createElement("button");
    botonFavorito.className = `fav${favoritos.has(producto.id) ? " is-on" : ""}`;
    botonFavorito.type = "button";
    botonFavorito.dataset.accion = "favorito";
    botonFavorito.dataset.id = producto.id;
    botonFavorito.setAttribute("aria-label", `${favoritos.has(producto.id) ? "Quitar" : "Agregar"} ${producto.nombre} ${favoritos.has(producto.id) ? "de" : "a"} favoritos`);
    botonFavorito.setAttribute("aria-pressed", String(favoritos.has(producto.id)));
    botonFavorito.textContent = "♥";

    const cuerpo = document.createElement("div");
    cuerpo.className = "card-body";

    const categoria = document.createElement("p");
    categoria.className = "card-cat";
    categoria.textContent = producto.categoria === "cajas" ? "Personal" : "Bandeja para compartir";

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "card-price";
    precio.textContent = producto.precio === undefined
      ? "Precio por cotizar"
      : formatoPrecio.format(producto.precio);

    const botonAgregar = document.createElement("button");
    botonAgregar.className = "btn";
    botonAgregar.type = "button";
    botonAgregar.dataset.accion = "agregar";
    botonAgregar.dataset.id = producto.id;
    botonAgregar.textContent = "Agregar al carrito";

    cuerpo.append(categoria, titulo, precio, botonAgregar);
    tarjeta.append(botonFavorito, crearImagen(producto), cuerpo);
    listaProductos.append(tarjeta);
  });

  contadorProductos.textContent = `${visibles.length} ${visibles.length === 1 ? "producto encontrado" : "productos encontrados"}`;
}

function actualizarFiltros(filtro) {
  document.querySelectorAll("[data-filtro]").forEach((boton) => {
    const activo = boton.dataset.filtro === filtro;
    boton.classList.toggle("is-active", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });
  renderizarProductos(filtro);
}

function actualizarContadores() {
  const totalUnidades = [...carrito.values()].reduce((suma, cantidad) => suma + cantidad, 0);
  const aplicaDescuento = totalUnidades >= 4;
  const productosPorCotizar = [...carrito.keys()].some((id) => productosPorId.get(id).precio === undefined);
  const subtotal = [...carrito].reduce((suma, [id, cantidad]) => {
    const precio = productosPorId.get(id).precio;
    return precio === undefined ? suma : suma + precio * cantidad;
  }, 0);
  const descuento = aplicaDescuento ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - descuento;
  contadorCarrito.textContent = String(totalUnidades);
  contadorFavoritos.textContent = String(favoritos.size);
  subtotalCarrito.textContent = formatoPrecio.format(subtotal);
  filaDescuento.hidden = descuento === 0;
  descuentoCarrito.textContent = `-${formatoPrecio.format(descuento)}`;
  totalCarrito.textContent = `${formatoPrecio.format(total)}${productosPorCotizar ? " + productos por cotizar" : ""}`;
  mensajeDescuento.classList.toggle("descuento-obtenido", aplicaDescuento);
  mensajeDescuento.textContent = aplicaDescuento
    ? "¡Descuento obtenido! Se aplicó 10% a los precios de tu pedido."
    : `Agrega ${4 - totalUnidades} ${4 - totalUnidades === 1 ? "producto más" : "productos más"} para obtener 10% de descuento.`;
}

function renderizarLista(lista, ids, tipo) {
  lista.replaceChildren();
  if (!ids.length) {
    const vacio = document.createElement("li");
    vacio.className = "vacio";
    vacio.textContent = tipo === "carrito"
      ? "Tu carrito está vacío. Agrega productos del catálogo."
      : "Todavía no tienes productos favoritos.";
    lista.append(vacio);
    return;
  }

  ids.forEach((id) => {
    const producto = productosPorId.get(id);
    if (!producto) return;

    const elemento = document.createElement("li");
    elemento.className = "item";
    elemento.append(crearImagen(producto));

    const detalles = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;
    detalles.append(titulo);

    if (tipo === "carrito") {
      const cantidad = carrito.get(id);
      const unidadesEnCarrito = [...carrito.values()].reduce((suma, unidades) => suma + unidades, 0);
      const precioNormal = document.createElement("p");
      precioNormal.textContent = producto.precio === undefined
        ? `Cantidad: ${cantidad} · Precio por cotizar`
        : `Precio normal (${cantidad}): ${formatoPrecio.format(producto.precio * cantidad)}`;
      detalles.append(precioNormal);

      if (producto.precio !== undefined && unidadesEnCarrito >= 4) {
        precioNormal.className = "price-before";
        const precioConDescuento = document.createElement("p");
        precioConDescuento.className = "price-after";
        precioConDescuento.textContent = `Con 10% de descuento: ${formatoPrecio.format(Math.round(producto.precio * cantidad * 0.9))}`;
        detalles.append(precioConDescuento);
      } else if (producto.precio !== undefined) {
        precioNormal.textContent += ` · ${formatoPrecio.format(producto.precio)} c/u`;
      }
    } else {
      const categoria = document.createElement("p");
      categoria.textContent = producto.categoria === "cajas" ? "Personal" : "Bandeja para compartir";
      detalles.append(categoria);
    }

    const acciones = document.createElement("div");
    acciones.className = "item-actions";
    if (tipo === "carrito") {
      acciones.append(
        crearBotonAccion("−", "disminuir", id, `Quitar una unidad de ${producto.nombre}`),
        crearBotonAccion("+", "aumentar", id, `Agregar una unidad de ${producto.nombre}`)
      );
    }
    acciones.append(crearBotonAccion("×", tipo === "carrito" ? "eliminar-carrito" : "quitar-favorito", id, `Quitar ${producto.nombre}`));
    elemento.append(detalles, acciones);
    lista.append(elemento);
  });
}

function crearBotonAccion(texto, accion, id, etiqueta) {
  const boton = document.createElement("button");
  boton.className = "mini";
  boton.type = "button";
  boton.dataset.accion = accion;
  boton.dataset.id = id;
  boton.setAttribute("aria-label", etiqueta);
  boton.textContent = texto;
  return boton;
}

function actualizarCarrito() {
  renderizarLista(listaCarrito, [...carrito.keys()], "carrito");
  actualizarContadores();
}

function actualizarFavoritos() {
  renderizarLista(listaFavoritos, [...favoritos], "favoritos");
  actualizarContadores();
}

function abrirPanel(panel) {
  [panelCarrito, panelFavoritos].forEach((elemento) => {
    const abierto = elemento === panel;
    elemento.classList.toggle("abierto", abierto);
    elemento.setAttribute("aria-hidden", String(!abierto));
  });
  overlay.hidden = false;
  document.body.classList.add("bloqueado");
}

function cerrarPanel() {
  [panelCarrito, panelFavoritos].forEach((panel) => {
    panel.classList.remove("abierto");
    panel.setAttribute("aria-hidden", "true");
  });
  overlay.hidden = true;
  document.body.classList.remove("bloqueado");
}

function gestionarAccion(boton) {
  const { accion, id } = boton.dataset;
  if (!productosPorId.has(id)) return;

  if (accion === "agregar" || accion === "aumentar") {
    carrito.set(id, (carrito.get(id) || 0) + 1);
    actualizarCarrito();
  } else if (accion === "disminuir" || accion === "eliminar-carrito") {
    const cantidad = carrito.get(id) || 0;
    if (accion === "eliminar-carrito" || cantidad <= 1) carrito.delete(id);
    else carrito.set(id, cantidad - 1);
    actualizarCarrito();
  } else if (accion === "favorito") {
    if (favoritos.has(id)) favoritos.delete(id);
    else favoritos.add(id);
    actualizarFavoritos();
    renderizarProductos(document.querySelector("[data-filtro].is-active")?.dataset.filtro || "todos");
  } else if (accion === "quitar-favorito") {
    favoritos.delete(id);
    actualizarFavoritos();
    renderizarProductos(document.querySelector("[data-filtro].is-active")?.dataset.filtro || "todos");
  }
}

document.addEventListener("click", (evento) => {
  const botonAccion = evento.target.closest("[data-accion]");
  if (botonAccion) {
    gestionarAccion(botonAccion);
    return;
  }

  const botonFiltro = evento.target.closest("[data-filtro]");
  if (botonFiltro) {
    actualizarFiltros(botonFiltro.dataset.filtro);
    return;
  }

  if (evento.target.closest("#abrir-carrito")) abrirPanel(panelCarrito);
  if (evento.target.closest("#abrir-favoritos")) abrirPanel(panelFavoritos);
  if (evento.target.closest("[data-cerrar]") || evento.target === overlay) cerrarPanel();
});

document.querySelector("#vaciar-carrito").addEventListener("click", () => {
  carrito.clear();
  actualizarCarrito();
});

document.querySelector("#comprar-whatsapp").addEventListener("click", () => {
  if (!carrito.size) {
    abrirPanel(panelCarrito);
    return;
  }

  const lineas = [...carrito].map(([id, cantidad]) => {
    const producto = productosPorId.get(id);
    const precio = producto.precio === undefined
      ? "precio por cotizar"
      : `${formatoPrecio.format(producto.precio)} c/u (subtotal ${formatoPrecio.format(producto.precio * cantidad)})`;
    return `- ${producto.nombre}: ${cantidad} · ${precio}`;
  });
  const totalUnidades = [...carrito.values()].reduce((suma, cantidad) => suma + cantidad, 0);
  const subtotal = [...carrito].reduce((suma, [id, cantidad]) => {
    const precio = productosPorId.get(id).precio;
    return precio === undefined ? suma : suma + precio * cantidad;
  }, 0);
  const descuento = totalUnidades >= 4 ? Math.round(subtotal * 0.1) : 0;
  const productosPorCotizar = [...carrito.keys()].some((id) => productosPorId.get(id).precio === undefined);
  const mensaje = [
    "Hola, quiero hacer este pedido de Hot Bite:",
    ...lineas,
    `Subtotal: ${formatoPrecio.format(subtotal)}`,
    ...(descuento ? [`Descuento por comprar 4 o más productos (10%): -${formatoPrecio.format(descuento)}`] : []),
    `Total: ${formatoPrecio.format(subtotal - descuento)}${productosPorCotizar ? " + productos por cotizar" : ""}`,
    "",
    "Por favor, confirmen la disponibilidad."
  ].join("\n");
  window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener");
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") cerrarPanel();
});

actualizarFiltros("todos");
actualizarCarrito();
actualizarFavoritos();
