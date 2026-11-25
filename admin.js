const STORAGE_DISPONIBILIDAD = "hotbite-disponibilidad-v1";
const STORAGE_CREDENCIALES = "hotbite-admin-credenciales-v1";
const STORAGE_VENTAS = "hotbite-ventas-v1";
const SESSION_ADMIN = "hotbite-admin-sesion-v1";
const ITERACIONES_HASH = 150000;

const INVENTARIO = [
  {
    titulo: "Tríos y bandejas",
    productos: [
      ["gomi-bite", "Gomi Bite 0.1"],
      ["gomi-2-0", "Gomi 2.0"],
      ["fruti-hot", "Fruti Hot 0.1"],
      ["gomi-rush", "Gomi Rush"],
      ["gomi-rush-pe", "Gomi Rush 0.1"],
      ["gomi-love", "Gomi Love"],
      ["gomi-love-pe", "Gomi Love 0.1"],
      ["gomi-crazy", "Gomi Crazy"],
      ["gomi-crazy-pe", "Gomi Crazy 0.1"],
      ["gomi-hot", "Gomi Hot"],
      ["gomi-hot-pe", "Gomi Hot 0.1"],
      ["gomi-fusion", "Gomi Fusion"],
      ["gomi-fusion-pe", "Gomi Fusion 0.1"],
      ["gomi-boom", "Gomi Boom"],
      ["gomi-boom-pe", "Gomi Boom 0.1"],
      ["gomi-extrem", "Gomi Extrem"],
      ["gomi-extrem-pe", "Gomi Extrem 0.1"],
      ["gomi-fire", "Gomi Fire"],
      ["gomi-fire-pe", "Gomi Fire 0.1"],
      ["gomi-volcanic", "Gomi Volcanic"],
      ["gomi-volcanic-pe", "Gomi Volcanic 0.1"]
    ]
  },
  {
    titulo: "Sencillas",
    productos: [
      ["sencilla-p18", "Sencilla 0.2"],
      ["sencilla-p12", "Sencilla 0.1"]
    ]
  },
  {
    titulo: "Frutas para crear tu trío",
    productos: [
      ["trio|frutas|Mango rayado", "Mango rayado"],
      ["trio|frutas|Mango en cuadro", "Mango en cuadro"],
      ["trio|frutas|Piña", "Piña"],
      ["trio|frutas|Mamoncillo", "Mamoncillo"],
      ["trio|frutas|Guayaba", "Guayaba"]
    ]
  },
  {
    titulo: "Gomitas para crear tu trío",
    productos: [
      ["trio|gomitas|Enchiladas", "Enchiladas"],
      ["trio|gomitas|Sin enchilar", "Sin enchilar"],
      ["trio|gomitas|Ácidas", "Ácidas"]
    ]
  },
  {
    titulo: "Takis para crear tu trío",
    productos: [
      ["trio|takis|Rojos", "Rojos"],
      ["trio|takis|Azules", "Azules"]
    ]
  }
];

const accesoAdmin = document.querySelector("#admin-acceso");
const panelAdmin = document.querySelector("#admin-panel");
const formularioAdmin = document.querySelector("#admin-form");
const instruccionAdmin = document.querySelector("#admin-instruccion");
const campoPassword = document.querySelector("#admin-password");
const envolturaConfirmacion = document.querySelector("#confirmacion-wrap");
const campoConfirmacion = document.querySelector("#admin-confirmacion");
const errorAdmin = document.querySelector("#admin-error");
const botonEnviar = document.querySelector("#admin-enviar");
const inventarioAdmin = document.querySelector("#admin-inventario");
const formularioVenta = document.querySelector("#venta-form");
const campoFechaVentas = document.querySelector("#ventas-fecha");
const campoDetalleVenta = document.querySelector("#venta-detalle");
const campoValorVenta = document.querySelector("#venta-valor");
const errorVenta = document.querySelector("#venta-error");
const totalVentas = document.querySelector("#ventas-total");
const cantidadVentas = document.querySelector("#ventas-cantidad");
const listaVentas = document.querySelector("#ventas-lista");
const ventasVacias = document.querySelector("#ventas-vacias");
const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

function mostrarError(mensaje) {
  errorAdmin.textContent = mensaje;
  errorAdmin.hidden = false;
}

function tieneCredenciales() {
  return localStorage.getItem(STORAGE_CREDENCIALES) !== null;
}

function actualizarFormularioAcceso() {
  const inicial = !tieneCredenciales();
  instruccionAdmin.textContent = inicial
    ? "Crea una contraseña local para este navegador."
    : "Ingresa tu contraseña local para administrar la disponibilidad.";
  campoPassword.autocomplete = inicial ? "new-password" : "current-password";
  envolturaConfirmacion.hidden = !inicial;
  campoConfirmacion.required = inicial;
  botonEnviar.textContent = inicial ? "Crear contraseña" : "Ingresar";
}

function codificarHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function calcularHash(password, salt, iteraciones) {
  if (!crypto.subtle) {
    throw new Error("El navegador requiere una conexión HTTPS para crear el acceso local.");
  }
  const clave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const resultado = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt,
    iterations: iteraciones,
    hash: "SHA-256"
  }, clave, 256);
  return codificarHex(resultado);
}

function decodificarHex(hex) {
  const bytes = new Uint8Array(hex.match(/.{2}/g).map((par) => parseInt(par, 16)));
  return bytes;
}

async function guardarCredenciales(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const credenciales = {
    salt: codificarHex(salt),
    hash: await calcularHash(password, salt, ITERACIONES_HASH),
    iteraciones: ITERACIONES_HASH
  };
  localStorage.setItem(STORAGE_CREDENCIALES, JSON.stringify(credenciales));
}

async function validarCredenciales(password) {
  const credenciales = JSON.parse(localStorage.getItem(STORAGE_CREDENCIALES));
  const hash = await calcularHash(password, decodificarHex(credenciales.salt), credenciales.iteraciones);
  return hash === credenciales.hash;
}

function leerDisponibilidad() {
  return JSON.parse(localStorage.getItem(STORAGE_DISPONIBILIDAD) || "{}");
}

function leerVentas() {
  const ventas = JSON.parse(localStorage.getItem(STORAGE_VENTAS) || "[]");
  if (!Array.isArray(ventas)) throw new Error("El registro guardado de ventas no tiene un formato válido.");
  return ventas;
}

function fechaLocalISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function renderizarInventario() {
  inventarioAdmin.replaceChildren();
  const disponibilidad = leerDisponibilidad();
  const seccionNoDisponibles = document.createElement("section");
  seccionNoDisponibles.className = "admin-group admin-unavailable-group";

  const tituloNoDisponibles = document.createElement("h3");
  tituloNoDisponibles.textContent = "No disponibles";
  const listaNoDisponibles = document.createElement("div");
  listaNoDisponibles.className = "admin-items";
  seccionNoDisponibles.append(tituloNoDisponibles, listaNoDisponibles);

  const seccionDisponibles = document.createElement("section");
  seccionDisponibles.className = "admin-group";
  const tituloDisponibles = document.createElement("h3");
  tituloDisponibles.textContent = "Disponibles";
  const gruposDisponibles = document.createElement("div");
  gruposDisponibles.className = "admin-stock-groups";
  seccionDisponibles.append(tituloDisponibles, gruposDisponibles);

  let cantidadNoDisponibles = 0;

  INVENTARIO.forEach((grupo) => {
    const subtitulo = document.createElement("h4");
    subtitulo.textContent = grupo.titulo;
    const listaDisponibles = document.createElement("div");
    listaDisponibles.className = "admin-items";

    grupo.productos.forEach(([id, nombre]) => {
      const disponible = disponibilidad[id] !== false;
      const fila = document.createElement("div");
      fila.className = "admin-item";

      const etiqueta = document.createElement("span");
      etiqueta.textContent = nombre;

      const estado = document.createElement("button");
      estado.className = `admin-toggle${disponible ? " is-available" : ""}`;
      estado.type = "button";
      estado.dataset.id = id;
      estado.setAttribute("aria-pressed", String(disponible));
      estado.textContent = disponible ? "Disponible" : "No disponible";

      fila.append(etiqueta, estado);
      if (disponible) {
        listaDisponibles.append(fila);
      } else {
        cantidadNoDisponibles += 1;
        listaNoDisponibles.append(fila);
      }
    });

    if (listaDisponibles.childElementCount) {
      const grupoDisponible = document.createElement("section");
      grupoDisponible.className = "admin-stock-subgroup";
      grupoDisponible.append(subtitulo, listaDisponibles);
      gruposDisponibles.append(grupoDisponible);
    }
  });

  if (!cantidadNoDisponibles) {
    const vacio = document.createElement("p");
    vacio.className = "admin-empty";
    vacio.textContent = "No hay productos marcados como no disponibles.";
    listaNoDisponibles.append(vacio);
  }

  inventarioAdmin.append(seccionNoDisponibles, seccionDisponibles);
}

function renderizarVentas() {
  const ventasDelDia = leerVentas()
    .filter((venta) => venta.fecha === campoFechaVentas.value)
    .sort((a, b) => b.hora - a.hora);
  const total = ventasDelDia.reduce((suma, venta) => suma + venta.valor, 0);

  totalVentas.textContent = formatoMoneda.format(total);
  cantidadVentas.textContent = String(ventasDelDia.length);
  listaVentas.replaceChildren();
  ventasVacias.hidden = ventasDelDia.length > 0;

  ventasDelDia.forEach((venta) => {
    const fila = document.createElement("article");
    fila.className = "admin-sale-item";

    const detalle = document.createElement("div");
    const nombre = document.createElement("strong");
    nombre.textContent = venta.detalle || "Venta";
    const hora = document.createElement("p");
    hora.textContent = new Date(venta.hora).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit"
    });
    detalle.append(nombre, hora);

    const valor = document.createElement("strong");
    valor.className = "admin-sale-value";
    valor.textContent = formatoMoneda.format(venta.valor);

    const quitar = document.createElement("button");
    quitar.className = "mini";
    quitar.type = "button";
    quitar.dataset.eliminarVenta = venta.id;
    quitar.setAttribute("aria-label", `Eliminar venta ${venta.detalle || ""} ${formatoMoneda.format(venta.valor)}`);
    quitar.textContent = "×";

    fila.append(detalle, valor, quitar);
    listaVentas.append(fila);
  });
}

function abrirPanelAdmin() {
  accesoAdmin.hidden = true;
  panelAdmin.hidden = false;
  renderizarInventario();
  renderizarVentas();
}

campoFechaVentas.value = fechaLocalISO();

if (sessionStorage.getItem(SESSION_ADMIN) === "true") {
  abrirPanelAdmin();
} else {
  actualizarFormularioAcceso();
}

formularioAdmin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  errorAdmin.hidden = true;

  const password = campoPassword.value;
  try {
    if (!tieneCredenciales()) {
      if (password.length < 8) {
        mostrarError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (password !== campoConfirmacion.value) {
        mostrarError("Las contraseñas no coinciden.");
        return;
      }
      await guardarCredenciales(password);
    } else if (!await validarCredenciales(password)) {
      mostrarError("Contraseña incorrecta.");
      return;
    }

    sessionStorage.setItem(SESSION_ADMIN, "true");
    abrirPanelAdmin();
  } catch (error) {
    mostrarError(`No se pudo completar el acceso local: ${error.message}`);
  }
});

inventarioAdmin.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".admin-toggle");
  if (!boton) return;

  const disponibilidad = leerDisponibilidad();
  disponibilidad[boton.dataset.id] = boton.getAttribute("aria-pressed") !== "true";
  localStorage.setItem(STORAGE_DISPONIBILIDAD, JSON.stringify(disponibilidad));
  renderizarInventario();
});

formularioVenta.addEventListener("submit", (evento) => {
  evento.preventDefault();
  errorVenta.hidden = true;

  const valor = Number(campoValorVenta.value);
  if (!Number.isSafeInteger(valor) || valor <= 0) {
    errorVenta.textContent = "Escribe un valor entero mayor que cero.";
    errorVenta.hidden = false;
    return;
  }

  try {
    const ventas = leerVentas();
    ventas.push({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      fecha: campoFechaVentas.value,
      hora: Date.now(),
      detalle: campoDetalleVenta.value.trim(),
      valor
    });
    localStorage.setItem(STORAGE_VENTAS, JSON.stringify(ventas));
    formularioVenta.reset();
    renderizarVentas();
  } catch (error) {
    errorVenta.textContent = `No se pudo guardar la venta: ${error.message}`;
    errorVenta.hidden = false;
  }
});

campoFechaVentas.addEventListener("change", renderizarVentas);

listaVentas.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-eliminar-venta]");
  if (!boton) return;

  const ventas = leerVentas().filter((venta) => venta.id !== boton.dataset.eliminarVenta);
  localStorage.setItem(STORAGE_VENTAS, JSON.stringify(ventas));
  renderizarVentas();
});

document.querySelector("#admin-salir").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_ADMIN);
  panelAdmin.hidden = true;
  accesoAdmin.hidden = false;
  formularioAdmin.reset();
  actualizarFormularioAcceso();
});

window.addEventListener("storage", (evento) => {
  if (evento.key === STORAGE_DISPONIBILIDAD && !panelAdmin.hidden) renderizarInventario();
  if (evento.key === STORAGE_CREDENCIALES && panelAdmin.hidden) actualizarFormularioAcceso();
  if (evento.key === STORAGE_VENTAS && !panelAdmin.hidden) renderizarVentas();
});
