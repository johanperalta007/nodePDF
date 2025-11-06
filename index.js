const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const fs = require('fs');
const pdfTemplate = require("./structure.json");
//const pdfTemplate = require("./structureOldest.json");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Funciones auxiliares para formateo (simplificadas)
const fmtString = async (value) => value || '';
const fmtNumber = async (value) => value ? new Intl.NumberFormat('es-CO').format(value) : '0';
const fmtNumber2 = async (value) => value ? `${value}%` : '0%';
const fmtDate = async (value) => value ? new Date(value).toLocaleDateString('es-CO') : '';
const fmtX = async (value) => value ? 'X' : '-';

app.get('/api/pdf', async (req, res) => {
  try {
    const doc = new PDFDocument();
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
        `Al contrario del pensamiento popular, el texto de Lorem Ipsum no es simplemente texto aleatorio. 
        Tiene sus raices en una pieza clásica de la literatura del Latin, que data del año 45 antes de Cristo,
         haciendo que este adquiera mas de 2000 años de antiguedad. Richard McClintock, un profesor de Latin 
         de la Universidad de Hampden-Sydney en Virginia, encontró una de las palabras más oscuras de la lengua
          del latín, "consecteur", en un pasaje de Lorem Ipsum, y al seguir leyendo distintos textos del latín, 
          descubrió la fuente indudable. Lorem Ipsum viene de las secciones 1.10.32 y 1.10.33 de "de Finnibus 
          Bonorum et Malorum" (Los Extremos del Bien y El Mal) por Cicero, escrito en el año 45 antes de Cristo. 
          Este libro es un tratado de teoría de étic`, 90
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
        "Leasing Trenes Barcos y Aviones", 30
      ),
      nameClient: shortenText(
        "PINTURAS INDUPIN SOCIEDAD POR ACCIONES SIMPLIFICAD",
        45
      ),
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
        const actualText = dynamicVars[rawText] || rawText;

        if (element["font"]) doc.font(element["font"]);
        if (element["fillColor"]) doc.fillColor(element["fillColor"]);
        if (element["fontSize"]) doc.fontSize(element["fontSize"]);

        doc.text(actualText, x, y, options);
      }

      if (element["type"] === "moveDown") {
        doc.moveDown(element["size"]);
      }

      if (element["type"] === "moveTo") {
        doc.moveTo(...element["move"]).lineTo(...element["line"]).stroke();
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