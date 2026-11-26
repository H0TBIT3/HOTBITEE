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
  { id: "gomi-fusion-pe", nombre: "Gomi Fusion 0.1", imagen: "GOMI FUSION PE.jpeg", categoria: "cajas", precio: 25000 },
  { id: "gomi-boom", nombre: "Gomi Boom", imagen: "GOMI BOOM.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-boom-pe", nombre: "Gomi Boom 0.1", imagen: "GOMI BOOM PE.jpeg", categoria: "cajas", precio: 26000 },
  { id: "gomi-extrem", nombre: "Gomi Extrem", imagen: "GOMI EXTREM.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-extrem-pe", nombre: "Gomi Extrem 0.1", imagen: "GOMI EXTREM PE.jpeg", categoria: "cajas", precio: 24000 },
  { id: "gomi-fire", nombre: "Gomi Fire", imagen: "GOMI FIRE.jpeg", categoria: "bandejas", precio: 36000 },
  { id: "gomi-fire-pe", nombre: "Gomi Fire 0.1", imagen: "GOMI FIRE PE.jpeg", categoria: "cajas", precio: 25000 },
  { id: "gomi-volcanic", nombre: "Gomi Volcanic", imagen: "GOMI VOLCANIC.jpeg", categoria: "bandejas", precio: 38000 },
  { id: "gomi-volcanic-pe", nombre: "Gomi Volcanic 0.1", imagen: "GOMI VOLCANIC PE.jpeg", categoria: "cajas", precio: 26000 },
  { id: "sencilla-p18", nombre: "Sencilla 0.2", imagen: "P18.jpeg", categoria: "sencilla", precio: 18000 },
  { id: "sencilla-p12", nombre: "Sencilla 0.1", imagen: "P12.jpeg", categoria: "sencilla", precio: 12000 }
];

const TELEFONO_WHATSAPP = "573216554791";
const PRECIO_TRIO_PERSONALIZADO = 24000;
const OPCIONES_TRIO = [
  {
    id: "frutas",
    titulo: "Frutas",
    opciones: ["Mango rayado", "Mango en cuadro", "Piña", "Mamoncillo", "Guayaba"]
  },
  {
    id: "gomitas",
    titulo: "Gomitas",
    opciones: ["Enchiladas", "Sin enchilar", "Ácidas"]
  },
  {
    id: "takis",
    titulo: "Takis",
    opciones: ["Rojos", "Azules"]
  }
];
const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});
const productosPorId = new Map(PRODUCTOS.map((producto) => [producto.id, producto]));
const supabaseClient = window.HOTBITE_SUPABASE_CLIENT;
let disponibilidad = {};
let disponibilidadCargada = false;
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
const opcionesTrio = document.querySelector("#opciones-trio");
const contadorTrio = document.querySelector("#trio-contador");
const seleccionTrio = document.querySelector("#trio-seleccion");
const precioTrio = document.querySelector("#trio-precio");
const botonAgregarTrio = document.querySelector("#agregar-trio");
const activarExtraTrio = document.querySelector("#activar-extra-trio");
const camposExtraTrio = document.querySelector("#campos-extra-trio");
const extraTrio = document.querySelector("#extra-trio");
const builderTrio = document.querySelector("#crear-trio");
const botonCerrarTrio = document.querySelector("#cerrar-trio");
const estadoSincronizacion = document.querySelector("#sync-status");
const seleccionActualTrio = new Set();

function productoDisponible(id) {
  return disponibilidadCargada && disponibilidad[id] !== false;
}

function mostrarErrorSincronizacion(mensaje) {
  estadoSincronizacion.textContent = mensaje;
  estadoSincronizacion.hidden = false;
}

function actualizarVistaDisponibilidad() {
  const filtroActivo = document.querySelector("[data-filtro].is-active")?.dataset.filtro || "todos";
  renderizarProductos(filtroActivo);
  renderizarOpcionesTrio();
  actualizarCarrito();
}

async function cargarDisponibilidad() {
  const { data, error } = await supabaseClient
    .from("inventory_availability")
    .select("product_id, is_available");
  if (error) throw error;

  disponibilidad = Object.fromEntries(
    data.filter((producto) => !producto.is_available).map((producto) => [producto.product_id, false])
  );
  disponibilidadCargada = true;
  actualizarVistaDisponibilidad();
}

function enviarPedidoWhatsApp(mensaje) {
  const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.location.assign(url);
}

function crearImagen(producto, clase = "") {
  const imagen = document.createElement("img");
  imagen.src = encodeURI(producto.imagen);
  imagen.alt = `${producto.nombre} Hot Bite`;
  imagen.loading = "lazy";
  if (clase) imagen.className = clase;
  return imagen;
}

function renderizarOpcionesTrio() {
  for (const clave of seleccionActualTrio) {
    const [grupo, opcion] = clave.split("|");
    if (!productoDisponible(`trio|${grupo}|${opcion}`)) seleccionActualTrio.delete(clave);
  }

  opcionesTrio.replaceChildren();

  OPCIONES_TRIO.forEach((grupo) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "trio-group";

    const legend = document.createElement("legend");
    legend.textContent = grupo.titulo;
    fieldset.append(legend);

    grupo.opciones.forEach((opcion) => {
      const label = document.createElement("label");
      label.className = "trio-option";

      const checkbox = document.createElement("input");
      const clave = `${grupo.id}|${opcion}`;
      checkbox.type = "checkbox";
      checkbox.value = opcion;
      checkbox.dataset.grupo = grupo.id;
      checkbox.dataset.opcion = opcion;
      checkbox.checked = seleccionActualTrio.has(clave);
      checkbox.disabled = !disponibilidadCargada || !productoDisponible(`trio|${clave}`)
        || (!checkbox.checked && seleccionActualTrio.size >= 3);

      const texto = document.createElement("span");
      texto.textContent = opcion;
      label.append(checkbox, texto);
      fieldset.append(label);
    });

    opcionesTrio.append(fieldset);
  });

  actualizarResumenTrio();
}

function actualizarResumenTrio() {
  contadorTrio.textContent = `${seleccionActualTrio.size} de 3 elegidos`;
  precioTrio.textContent = `Precio del trío: ${formatoPrecio.format(PRECIO_TRIO_PERSONALIZADO)}`;

  if (seleccionActualTrio.size === 3) {
    const nombres = OPCIONES_TRIO.flatMap((grupo) =>
      grupo.opciones.filter((opcion) => seleccionActualTrio.has(`${grupo.id}|${opcion}`))
    );
    seleccionTrio.textContent = nombres.join(" + ");
    botonAgregarTrio.disabled = false;
  } else {
    seleccionTrio.textContent = "Aún no has elegido tus 3 productos.";
    botonAgregarTrio.disabled = true;
  }
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
    categoria.textContent = producto.categoria === "cajas"
      ? "Personal"
      : producto.categoria === "sencilla" ? "Sencilla" : "Bandeja para compartir";

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "card-price";
    precio.textContent = producto.precio === undefined
      ? "Precio por cotizar"
      : formatoPrecio.format(producto.precio);

    const disponible = productoDisponible(producto.id);
    const estado = document.createElement("p");
    estado.className = `product-availability${disponible ? "" : " is-unavailable"}`;
    estado.textContent = !disponibilidadCargada
      ? "Verificando disponibilidad…"
      : disponible ? "Disponible" : "No disponible";

    const botonAgregar = document.createElement("button");
    botonAgregar.className = "btn";
    botonAgregar.type = "button";
    botonAgregar.dataset.accion = "agregar";
    botonAgregar.dataset.id = producto.id;
    botonAgregar.textContent = !disponibilidadCargada
      ? "Cargando disponibilidad"
      : disponible ? "Pedir por WhatsApp" : "No disponible";
    botonAgregar.dataset.accion = "pedir-whatsapp";
    botonAgregar.disabled = !disponible;

    const botonCarrito = document.createElement("button");
    botonCarrito.className = "btn btn-outline card-cart-btn";
    botonCarrito.type = "button";
    botonCarrito.dataset.accion = "agregar";
    botonCarrito.dataset.id = producto.id;
    botonCarrito.textContent = !disponibilidadCargada
      ? "Cargando disponibilidad"
      : "Agregar al carrito";
    botonCarrito.disabled = !disponible;

    cuerpo.append(categoria, titulo, precio, estado, botonAgregar, botonCarrito);
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
      if (!productoDisponible(id)) {
        const estado = document.createElement("p");
        estado.className = "product-availability is-unavailable";
        estado.textContent = "No disponible actualmente";
        detalles.append(estado);
      }
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
      categoria.textContent = producto.categoria === "cajas"
        ? "Personal"
        : producto.categoria === "sencilla" ? "Sencilla" : "Bandeja para compartir";
      detalles.append(categoria);
    }

    const acciones = document.createElement("div");
    acciones.className = "item-actions";
    if (tipo === "carrito") {
      const botonAumentar = crearBotonAccion("+", "aumentar", id, `Agregar una unidad de ${producto.nombre}`);
      botonAumentar.disabled = !productoDisponible(id, producto);
      acciones.append(
        crearBotonAccion("−", "disminuir", id, `Quitar una unidad de ${producto.nombre}`),
        botonAumentar
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
  if (!disponibilidadCargada) {
    window.alert("No se pudo verificar la disponibilidad. Intenta de nuevo cuando se restablezca la conexión.");
    return;
  }

  if (accion === "pedir-whatsapp") {
    const producto = productosPorId.get(id);
    if (!productoDisponible(id, producto)) {
      window.alert("Este producto no está disponible actualmente.");
      return;
    }
    const precio = producto.precio === undefined
      ? "precio por cotizar"
      : formatoPrecio.format(producto.precio);
    const mensaje = [
      "Hola, quiero pedir de Hot Bite:",
      `- ${producto.nombre}: 1 · ${precio}`,
      ...(producto.precio === undefined ? [] : [`Total: ${precio}`]),
      "",
      "Por favor, confirmen la disponibilidad."
    ].join("\n");
    enviarPedidoWhatsApp(mensaje);
    return;
  }

  if (accion === "agregar" || accion === "aumentar") {
    if (!productoDisponible(id)) {
      window.alert("Este producto no está disponible actualmente.");
      return;
    }
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

  const botonAbrirTrio = evento.target.closest("[data-abrir-trio]");
  if (botonAbrirTrio) {
    builderTrio.hidden = false;
    builderTrio.scrollIntoView({ behavior: "smooth", block: "center" });
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

opcionesTrio.addEventListener("change", (evento) => {
  const checkbox = evento.target.closest('input[type="checkbox"]');
  if (!checkbox) return;

  const clave = `${checkbox.dataset.grupo}|${checkbox.dataset.opcion}`;
  if (checkbox.checked) {
    if (seleccionActualTrio.size >= 3) {
      checkbox.checked = false;
      return;
    }
    seleccionActualTrio.add(clave);
  } else {
    seleccionActualTrio.delete(clave);
  }

  renderizarOpcionesTrio();
});

activarExtraTrio.addEventListener("change", () => {
  camposExtraTrio.hidden = !activarExtraTrio.checked;
  extraTrio.setCustomValidity("");
  if (!activarExtraTrio.checked) extraTrio.value = "";
});

extraTrio.addEventListener("input", () => {
  extraTrio.setCustomValidity("");
});

botonAgregarTrio.addEventListener("click", () => {
  if (!disponibilidadCargada) {
    window.alert("No se pudo verificar la disponibilidad. Intenta de nuevo cuando se restablezca la conexión.");
    return;
  }
  if (seleccionActualTrio.size !== 3) return;

  const ingredientes = [...seleccionActualTrio].map((clave) => `trio|${clave}`);
  if (ingredientes.some((id) => !productoDisponible(id))) {
    renderizarOpcionesTrio();
    return;
  }
  const nombres = OPCIONES_TRIO.flatMap((grupo) =>
    grupo.opciones.filter((opcion) => seleccionActualTrio.has(`${grupo.id}|${opcion}`))
  );
  const extra = activarExtraTrio.checked ? extraTrio.value.trim() : "";
  if (activarExtraTrio.checked && !extra) {
    extraTrio.setCustomValidity("Escribe qué adición quieres agregar.");
    extraTrio.reportValidity();
    return;
  }
  const mensaje = [
    "Hola, quiero pedir un trío personalizado de Hot Bite:",
    `- ${nombres.join(" + ")}`,
    `Precio del trío: ${formatoPrecio.format(PRECIO_TRIO_PERSONALIZADO)}`,
    ...(extra ? [`- Extra solicitado: ${extra} (valor por confirmar)`] : []),
    "",
    "Por favor, confirmen la disponibilidad."
  ].join("\n");
  enviarPedidoWhatsApp(mensaje);
});

botonCerrarTrio.addEventListener("click", () => {
  builderTrio.hidden = true;
});

document.querySelector("#comprar-whatsapp").addEventListener("click", () => {
  if (!disponibilidadCargada) {
    window.alert("No se pudo verificar la disponibilidad. Intenta de nuevo cuando se restablezca la conexión.");
    return;
  }
  if (!carrito.size) {
    abrirPanel(panelCarrito);
    return;
  }
  if ([...carrito.keys()].some((id) => !productoDisponible(id))) {
    window.alert("Tu carrito incluye productos que ya no están disponibles. Quítalos para continuar.");
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
renderizarOpcionesTrio();

if (!supabaseClient) {
  mostrarErrorSincronizacion(`${window.HOTBITE_SUPABASE_CONFIG_ERROR || "No se pudo conectar con Supabase."} La disponibilidad de los productos no está disponible.`);
} else {
  cargarDisponibilidad()
    .then(() => {
      supabaseClient
        .channel("hotbite-store-inventory")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "inventory_availability"
        }, (cambio) => {
          const producto = cambio.new || cambio.old;
          if (!producto) return;
          if (cambio.eventType === "DELETE") {
            delete disponibilidad[producto.product_id];
          } else if (producto.is_available) {
            delete disponibilidad[producto.product_id];
          } else {
            disponibilidad[producto.product_id] = false;
          }
          actualizarVistaDisponibilidad();
        })
        .subscribe((estado) => {
          if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
            mostrarErrorSincronizacion("La disponibilidad cargó, pero no se reciben cambios en tiempo real. Recarga la página para actualizarla.");
          } else if (estado === "SUBSCRIBED") {
            estadoSincronizacion.hidden = true;
          }
        });
    })
    .catch((error) => {
      mostrarErrorSincronizacion(`No se pudo consultar la disponibilidad. ${error.message}`);
    });
}
