/**
 * Replica las derivaciones que hace build-pdf/utils/generatePDF.js sobre el
 * objeto `operation` antes de recorrer la plantilla.
 *
 * Objetivo: que el harness local produzca EXACTAMENTE las mismas claves que la
 * lambda, para que probar aqui sirva de algo.
 *
 * Lo que NO se replica: mapperTable/getDateApprove (dependen del servicio de
 * escalacion) y todo el bloque for130.*, que no aplica a la Hoja 1 de ME.
 */
const path = require("path");

// ---------- helpers copiados de la lambda ----------

const fmtString = async (cadena) => {
  if (
    cadena === undefined ||
    cadena === "" ||
    cadena === null ||
    cadena === `${undefined}  ${undefined}`
  ) {
    return "-";
  }
  return cadena;
};

const fmtNumber2 = async (numero) => {
  const num = parseFloat(numero);
  if (isNaN(num)) return "-";
  const truncado = num * 100;
  return `${truncado.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}% `;
};

const shortenText = async (text, limit) => {
  if (!text || text === "No Existe" || typeof text !== "string") return "";
  if (text.length <= limit) return text;
  return text.substring(0, limit) + "...";
};

const insertLineBreaks = (cadena, cadaCuantos) => {
  if (!cadena || typeof cadena !== "string") return "-";
  const textoLimpio = cadena.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  const palabras = textoLimpio.split(" ");
  let lineaActual = "";
  let resultado = "";
  for (const palabra of palabras) {
    if ((lineaActual + palabra).length > cadaCuantos) {
      resultado += lineaActual.trim() + "\n";
      lineaActual = "";
    }
    lineaActual += palabra + " ";
  }
  return resultado + lineaActual.trim();
};

const mapDocs = (idText) => {
  switch (idText) {
    case "Nit": return "NIT";
    case "Cédula de Ciudadanía": return "CC";
    case "Cédula de Extranjería": return "CE";
    case "Nit Persona Natural": return "NPN";
    case "Nit Persona Extranjera": return "NE";
    case "Registro Civil": return "RC";
    default: return idText;
  }
};

const setName = (falseName) => {
  switch (falseName) {
    case "No Existe": return "(No aplica)";
    case "No": return "";
    default: return falseName;
  }
};

const setIfValidations = async (c) => (c === "Crédito Constructor" ? "Si" : "No");

const estadoArchivoValidacion = (s) => {
  switch (s) {
    case "Aprobada": return "APROBADA";
    case "Rechazada": return "RECHAZADA";
    case "Reconsiderada": return "RECONSIDERADA";
    case "Sin respuesta": return "SIN RESPUESTA";
    default: return "BORRADOR";
  }
};

const showCheck = async (cadena) => {
  if (cadena === "-" || cadena === "-  -" || !cadena) return "";
  return path.join(__dirname, "img", "Check.png");
};

const checkCifin = async (lista, cadena) => {
  let response = path.join(__dirname, "img", "Error.png");
  if (!Array.isArray(lista)) return response;
  for (const el of lista) {
    if (el.label === cadena && el.isChecked === "true") {
      response = path.join(__dirname, "img", "Check.png");
    }
  }
  return response;
};

const getPassiveActiveRelationship = async (passive, active) => {
  if (!active) return "0%";
  return passive / active;
};

const calculateRaiting = async (tipoClient, mrc, observado, mrcEsp, observadoEsp) => {
  if (tipoClient !== "Codeudor" && tipoClient !== "No") {
    return { mrc: "-", observado: "-", mrcEsp: mrc, observadoEsp: observado };
  }
  return { mrc, observado, mrcEsp, observadoEsp };
};

const cretaRangoFechas = async (fechaInicio, fechaFin) => {
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return `${meses[inicio.getUTCMonth()]}-${inicio.getUTCFullYear()}-${meses[fin.getUTCMonth()]}-${fin.getUTCFullYear()}`;
};

const calcularRangoSemanal = (dateString) => {
  if (!dateString) return "Fecha no disponible";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Fecha no disponible";
  const base = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = base.getUTCDay();
  const daysToNextMonday = dow === 0 ? 1 : dow === 1 ? 7 : 8 - dow;
  const nextMonday = new Date(base.getTime());
  nextMonday.setUTCDate(base.getUTCDate() + daysToNextMonday);
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `del ${base.getUTCDate()} de ${meses[base.getUTCMonth()]} al ${nextMonday.getUTCDate()} de ${meses[nextMonday.getUTCMonth()]} de ${nextMonday.getUTCFullYear()}`;
};

const getNextMonday = async (lastModifiedFile, registerDate) => {
  if (lastModifiedFile === undefined) return calcularRangoSemanal(registerDate);
  if (typeof lastModifiedFile !== "string" || lastModifiedFile.trim() === "") {
    return "Fecha no disponible";
  }
  const parsed = new Date(lastModifiedFile);
  if (!isNaN(parsed.getTime())) return calcularRangoSemanal(lastModifiedFile);
  return lastModifiedFile;
};

// ---------- NUEVO: aplanado de comisiones ----------
//
// El motor no puede indexar arrays desde la plantilla, asi que el array
// comisiones.rows se aplana en claves escalares numeradas.
//
// Los titulos "Detalle comisión N" siguen siendo literales en la plantilla.
// Solo se aplanan el porcentaje y la cifra, y se dejan como NUMERO crudo para
// que los formateen los tipos del motor:
//   comisionN.porcentaje -> text6? no: text4 (fmtNumber2, que multiplica x100)
//   comisionN.valor      -> text6 (fmtNumber con sufijo USD)
//
// percentage viene en unidades de porcentaje (1 = 1%), pero fmtNumber2 hace
// parseFloat(v) * 100. Por eso se divide entre 100 al aplanar.

const MAX_COMISIONES = 10;

const mapComisiones = async (operation, { ordenarPorDetalle = false } = {}) => {
  const raw =
    operation[
      "operationData.operationServer.datosOperacionInput.comisiones.rows"
    ];

  const rows = Array.isArray(raw) ? [...raw] : [];

  if (ordenarPorDetalle) {
    rows.sort((a, b) => Number(a.detail) - Number(b.detail));
  }

  for (let i = 0; i < MAX_COMISIONES; i++) {
    const row = rows[i];
    const n = i + 1;

    const pct = row === undefined ? undefined : Number(row.percentage);
    const usd = row === undefined ? undefined : Number(row.usdValue);

    operation[`comision${n}.porcentaje`] = Number.isFinite(pct)
      ? pct / 100
      : undefined;
    operation[`comision${n}.valor`] = Number.isFinite(usd) ? usd : undefined;
  }

  return operation;
};

// ---------- armado del objeto operation ----------

module.exports.mapOperation = async (data, opts = {}) => {
  const operation = { ...data };

  operation["listAttributionLevelPDF.tasa.cargo"] = await fmtString(
    operation["operationData.operationServer.salidasRentabilidadDto.nivelAtribucion"]
  );
  operation["listAttributionLevelPDF.monto.cargo"] = await fmtString(
    operation["for130.levelAttributionForAmount"]
  );
  operation["listAttributionLevelPDF.excepcion.cargo"] = await fmtString(
    operation["for130.levelAttributionForException"]
  );
  operation["listAttributionLevelPDF.prorroga.cargo"] = await fmtString(undefined);
  operation["listAttributionLevelPDF.sancion.cargo"] = await fmtString(undefined);

  const mrcObservadoNumber =
    operation["operationData.dataCustomer.infoRating.ratingCliente.mrcObservado.number"];
  const ratingSelectedValue =
    mrcObservadoNumber === "-"
      ? operation["operationData.ratingObservedCustomer"]
      : mrcObservadoNumber;

  const raiting = await calculateRaiting(
    operation["operationData.allCustomer.tipoClienteEspecial"],
    operation["operationData.dataCustomer.infoRating.ratingCliente.mrc"],
    ratingSelectedValue,
    operation["operationData.dataCustomer.infoRating.ratingClienteEspecial.mrc"],
    operation["operationData.dataCustomer.infoRating.ratingClienteEspecial.mrcObservado.number"]
  );

  operation.raitingMrc = raiting.mrc;
  operation.raitingObservado = raiting.observado;
  operation.raitingMrcEsp = raiting.mrcEsp;
  operation.raitingObservadoEsp = raiting.observadoEsp;

  operation.textoFecha = await getNextMonday(
    operation["lastModifiedFile"],
    operation["registerDate"]
  );

  operation.tipoDoc = mapDocs(
    operation["operationData.dataCustomer.clientePrincipal.tipoIdentificacion"]
  );
  operation.typeDocMain = `${operation["operationData.dataCustomer.clientePrincipal.numeroIdentificacion"]} - Cliente principal`;
  operation.tipoDocSpecial = mapDocs(
    operation["operationData.dataCustomer.clienteEspecial.tipoIdentificacion"]
  );
  operation.clientSpecialName = await shortenText(
    setName(operation["operationData.dataCustomer.clienteEspecial.nombre"]),
    55
  );
  operation.titleSpecialCliente = `INFORMACIÓN CLIENTE ESPECIAL - ${setName(
    operation["operationData.dataCustomer.tipoClienteEspecial"]
  ).toUpperCase()}`;

  operation.passiveActiveRelation = await getPassiveActiveRelationship(
    operation["operationData.dataCustomer.infoCliente.pasivosPromedio.number"],
    operation["operationData.dataCustomer.infoCliente.activosPromedio.number"]
  );

  operation.havePeriod =
    parseInt(operation["operationData.operationServer.datosOperacionInput.periodoGracia"]) > 0
      ? "SI"
      : "NO";

  operation.typeOperation = await shortenText(
    operation["operationData.operationServer.datosOperacionInput.tipoOperacion"],
    25
  );

  operation.segmentoDireccion =
    operation["operationData.dataCustomer.infoCliente.segmentoComercial"] +
    " / " +
    operation["operationData.dataCustomer.infoCliente.direccionBanca"];

  const fechaFinEndpoint = operation["operationData.dataCustomer.fechaFin"];
  const anioFin = fechaFinEndpoint.match(/^\d{4}/)[0];
  const mesCortado =
    operation["operationData.operationServer.salidasRentabilidadDto.mesCorteMC"];
  operation.activosCorte =
    "Activos con corte a " + mesCortado.substring(0, 3) + " " + anioFin;

  operation.observations = insertLineBreaks(operation["operationData.comment"], 95);
  operation.warrantyClassObs = insertLineBreaks(operation["for130.warrantyClassObs"], 84);
  operation.differentGradesA = insertLineBreaks(
    operation["for130.differentRatingsObservations"],
    90
  );
  operation.commercialRecommendation = insertLineBreaks(
    operation["for130.recommendationDisbursementCommercial"],
    90
  );

  operation.nameProm = await shortenText(
    operation["operationData.dataCustomer.clientePrincipal.nombre"],
    39
  );
  operation.nameClient = await shortenText(
    operation["operationData.dataCustomer.clientePrincipal.nombre"],
    55
  );
  operation.nameGroup = await shortenText(
    operation["operationData.operationServer.salidasRentabilidadDto.nombreGrupo"],
    34
  );
  operation.dirBancaZona = await shortenText(
    operation["operationData.dataCustomer.infoCliente.direccionBanca"],
    33
  );
  operation.activoGarantia = await shortenText(
    operation["operationData.operationServer.datosOperacionInput.activoGarantia"],
    28
  );

  operation.roas =
    operation["operationData.operationServer.salidasRentabilidadDto.roaCliente"] +
    operation["operationData.operationServer.salidasRentabilidadDto.roaOperacion"];

  operation.currentDate = new Date();
  operation.crConstructor = await setIfValidations(operation["for130.typeOperationFOR130"]);
  operation["imgLogo"] = path.join(__dirname, "img", "LogoBBOG.png");

  operation["checkTasa"] = await showCheck(operation["listAttributionLevelPDF.tasa.cargo"]);
  operation["checkMonto"] = await showCheck(operation["listAttributionLevelPDF.monto.cargo"]);
  operation["checkExcepcion"] = await showCheck(operation["listAttributionLevelPDF.excepcion.cargo"]);
  operation["checkProrroga"] = await showCheck(operation["listAttributionLevelPDF.prorroga.cargo"]);
  operation["checkSancion"] = await showCheck(operation["listAttributionLevelPDF.sancion.cargo"]);
  operation.checkCifin = await checkCifin(operation["for130.optionChecked"], "Revisión CIFIN");
  operation.checkVisita = await checkCifin(
    operation["for130.optionChecked"],
    "Visita comercial último trimestre"
  );

  operation.spreadTitle = `Spread ${operation["operationData.operationServer.spreadMV"]}`;
  operation.estadoArchivo = estadoArchivoValidacion(operation["state"]);
  operation.lastApproveDate = null;

  operation.rangoFechas = await cretaRangoFechas(
    operation["operationData.allCustomer.fechaInicio"],
    operation["operationData.allCustomer.fechaFin"]
  );

  operation.spreadPrevious =
    (await fmtNumber2(operation["for130.spreadPrevious"])) +
    " " +
    (await fmtString(operation["for130.acronymsReference"]));

  await mapComisiones(operation, opts);

  return operation;
};

module.exports.mapComisiones = mapComisiones;
