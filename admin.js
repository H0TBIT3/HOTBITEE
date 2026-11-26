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

const supabaseClient = window.HOTBITE_SUPABASE_CLIENT;
const accesoAdmin = document.querySelector("#admin-acceso");
const panelAdmin = document.querySelector("#admin-panel");
const formularioAdmin = document.querySelector("#admin-form");
const campoEmail = document.querySelector("#admin-email");
const campoPassword = document.querySelector("#admin-password");
const errorAdmin = document.querySelector("#admin-error");
const botonEnviar = document.querySelector("#admin-enviar");
const inventarioAdmin = document.querySelector("#admin-inventario");
const errorDatos = document.querySelector("#admin-data-error");
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
let canalAdmin;

function mostrarErrorAcceso(mensaje) {
  errorAdmin.textContent = mensaje;
  errorAdmin.hidden = false;
}

function mostrarErrorDatos(mensaje) {
  errorDatos.textContent = mensaje;
  errorDatos.hidden = false;
}

function fechaLocalISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

async function cargarInventario() {
  const { data: disponibilidad, error } = await supabaseClient
    .from("inventory_availability")
    .select("product_id, is_available");
  if (error) throw error;

  const estados = new Map(disponibilidad.map(({ product_id, is_available }) => [product_id, is_available]));
  inventarioAdmin.replaceChildren();
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
      const disponible = estados.get(id) !== false;
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

async function cargarVentas() {
  const { data: ventasDelDia, error } = await supabaseClient
    .from("sales")
    .select("id, sale_date, detail, amount_cop, created_at")
    .eq("sale_date", campoFechaVentas.value)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const total = ventasDelDia.reduce((suma, venta) => suma + venta.amount_cop, 0);
  totalVentas.textContent = formatoMoneda.format(total);
  cantidadVentas.textContent = String(ventasDelDia.length);
  listaVentas.replaceChildren();
  ventasVacias.hidden = ventasDelDia.length > 0;

  ventasDelDia.forEach((venta) => {
    const fila = document.createElement("article");
    fila.className = "admin-sale-item";

    const detalle = document.createElement("div");
    const nombre = document.createElement("strong");
    nombre.textContent = venta.detail || "Venta";
    const hora = document.createElement("p");
    hora.textContent = new Date(venta.created_at).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit"
    });
    detalle.append(nombre, hora);

    const valor = document.createElement("strong");
    valor.className = "admin-sale-value";
    valor.textContent = formatoMoneda.format(venta.amount_cop);

    const quitar = document.createElement("button");
    quitar.className = "mini";
    quitar.type = "button";
    quitar.dataset.eliminarVenta = venta.id;
    quitar.setAttribute("aria-label", `Eliminar venta ${venta.detail || ""} ${formatoMoneda.format(venta.amount_cop)}`);
    quitar.textContent = "×";

    fila.append(detalle, valor, quitar);
    listaVentas.append(fila);
  });
}

async function cargarPanelAdmin(usuario) {
  const { data: membresia, error } = await supabaseClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", usuario.id)
    .maybeSingle();
  if (error) throw error;
  if (!membresia) {
    await supabaseClient.auth.signOut();
    throw new Error("Esta cuenta no está autorizada como administradora.");
  }

  accesoAdmin.hidden = true;
  panelAdmin.hidden = false;
  errorDatos.hidden = true;
  const resultados = await Promise.allSettled([cargarInventario(), cargarVentas()]);
  if (resultados[0].status === "rejected") {
    mostrarErrorDatos(`No se pudo cargar el inventario: ${resultados[0].reason.message}`);
  }
  if (resultados[1].status === "rejected") {
    mostrarErrorDatos(`No se pudieron cargar las ventas: ${resultados[1].reason.message}`);
  }

  if (canalAdmin) await supabaseClient.removeChannel(canalAdmin);
  canalAdmin = supabaseClient
    .channel("hotbite-admin-data")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "inventory_availability"
    }, () => {
      cargarInventario().catch((errorCarga) => mostrarErrorDatos(`No se pudo actualizar el inventario: ${errorCarga.message}`));
    })
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "sales"
    }, () => {
      cargarVentas().catch((errorCarga) => mostrarErrorDatos(`No se pudieron actualizar las ventas: ${errorCarga.message}`));
    })
    .subscribe((estado) => {
      if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
        mostrarErrorDatos("No se reciben actualizaciones en tiempo real. Recarga el panel para sincronizar los datos.");
      }
    });
}

async function iniciarPanel() {
  if (!supabaseClient) {
    botonEnviar.disabled = true;
    mostrarErrorAcceso(`${window.HOTBITE_SUPABASE_CONFIG_ERROR || "No se pudo conectar con Supabase."} Configura la conexión antes de iniciar sesión.`);
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  if (data.session) await cargarPanelAdmin(data.session.user);
}

campoFechaVentas.value = fechaLocalISO();
iniciarPanel().catch((error) => mostrarErrorAcceso(`No se pudo abrir el panel: ${error.message}`));

formularioAdmin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  errorAdmin.hidden = true;
  if (!supabaseClient) {
    mostrarErrorAcceso("Configura Supabase antes de iniciar sesión.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: campoEmail.value.trim(),
    password: campoPassword.value
  });
  if (error) {
    mostrarErrorAcceso(`No se pudo iniciar sesión: ${error.message}`);
    return;
  }

  try {
    await cargarPanelAdmin(data.user);
    formularioAdmin.reset();
  } catch (errorCarga) {
    mostrarErrorAcceso(`No se pudo abrir el panel: ${errorCarga.message}`);
  }
});

inventarioAdmin.addEventListener("click", async (evento) => {
  const boton = evento.target.closest(".admin-toggle");
  if (!boton) return;

  errorDatos.hidden = true;
  boton.disabled = true;
  const disponible = boton.getAttribute("aria-pressed") !== "true";
  const { error } = await supabaseClient
    .from("inventory_availability")
    .upsert({ product_id: boton.dataset.id, is_available: disponible }, { onConflict: "product_id" });
  if (error) {
    boton.disabled = false;
    mostrarErrorDatos(`No se pudo guardar la disponibilidad: ${error.message}`);
    return;
  }
  try {
    await cargarInventario();
  } catch (errorCarga) {
    mostrarErrorDatos(`Se guardó el cambio, pero no se pudo actualizar el inventario: ${errorCarga.message}`);
  }
});

formularioVenta.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  errorVenta.hidden = true;

  const valor = Number(campoValorVenta.value);
  if (!Number.isSafeInteger(valor) || valor <= 0) {
    errorVenta.textContent = "Escribe un valor entero mayor que cero.";
    errorVenta.hidden = false;
    return;
  }

  const { error } = await supabaseClient.from("sales").insert({
    sale_date: campoFechaVentas.value,
    detail: campoDetalleVenta.value.trim(),
    amount_cop: valor
  });
  if (error) {
    errorVenta.textContent = `No se pudo guardar la venta: ${error.message}`;
    errorVenta.hidden = false;
    return;
  }

  formularioVenta.reset();
  try {
    await cargarVentas();
  } catch (errorCarga) {
    errorVenta.textContent = `La venta se guardó, pero no se pudo actualizar la lista: ${errorCarga.message}`;
    errorVenta.hidden = false;
  }
});

campoFechaVentas.addEventListener("change", () => {
  cargarVentas().catch((error) => mostrarErrorDatos(`No se pudieron consultar las ventas: ${error.message}`));
});

listaVentas.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("[data-eliminar-venta]");
  if (!boton) return;

  boton.disabled = true;
  const { error } = await supabaseClient
    .from("sales")
    .delete()
    .eq("id", boton.dataset.eliminarVenta);
  if (error) {
    boton.disabled = false;
    mostrarErrorDatos(`No se pudo eliminar la venta: ${error.message}`);
    return;
  }
  try {
    await cargarVentas();
  } catch (errorCarga) {
    mostrarErrorDatos(`La venta se eliminó, pero no se pudo actualizar la lista: ${errorCarga.message}`);
  }
});

document.querySelector("#admin-salir").addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    mostrarErrorDatos(`No se pudo cerrar sesión: ${error.message}`);
    return;
  }
  if (canalAdmin) await supabaseClient.removeChannel(canalAdmin);
  panelAdmin.hidden = true;
  accesoAdmin.hidden = false;
  formularioAdmin.reset();
});
