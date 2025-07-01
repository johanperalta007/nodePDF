const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const fs = require('fs');
const structurePDF = require("./structure.json");

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


 const insertarSaltosDeLinea = (cadena, cadaCuantos = 85) => {
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

    const fechaInicio = formatearFecha(lunesAnterior);
    const fechaFin = formatearFecha(proximoLunes);

    const textoSuperior = `Fecha de vigencia de la herramienta del ${fechaInicio.dia} de`;
    const textoInferior = `${fechaInicio.mes} al ${fechaFin.dia} de ${fechaFin.mes} del ${fechaFin.anio}`;

    const dynamicVars = {
      observations: await insertarSaltosDeLinea(
        `Esto es una prueba para saber la cantidad de caracteres si se aj
        ustan automaticamente o si hay 
        que realizar el reciclado de una función que ya t
        engo para acomodar el texto y no me reporte por favor 
        más Bugs por favor 
        lo pido :( . Lo realmente importantes es poder verificar que pese a que hay muchos caracteres 
        de observación dentro de este text , 
        este a su vez no se va a tener que reventar dentro del formato del PDF, ya 
        que este pdf para
         ser sinceros me lo tiene al rojo jaajja, pero hay 
        camello que es lo imporantes y agradezco 
        mucho a Dios por esta
         oportunimdfad que estoy aprovechando, para probar los alcances que puede llegar en la HU , 
        ojala los caractere
        s pasen sin ningún prob
        lemna. La prueba de desborde
         se enfoca en esto precisamente, mejorar`
      )
    };
    


    const dynamoResponseList = structurePDF;

    for (let index = 0; index < dynamoResponseList.length; index++) {
      const element = dynamoResponseList[index];

      if (element["type"] === "rect") {
        if (element["fill"]) {
          doc.rect(...element["positions"]).fill(element["fill"]);
        } else {
          doc.rect(...element["positions"]).stroke();
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

app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});