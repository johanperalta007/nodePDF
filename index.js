const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const fs = require('fs');
const pdfTemplate = require("./structureME.json");
//const pdfTemplate = require("./structure.json");
//const pdfTemplate = require("./structureOldest.json");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Funciones auxiliares para formateo (simplificadas)
const fmtString = async (value) => (value === undefined || value === null || value === '') ? '-' : value;
const fmtNumber = async (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `;
};
const fmtNumber2 = async (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% `;
};
const fmtDate = async (value) => value ? new Date(value).toLocaleDateString('es-CO') : '-';
const fmtX = async (value) => value ? 'X' : '-';

app.get('/api/pdf', async (req, res) => {
  try {
    // Se anula solo el margen inferior para ganar espacio vertical util.
    // Con el margen por defecto (72) el area util termina en y=720 y PDFKit
    // salta de pagina automaticamente cualquier texto por debajo de ese punto.
    // Con bottom=0 el limite pasa a y=792 (alto de la hoja letter), sin cambiar
    // el tamano de pagina ni afectar el salto de pagina forzado en y=974.
    const doc = new PDFDocument({
      margins: { top: 72, left: 72, right: 72, bottom: 0 },
    });
    const writableStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 100 * 1024,
      incrementAmount: 10 * 1024,
    });

    doc.pipe(writableStream);

    // Cálculo de fechas para Colombia (GMT-5)
    const ahoraUTC = new Date();
    const offsetColombia = -5 * 60 * 60 * 1000;
    const fechaColombia = new Date(ahoraUTC.getTime() + offsetColombia);

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const calcularLunes = (fecha) => {
      const diaSemana = fecha.getUTCDay();
      const diasDesdeLunes = (diaSemana + 6) % 7;
      const lunes = new Date(fecha);
      lunes.setUTCDate(fecha.getUTCDate() - diasDesdeLunes);
      return lunes;
    };

    const lunesAnterior = calcularLunes(fechaColombia);
    const proximoLunes = new Date(lunesAnterior);
    proximoLunes.setUTCDate(lunesAnterior.getUTCDate() + 7);

    const formatearFecha = (fecha) => ({
      dia: fecha.getUTCDate(),
      mes: meses[fecha.getUTCMonth()],
      anio: fecha.getUTCFullYear()
    });

    // Salida del PDF a un archivo local ¡¡¡ Solo corre en local eliminar en la nube!!!
    doc.pipe(fs.createWriteStream('output.pdf'));


    // Registrar la fuente Roboto
    doc.registerFont('Roboto', 'path/to/Roboto-Regular.ttf');



    const insertarSaltosDeLinea = (cadena, cadaCuantos) => {
      if (!cadena || typeof cadena !== "string") {
        return "-";
      }

      // Eliminar saltos de línea y espacios redundantes
      const textoLimpio = cadena.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

      let resultado = "";
      for (let i = 0; i < textoLimpio.length; i += cadaCuantos) {
        resultado += textoLimpio.slice(i, i + cadaCuantos) + "\n";
      }

      return resultado.trim();
    };

    const shortenText = (text, limit) => {
      if (!text || typeof text !== "string") {
        return "";
      }
      if (text.length <= limit) {
        return text;
      }
      return text.substring(0, limit) + "...";
    };

    const mapDocs = (idText) => {
      switch (idText) {
        case "Nit":
          return "NIT";
        case "Cédula de Ciudadanía":
          return "CC";
        case "Cédula de Extranjería":
          return "CE";
        case "Nit Persona Natural":
          return "NPN";
        case "Nit Persona Extranjera":
          return "NE";
        case "Registro Civil":
          return "RC";
        default:
          return idText;
      }
    };


    const fechaInicio = formatearFecha(lunesAnterior);
    const fechaFin = formatearFecha(proximoLunes);

    const MyIds = {
      "Nit": "NIT",
      "Cédula de Ciudadanía": "CC",
      "Cédula de Extranjería": "CE",
      "Nit Persona Natural": "NPN",
      "Nit Persona Extranjera": "NE",
      "Registro Civil": "RC"
    };


    const clienteEspecialName = shortenText(
      "NOMBRE CLIENTE ESPECIAL S.A.S PARA UNA PRUEBA EN MY COMPANY", 55
    );


    const dynamicVars = {
      observations: insertarSaltosDeLinea(
        "La realidad de todo es que quiero generar de la mejor forma los comentarios para que no me reporten más Bugs por parte del PDF es muy raro porque yo recuerdo que lo probé de manera correcta muchas veces y lo raro es que tiene la misma lógica que otro campo pero la idea es resolverlo y desplegarlos para este semana que hay un momento importante de despliegue en esta semana. La realidad de todo es que la idea es dejar esto lleno de comenatrios ante ajkshaS skuahskjahsaS IaushaSas aiuSGAiushasa uygasiuagsaiu aiusgaiusaisiuag ausgai SDGAUS ASUDGSAD asdhajd asdhasdasdg sagdjahsdg sadhasdhash jhagdsjhagdhajs jhasgdjahs sadhaskud asdgjyasgd asdhgasjhd asjdgfsajd asd asygd asdkhakj asdjkh asdgajshdg asdgadahjs", 90
      ),
      nameClient: shortenText(
        "Grupo Inbobiliario OIKOS Colombia S.A.S", 51
      ),
      textoFecha: `${fechaInicio.dia} de ${fechaInicio.mes} al ${fechaFin.dia} de ${fechaFin.mes} del ${fechaFin.anio}`,
      imgLogo: './img/LogoBBOG.png',
      nameProm: shortenText("DISTRITO ESPECIAL DE CIENCIA TECNOLOGIA E INN", 45),
      tipoDoc: mapDocs("Nit"),
      clientSpecialName: clienteEspecialName,
      tipoDocSpecial: mapDocs("Cédula de Ciudadanía"),
      warrantyClassObs: insertarSaltosDeLinea(
        `3 Gacela de la terrible presencia, de Federico García Lorca

         Yo quiero que el agua se quede sin cauce.
         Yo quiero que el viento se quede sin valles.

         Quiero que la noche se quede sin ojos
         y mi corazón sin la flor del oro.

         Que los bueyes hablen con las grandes hojas
         y que la lombriz se muera de sombra.

         Que brillen los dientes de la calavera
         y los amarillos inunden la seda.

         Puedo ver el duelo de la noche herida
         luchando enroscada con el mediodía.

         Resisto un ocaso de verde veneno
         y los arcos rotos donde sufre el tiempo.

         Pero no me enseñes tu limpio desnudo
         como un negro cactus abierto en los juncos.

         Déjame en un ansia de oscuros planetas,
         ¡pero no me enseñes tu cintura fresca!`, 84),
      imgCheck: './img/Check.png',
      //{"params":["imgCheck",45,332,{"align":"left","fit":[9,9],"valign":"top"}],"type":"image"},
      activoGarantia: insertarSaltosDeLinea(
        "Leasing Trenes Barcos y Aviones", 31
      ),
      nameClient: shortenText(
        "PINTURAS INDUPIN SOCIEDAD POR ACCIONES SIMPLIFICAD",
        45
      ),

      // ---- Datos de prueba Hoja 1 ME (structureME.json) ----
      "me.vigenciaFecha": "del 10 junio al 17 junio de 2026",
      "me.clienteNombreDoc": "ASOCIACIÓN PARA LA EDUCACIÓN S.A.S",
      "me.clienteTipoNumeroDoc": "NIT 900123456 - Cliente principal",
      "me.gerenteNombre": "Barajas Lamus, Victor Hugo",
      "me.cotizacionNo": "ME_SOL_PRC_100637",
      "me.fechaCreacion": "2026-06-05",
      "me.maxNivelAtribucionTasa": "Vp Internacional",
      "me.estado": "APROBADA",
      "me.fechaAprobacion": "2025-06-20",
      "me.unidadNegocio": "1122",
      "me.segmento": "Corporativo",
      "me.zona": "Corporativo",

      "me.resumenCarterasTitulo": "RESUMEN DE CARTERAS ME VIGENTES PARA ASOCIACIÓN PARA LA EDUCACIÓN S.A.S",
      "me.carteraMEVigenteUSD": 0,
      "me.carteraMEHoyUSD": 0,
      "me.tasaPromedio": 0,
      "me.plazoPromedio": "-",
      "me.promedio3MesesUSD": 5407599,

      "me.disclaimerMultiplesOperaciones": "Esta cotización es para múltiples operaciones que podrán ser desembolsadas cualquier día entre las fechas mínima y máxima de inicio con las condiciones acá estipuladas, mientras la suma de todos los desembolsos no supere el monto total de esta cotización.",

      "me.segmentoComercial": "Mediana",
      "me.zonaCliente": "Empresarial 2",
      "me.calificacionMRC": "AA",
      "me.ratingObservado": 3,
      "me.ratingProyectado": "-",
      "me.relacionPasivoActivo": 15,
      "me.clasificacionEPC": "Estratégico",

      "me.codeudorNombre": "ASOCIACIÓN PARA LA EDUCACIÓN S.A.S",
      "me.codeudorNit": "NIT 9001234560",
      "me.codeudorCalifMRC": "AA",
      "me.codeudorRatingObservado": 3,
      "me.codeudorRatingProyectado": "-",

      "me.montoUSD": 1345000,
      "me.indiceReferencia": "Back to back",
      "me.montoCOP": 17334000000,
      "me.libro": "Miami",
      "me.sustitucionProrroga": "No",
      "me.montoBackToBack": 0,
      "me.tipoCotizacion": "En bloque",
      "me.tasaDeposito": "Back to Back",
      "me.rangoFechaDesembolso": "17 Jun 2026 al 25 Jun 2026",
      "me.tasaFijaCredito": "Back to Back",
      "me.tipoOperacion": "Giro financiado",
      "me.margen": "Back to Back",
      "me.vehiculo": 0,

      "me.observacionesBackToBack": insertarSaltosDeLinea(
        "Cliente con cupo disponible y vigente competencia Bancolombia. Tasa consultada con anterioridad.",
        80
      ),
      "me.registroBanRep": "Registro BanRep. USD 30,00",

      "me.tasaReferenciaMV": 1.95,
      "me.vidaMedia": 6,
      "me.spreadMV": 2.44,
      "me.amortizacionCapital": "Trimestral",
      "me.tasaEA": 2.3,
      "me.pagoIntereses": "Trimestral",
      "me.tasaMV": 2.3,
      "me.tipoGarantia": "Fondo de garantías",
      "me.spreadFTP": 1.43,
      "me.valorGarantia": 0,
      "me.plazoMeses": 6,
      "me.coberturaGarantia": 50,
      "me.periodoGracia": 6,

      "me.porcentajeComision": 5.42,
      "me.valorComision": "USD 120",

      "me.observaciones": insertarSaltosDeLinea(
        "Sin observaciones adicionales para esta operación.",
        90
      ),

      "me.activosCorteLabel": "Activos con corte a jul-25 2026",
      "me.activosCorteValor": 539887757598,

      "me.totalActivosVol": 497865500883,
      "me.totalActivosTasa": 15.65,
      "me.prestamosComercialesVol": 497865500883,
      "me.prestamosComercialesTasa": 18.23,
      "me.carteraMEVol": 0,
      "me.carteraMETasa": 0,
      "me.leasingComercialVol": 0,
      "me.leasingComercialTasa": 0,
      "me.carteraRedescontadaVol": 0,
      "me.carteraRedescontadaTasa": 0,
      "me.tarjetaCreditoVol": 0,
      "me.tarjetaCreditoTasa": 0,
      "me.otrosActivosVol": 0,
      "me.otrosActivosTasa": 0,

      "me.totalPasivosVol": 497865500883,
      "me.totalPasivosTasa": 15.65,
      "me.cuentasAhorroVol": 497865500883,
      "me.cuentasAhorroTasa": 18.23,
      "me.cuentasCorrientesVol": 0,
      "me.cuentasCorrientesTasa": 0,
      "me.cdtsVol": 0,
      "me.cdtsTasa": 0,
      "me.otrosPasivosVol": 0,
      "me.otrosPasivosTasa": 0,

      "me.margenContribucionFinanciero": -4094000018,
      "me.roaCliente": -0.85,

      "me.rentabilidad.ingresoIntereses.actual": 0,
      "me.rentabilidad.ingresoIntereses.operacion": 0,
      "me.rentabilidad.ingresoIntereses.nueva": 0,
      "me.rentabilidad.interesesPagadosFtp.actual": 0,
      "me.rentabilidad.interesesPagadosFtp.operacion": 0,
      "me.rentabilidad.interesesPagadosFtp.nueva": 0,
      "me.rentabilidad.interesesRecibidosFtp.actual": 0,
      "me.rentabilidad.interesesRecibidosFtp.operacion": 0,
      "me.rentabilidad.interesesRecibidosFtp.nueva": 0,
      "me.rentabilidad.interesesPagadosPasivo.actual": 0,
      "me.rentabilidad.interesesPagadosPasivo.operacion": 0,
      "me.rentabilidad.interesesPagadosPasivo.nueva": 0,
      "me.rentabilidad.subsidioFtp.actual": 0,
      "me.rentabilidad.subsidioFtp.operacion": 0,
      "me.rentabilidad.subsidioFtp.nueva": 0,
      "me.rentabilidad.exigenciaAdicional.actual": 0,
      "me.rentabilidad.exigenciaAdicional.operacion": 0,
      "me.rentabilidad.exigenciaAdicional.nueva": 0,
      "me.rentabilidad.margenNetoIntereses.actual": 0,
      "me.rentabilidad.margenNetoIntereses.operacion": 0,
      "me.rentabilidad.margenNetoIntereses.nueva": 0,
      "me.rentabilidad.perdidaEsperada.actual": 0,
      "me.rentabilidad.perdidaEsperada.operacion": 0,
      "me.rentabilidad.perdidaEsperada.nueva": 0,
      "me.rentabilidad.margenFinanciero.actual": 0,
      "me.rentabilidad.margenFinanciero.operacion": 0,
      "me.rentabilidad.margenFinanciero.nueva": 0,
      "me.rentabilidad.ingresoComisiones.actual": 0,
      "me.rentabilidad.ingresoComisiones.operacion": 0,
      "me.rentabilidad.ingresoComisiones.nueva": 0,
      "me.rentabilidad.beneficioEE.actual": 0,
      "me.rentabilidad.beneficioEE.operacion": 0,
      "me.rentabilidad.beneficioEE.nueva": 0,
      "me.rentabilidad.margenFinancieroNeto.actual": 0,
      "me.rentabilidad.margenFinancieroNeto.operacion": 0,
      "me.rentabilidad.margenFinancieroNeto.nueva": 0,
      "me.rentabilidad.costosOpMedios.actual": 0,
      "me.rentabilidad.costosOpMedios.operacion": 0,
      "me.rentabilidad.costosOpMedios.nueva": 0,
      "me.rentabilidad.costosOpMarginales.actual": 0,
      "me.rentabilidad.costosOpMarginales.operacion": 0,
      "me.rentabilidad.costosOpMarginales.nueva": 0,
      "me.rentabilidad.subsidios.actual": 0,
      "me.rentabilidad.subsidios.operacion": 0,
      "me.rentabilidad.subsidios.nueva": 0,
      "me.rentabilidad.utilidadAntesImpuestos.actual": 0,
      "me.rentabilidad.utilidadAntesImpuestos.operacion": 0,
      "me.rentabilidad.utilidadAntesImpuestos.nueva": 0,
      "me.rentabilidad.impuestos.actual": 0,
      "me.rentabilidad.impuestos.operacion": 0,
      "me.rentabilidad.impuestos.nueva": 0,
      "me.rentabilidad.utilidadNeta.actual": 0,
      "me.rentabilidad.utilidadNeta.operacion": 0,
      "me.rentabilidad.utilidadNeta.nueva": 0,
      "me.rentabilidad.utilidadNetaMarginal.actual": 0,
      "me.rentabilidad.utilidadNetaMarginal.operacion": 0,
      "me.rentabilidad.utilidadNetaMarginal.nueva": 0,

      "me.roaActual": 0.36,
      "me.roaOperacion": -0.49,
      "me.roaNuevoCliente": -0.49,
      "me.roeOperacion": 2.13,
      "me.roeNuevoCliente": 3.55,
      "me.targetSegmento": 0.5,
      "me.nivelAtribucionTasa": "VP. Internacional",
    };

    const dynamoResponseList = pdfTemplate;

    for (let index = 0; index < dynamoResponseList.length; index++) {
      const element = dynamoResponseList[index];

      if (element["type"] === "rect") {
        doc.lineWidth(0.1); // Grosor del borde
        //doc.strokeColor('#e6e6e6'); // Color del borde
        doc.strokeColor('gray'); // Color del borde

        const [x, y, width, height] = element["positions"];
        const radius = 4; // Puedes ajustar el radio según lo redondeado que lo quieras

        if (element["fill"]) {
          doc.roundedRect(x, y, width, height, radius).fill(element["fill"]);
        } else {
          doc.roundedRect(x, y, width, height, radius).stroke();
        }
      }

      if (element["type"] === "text") {
        const [rawText, x, y, options] = element["text"];

        // Si el texto es una variable dinámica, reemplázalo
        const actualText = dynamicVars[rawText] !== undefined ? dynamicVars[rawText] : rawText;

        if (element["font"]) doc.font(element["font"]);
        if (element["fillColor"]) doc.fillColor(element["fillColor"]);
        if (element["fontSize"]) doc.fontSize(element["fontSize"]);

        doc.text(actualText, x, y, options);
      }

      // text2: mapea únicamente cadenas de texto (equivalente a fmtString)
      if (element["type"] === "text2") {
        const [key, x, y, options] = element["text"];
        const value = await fmtString(dynamicVars[key]);

        if (element["font"]) doc.font(element["font"]);
        if (element["fillColor"]) doc.fillColor(element["fillColor"]);
        if (element["fontSize"]) doc.fontSize(element["fontSize"]);

        doc.text(value, x, y, options);
      }

      // text3: mapea cifras en moneda (equivalente a fmtNumber)
      if (element["type"] === "text3") {
        const [key, x, y, options] = element["text"];
        const value = await fmtNumber(dynamicVars[key]);

        if (element["font"]) doc.font(element["font"]);
        if (element["fillColor"]) doc.fillColor(element["fillColor"]);
        if (element["fontSize"]) doc.fontSize(element["fontSize"]);

        doc.text(value, x, y, options);
      }

      // text4: mapea porcentaje (equivalente a fmtNumber2)
      if (element["type"] === "text4") {
        const [key, x, y, options] = element["text"];
        const value = await fmtNumber2(dynamicVars[key]);

        if (element["font"]) doc.font(element["font"]);
        if (element["fillColor"]) doc.fillColor(element["fillColor"]);
        if (element["fontSize"]) doc.fontSize(element["fontSize"]);

        doc.text(value, x, y, options);
      }

      // text5: mapea fecha (equivalente a fmtDate)
      if (element["type"] === "text5") {
        const [key, x, y, options] = element["text"];
        const value = await fmtDate(dynamicVars[key]);

        if (element["font"]) doc.font(element["font"]);
        if (element["fillColor"]) doc.fillColor(element["fillColor"]);
        if (element["fontSize"]) doc.fontSize(element["fontSize"]);

        doc.text(value, x, y, options);
      }

      if (element["type"] === "moveDown") {
        doc.moveDown(element["size"]);
      }

      if (element["type"] === "moveTo") {
        // Soporte de linea punteada via la propiedad "dash" del JSON:
        //   "dash": true              -> guiones de 2pt con espacio de 2pt
        //   "dash": 3                 -> guiones de 3pt con espacio de 3pt
        //   "dash": [3, 2]            -> guion de 3pt, espacio de 2pt
        //   "dash": {"length":3,"space":2,"phase":0}
        // Si no se envia "dash", la linea sale solida como siempre.
        const dash = element["dash"];

        if (dash !== undefined && dash !== false) {
          let length = 2;
          let space;
          let phase = 0;

          if (dash === true) {
            length = 2;
          } else if (typeof dash === "number") {
            length = dash;
          } else if (Array.isArray(dash)) {
            [length, space] = dash;
          } else if (typeof dash === "object") {
            length = dash.length ?? 2;
            space = dash.space;
            phase = dash.phase ?? 0;
          }

          doc.dash(length, { space: space ?? length, phase });
        }

        doc.moveTo(...element["move"]).lineTo(...element["line"]).stroke();

        // Se restaura la linea solida para no afectar los trazos siguientes
        // (los rect y demas lineas comparten el mismo estado del documento).
        if (dash !== undefined && dash !== false) {
          doc.undash();
        }
      }

      if (element.type === 'image') {
        const [imgKey, x, y, options] = element.params;
        const imgPath = dynamicVars[imgKey]; // Resuelve la ruta desde dynamicVars

        if (fs.existsSync(imgPath)) {
          doc.image(imgPath, x, y, options);
        } else {
          console.warn(`Imagen no encontrada en la ruta: ${imgPath}`);
        }
      }


    }

    doc.end();

    await new Promise((resolve) => doc.on('end', resolve));

    const pdfBuffer = writableStream.getContents();
    const pdfBase64 = pdfBuffer.toString('base64');

    return res.send({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Documento_${new Date().getTime()}.pdf"`,
      },
      builtPdf: pdfBase64,
      isBase64Encoded: true,
    });
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return res.status(500).send({
      statusCode: 500,
      message: 'Error al generar el PDF',
      error: error.message
    });
  }
});

app.listen(3007, () => {
  console.log('Servidor escuchando en http://localhost:3007');
});