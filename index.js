const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const fs = require('fs');


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/api/pdf', async (req, res) => {
  try {
    const doc = new PDFDocument();

    const writableStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 100 * 1024, // Tamaño inicial del buffer
      incrementAmount: 10 * 1024, // Incremento del buffer
    });

    doc.pipe(writableStream);

    // 1. Obtener fecha UTC y ajustar a Colombia (GMT-5)
    const ahoraUTC = new Date();
    const offsetColombia = -5 * 60 * 60 * 1000; // -5 horas en milisegundos
    const fechaColombia = new Date(ahoraUTC.getTime() + offsetColombia);

    // 2. Datos para formateo
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // 3. Calcular lunes anterior y próximo lunes (usando UTC)
    const calcularLunes = (fecha) => {
      const diaSemana = fecha.getUTCDay(); // 0=Dom, 1=Lun, ..., 6=Sab
      const diasDesdeLunes = (diaSemana + 6) % 7;
      const lunes = new Date(fecha);
      lunes.setUTCDate(fecha.getUTCDate() - diasDesdeLunes);
      return lunes;
    };

    const lunesAnterior = calcularLunes(fechaColombia);
    const proximoLunes = new Date(lunesAnterior);
    proximoLunes.setUTCDate(lunesAnterior.getUTCDate() + 7);

    // 4. Función de formateo (usa UTC para todo)
    const formatearFecha = (fecha) => {
      return {
        dia: fecha.getUTCDate(),
        mes: meses[fecha.getUTCMonth()],
        anio: fecha.getUTCFullYear()
      };
    };

    const fechaInicio = formatearFecha(lunesAnterior);
    const fechaFin = formatearFecha(proximoLunes);

    // 5. Generar texto (usando datos de fechas colombianas)
    const textoSuperior = `Fecha de vigencia de la herramienta del ${fechaInicio.dia} de`;
    const textoInferior = `${fechaInicio.mes} al ${fechaFin.dia} de ${fechaFin.mes} del ${fechaFin.anio}`;

    // --- Aplicación en PDF ---
    doc.rect(30, 25, 550, 55).stroke();
    doc.image('./images/bancoLogo.png', 50, 50, { fit: [75, 75], align: 'left', valign: 'top' });
    doc.fontSize(8).text('Herramienta de Pricing CEOIS Versión: V5', 100, 50, { align: 'center' });
    doc.fontSize(6).text(textoSuperior, 100, 45, { align: 'right' });
    doc.fontSize(6).text(textoInferior, 100, 55, { align: 'right' });

    doc.moveDown(2); // Espaciado adicional

    doc.moveDown(1); // Espaciado adicional

    // Rectangulo 2 (x, y, width, height)
    doc.rect(30, 90, 280, 45).stroke();

    // Rectangulo 2.0 (x, y, width, height)
    doc.rect(30, 145, 280, 45).stroke();

    doc.moveDown(2); // Espaciado adicional

    // Pipe el PDF a un archivo
    doc.pipe(fs.createWriteStream('output.pdf'));

    // (X, Y aliegn)
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Cotización No:', 80, 100, { underline: true, align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('SOL_PRC_51286', 180, 100, { align: 'left' }); //###

    doc.moveDown(0.7);

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Fecha de creación:', 80, 110, { underline: true, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('30/09/2024', 180, 110, { align: 'left' }); //###
    doc.moveDown(0.7);

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Máximo nivel de atribución:', 80, 120, { underline: true, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('VP Ejecutivo', 180, 120, { align: 'left' }); //###
    doc.moveDown(0.7);

    // Rectangulo 3 (x, y, width, height)
    doc.rect(320, 90, 260, 30).stroke();

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Gerente', 80, 155, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('Cristian Camilo Salazar Zuleta', 180, 155, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('CEO', 80, 165, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('1779', 180, 165, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Dirección', 80, 175, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('Corporativo', 180, 175, { align: 'left' }); //###



    // (X, Y aliegn)
    doc.fontSize(7).text('Estado:', 330, 95, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('Borrador', 510, 95, { align: 'left' }); //###

    // Crear linea horizantal divisora 1
    const startX = 320;
    const endX = startX + 260;
    const middleY = 90 + 30 / 2;
    // Dibujar la línea horizontal que pasa por la mitad del rectángulo
    doc.moveTo(startX, middleY)
      .lineTo(endX, middleY)
      .stroke();

    doc.moveDown(5);

    // Cuerpo principal

    // Rectangulo 4 (x, y, width, height)
    doc.rect(30, 200, 280, 165).stroke();
    const startX1 = 30;
    const endX1 = startX1 + 280;
    const middleY1 = 215;
    doc.moveTo(startX1, middleY1)
      .lineTo(endX1, middleY1)
      .stroke();

    doc
      .fontSize(8)
      .font('Times-Bold')
      .text('Información Cliente Principal', 120, 205, { underline: true, align: 'left' },);

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(10).text('ISAGEN S.A. E.S.P', 75, 225, { align: 'left' });

    doc
      .fontSize(7).text('Nit', 200, 222, { align: 'left' });

    doc
      .fontSize(7).text('8110007404', 200, 233, { align: 'left' })
      .fillColor('black'); // Para devolver el color original

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Segmento Comercial / Dirección Banca', 40, 243, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('Corporativo / Infraestructura y', 200, 243, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Calificación MRC', 40, 253, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('AA', 240, 253, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Rating MRC Observado E.F. a 2020', 40, 263, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('2', 243, 263, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Rating MRC Proyectado', 40, 273, { underline: false, align: 'left' },);
    // (X, Y aliegn)
    doc.fontSize(7).text('-', 243, 273, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Clasificación Comercial EPC', 40, 283, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('Estratégico', 230, 283, { align: 'left' }); //###

    doc
      .fontSize(8)
      .font('Times-Bold')
      .text('Información de Nomina (Beneficio E + E)', 100, 297, { underline: true, align: 'left' },);


    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Numero de cuentas asociadas', 40, 315, { underline: false, align: 'left' },);
    // (X, Y aliegn)
    doc.fontSize(7).text('0', 243, 315, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Potencial de empleados', 40, 325, { underline: false, align: 'left' },);
    // (X, Y aliegn)
    doc.fontSize(7).text('0', 243, 325, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Share de nomina de la empresa', 40, 335, { underline: false, align: 'left' },);

    // (X, Y aliegn)
    doc.fontSize(7).text('0%', 242, 335, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Target del Share de nomina', 40, 345, { underline: false, align: 'left' },);
    // (X, Y aliegn)
    doc.fontSize(7).text('53%', 241, 345, { align: 'left' }); //###


    // Rectangulo 5 (x, y, width, height)
    doc.rect(320, 130, 260, 250).stroke();
    // Crear linea horizantal divisora 2
    const startX2 = 320;
    const endX2 = startX2 + 260;
    const middleY2 = 150;
    doc.moveTo(startX2, middleY2)
      .lineTo(endX2, middleY2)
      .stroke();

    doc
      .fontSize(6)
      .font('Times-Bold')
      .text('INFORMACIÓN PROMEDIOS Y RENTABILIDAD DEL CLIENTE ISAGEN S.A. E.S.P', 335, 140, { underline: true, align: 'left', width: 250 },);

    // (X, Y aliegn)
    doc.fontSize(7).text('Activos con corte a jun-24', 330, 160, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('539,887,757,598', 510, 160, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('Volumen', 460, 180, { align: 'left', width: 250 });

    // (X, Y aliegn)
    doc.fontSize(7).text('Tasa Implícita', 530, 180, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc.fontSize(7).text('Total Activos', 330, 190, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('493,712,077,883', 450, 190, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('15.83%', 540, 190, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(7).text('Prestamos Comerciales', 336, 200, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('493,712,077,883', 450, 200, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('15.83%', 540, 200, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Cartera ME', 336, 210, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 210, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('0.00%', 540, 210, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Leasing Comercial', 336, 220, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 220, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('0.00%', 540, 220, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Cartera Redescontada', 336, 230, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 230, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('0.00%', 540, 230, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Tarjeta de Crédito', 336, 240, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 240, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc.fontSize(7).text('0.00%', 540, 240, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Otros Activos', 336, 250, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 250, { align: 'left', width: 250 }); //###
    // (X, Y aliegn)
    doc
      .fontSize(7).text('0.00%', 540, 250, { align: 'left', width: 250 }) //###
      .fillColor('black');

    // (X, Y aliegn) Title
    doc.fontSize(7).text('Total Pasivos', 330, 270, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('14,572,233,242', 450, 270, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('12.22%', 540, 270, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc
      .fillColor('#777777')
      .fontSize(7).text('Cuentas de Ahorro', 336, 280, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('14,270,548,953', 450, 280, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('12.48%', 540, 280, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Cuentas Corrientes', 336, 290, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 290, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('0.00%', 540, 290, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('CDTs', 336, 300, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 300, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('0.00%', 540, 300, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) SubTitle
    doc.fontSize(7).text('Otros Pasivos', 336, 310, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('301,684,288', 450, 310, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('0.00%', 540, 310, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) Title
    doc
      .fillColor('black')
      .fontSize(7).text('Margen de Contirbución Financiero', 330, 325, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('-4,092,432,418', 490, 325, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) Title
    doc.fontSize(7).text('ROA', 330, 335, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('-0.83%', 505, 335, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) Title
    doc.fontSize(6).text('Información Integral Segmento - Clasificación Principal (12 meses)', 330, 342, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('Volumen', 460, 350, { align: 'left', width: 250 });

    // (X, Y aliegn)
    doc.fontSize(7).text('Tasa Implícita', 530, 350, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc.fontSize(7).text('Total Pasivos', 330, 360, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('917,381,595', 450, 360, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('0.00%', 540, 360, { align: 'left', width: 250 }); //###

    // (X, Y aliegn) Title
    doc.fontSize(7).text('Total Activos', 330, 370, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(7).text('0', 450, 370, { align: 'left', width: 250 }); //###
    doc.fontSize(7).text('0.00%', 540, 370, { align: 'left', width: 250 }); //###

    // Rectangulo 6 (x, y, width, height)
    doc.rect(30, 390, 280, 195).stroke();
    // Crear linea horizantal divisora 3
    const startX3 = 30;
    const endX3 = startX3 + 280;
    const middleY3 = 405;
    doc.moveTo(startX3, middleY3)
      .lineTo(endX3, middleY3)
      .stroke();

    doc
      .fontSize(8)
      .font('Times-Bold')
      .text('Información de la Operación', 120, 395, { underline: true, align: 'left' },);

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Valor Operación ($)', 35, 410, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('200,000,000,000', 116, 410, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Pertenece a Campaña', 178, 410, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('Si', 275, 410, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Sustitución (y/o) Prorroga', 35, 420, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('No', 140, 420, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Nombre Campaña', 178, 420, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('Retención', 265, 420, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Tipo de Operación', 35, 430, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('Recursos Propios', 116, 430, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Tamaño de Productor', 178, 430, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('-', 275, 430, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Entidad de redescuento', 35, 440, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('-', 116, 440, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('% de Redescuento', 35, 450, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('-', 116, 450, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Tipo de Garantía', 178, 450, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('Sin Garantia', 265, 450, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Índice de Referencia', 35, 480, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('IBR 3m', 116, 480, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Plazo (Meses)', 178, 480, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('72', 275, 480, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Tasa Referencia', 35, 490, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('9.37%', 116, 490, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Periodo Gracia', 178, 490, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('24', 275, 490, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Spread TV', 35, 500, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('2.95%', 116, 500, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Vida Media', 178, 500, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('51', 275, 500, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Tasa EA', 35, 510, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('12.90%', 116, 510, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Amortización Capital', 178, 510, { align: 'left' },);

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('Semestral', 265, 510, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Tasa MV', 35, 520, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('12.20%', 116, 520, { align: 'left' }); //###

    // Title 2
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Pago Intereses', 178, 520, { align: 'left' });

    // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('Trimestral', 265, 520, { align: 'left' }); //###

    // Title
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Rating Financiero', 35, 530, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text(`98%`, 116, 530, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Comisiones Negociadas', 35, 555, { align: 'left' },)
      .text('(por año) %', 35, 560, { align: 'left' },);
    // (X, Y aliegn) Valor
    doc.fontSize(7).text('0.00%', 116, 555, { align: 'left' }); //###

    // Rectangulo 7 (x, y, width, height)
    doc.rect(320, 390, 260, 235).stroke();
    // Crear linea horizantal divisora 4
    const startX4 = 320;
    const endX4 = startX4 + 260;
    const middleY4 = 405;
    doc.moveTo(startX4, middleY4)
      .lineTo(endX4, middleY4)
      .stroke();
    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Evaluación de Rentabilidad (Anualidad)', 395, 395, { underline: true, align: 'left', width: 250 },);

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Actual del', 420, 410, { align: 'left' })
      .text('cliente', 426, 415, { align: 'left' });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Actual del', 470, 410, { align: 'left' });

    doc
      .fontSize(7)
      .text('Nueva del cliente', 520, 410, { align: 'left', width: 250 });

    // (X, Y aliegn) Info Title
    doc
      .fillColor('#777777')
      .fontSize(7)
      .text('(+) Ingreso por Intereses', 325, 425, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('15.83%', 427, 425, { align: 'left' });

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('12.20%', 475, 425, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('12.20%', 530, 425, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(-) Intereses Pagados FTP', 325, 435, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('16.56%', 427, 435, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('11.36%', 475, 435, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('15.16%', 530, 435, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(+) Intereses Recibidos FTP', 325, 445, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.37%', 427, 445, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 445, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.25%', 530, 445, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(-) Intereses Pagados Pasivo', 325, 455, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.36%', 427, 455, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 455, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.24%', 530, 455, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(+) Subsidio FTP ', 325, 465, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.00%', 427, 465, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 465, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.00%', 530, 465, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(-) Exigencia Adicional', 325, 475, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.00%', 427, 475, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 475, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.00%', 530, 475, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('black')
      .fontSize(7)
      .text('(=) Margen Neto de Intereses', 325, 485, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-0.72%', 427, 485, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.84%', 475, 485, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.30%', 530, 485, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('#777777')
      .fontSize(7)
      .text('(-) Pérdida Esperada', 325, 500, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.18%', 427, 500, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.21%', 475, 500, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.18%', 530, 500, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('black')
      .fontSize(7)
      .text('(=) Margen Financiero', 325, 510, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-0.90%', 427, 510, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.63%', 475, 510, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.49%', 530, 510, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('#777777')
      .fontSize(7)
      .text('(+) Ingreso por Comisiones', 325, 525, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.06%', 427, 525, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 525, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.04%', 530, 525, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(+) Beneficio por E + E', 325, 535, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.00%', 427, 535, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 535, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.00%', 530, 535, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('black')
      .fontSize(7)
      .text('(=) Margen Financiero Neto', 325, 545, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-0.84%', 427, 545, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.63%', 475, 545, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.45%', 530, 545, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('#777777')
      .fontSize(7)
      .text('(-) Costos Op. - Medios', 325, 555, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.52%', 427, 555, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 555, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.35%', 530, 555, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(-) Costos Op. - Marginales', 325, 565, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.02%', 427, 565, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.02%', 475, 565, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.01%', 530, 565, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(+) Subsidios', 325, 575, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.00%', 427, 575, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 575, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.00%', 530, 575, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(+) Subsidios', 325, 575, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('0.00%', 427, 575, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.00%', 475, 575, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('0.00%', 530, 575, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('black')
      .fontSize(7)
      .text('(=) Utilidad Antes de Impuestos', 325, 585, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-1.38%', 427, 585, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.61%', 475, 585, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.81%', 530, 585, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('#777777')
      .fontSize(7)
      .text('(-) Impuestos', 325, 595, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-0.55%', 427, 595, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.24%', 475, 595, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.32%', 530, 595, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fillColor('black')
      .fontSize(7)
      .text('(=) Utilidad Neta', 325, 605, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-0.83%', 427, 605, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.36%', 475, 605, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.49%', 530, 605, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Info Title
    doc
      .fontSize(7)
      .text('(=) Utilidad Neta Marginal', 325, 615, { align: 'left' });

    // (X, Y aliegn) Info 1
    doc
      .fontSize(7)
      .text('-0.52%', 427, 615, { align: 'left' });//###

    // (X, Y aliegn) Info 2
    doc
      .fontSize(7)
      .text('0.36%', 475, 615, { align: 'left' });//###

    // (X, Y aliegn) Info 3
    doc
      .fontSize(7)
      .text('-0.28%', 530, 615, { align: 'left', width: 250 });//###

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('ROA de la Operación', 370, 640, { align: 'left' });

    // (X, Y aliegn) Info
    doc
      .fontSize(7)
      .text('0.36%', 510, 640, { align: 'left', width: 250 });

    // Rectangulo 8 (x, y, width, height)
    doc.rect(30, 600, 280, 60).stroke();

    // Title Observaciones
    doc
      .fontSize(9)
      .font('Times-Bold')
      .text('Observaciones:', 35, 605, { underline: true, align: 'left' },);

    // Observacion
    doc
      .fontSize(8)
      .font('Times-Bold')
      .text('NOVACION CREDITOS 754374233; 756354526', 35, 620, { align: 'left' },);

    // Rectangulo 9 (x, y, width, height)
    doc.rect(320, 635, 260, 60).stroke();

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('ROA del Cliente incluyendo nueva operación', 337, 650, { align: 'left' });

    // (X, Y aliegn) Info
    doc
      .fontSize(7)
      .text('-0.49%', 510, 650, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Target Segmento', 370, 660, { align: 'left' });

    // (X, Y aliegn) Info
    doc
      .fontSize(7)
      .text('0.17%', 510, 660, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Nivel de Atribución Tasa', 350, 670, { align: 'left' });

    // (X, Y aliegn) Info
    doc
      .fontSize(7)
      .text('VP Ejecutivo', 500, 670, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Semáforo de Riesgo', 370, 680, { align: 'left' });

    // (X, Y aliegn) Info
    doc
      .fontSize(7)
      .text('Cliente sin ajuste en Riesgo', 480, 680, { align: 'left', width: 250 });

    // Rectangulo 10 (x, y, width, height)
    doc.rect(30, 675, 280, 50).stroke();

    doc
      .fontSize(8)
      .font('Times-Bold')
      .text('Otros niveles de Atribución requeridos (DCC_FOR_130)', 80, 665, { underline: true, align: 'left', width: 250 },);

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Nivel de Atribución Monto', 50, 685, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('VP Comercial Banca Empresas', 190, 685, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Nivel de Atribución Excepción', 50, 695, { align: 'left', width: 250 });

    // (X, Y aliegn) Title
    doc
      .fontSize(7)
      .text('Nivel de Atribución Prorroga', 50, 710, { align: 'left', width: 250 });

    // Pie de página

    doc.moveDown(5);

    //PAG. 2 ----->>> Creación de nuava pagina en blanco <<<----- //
    doc
      .fontSize(10)
      .text(
        '',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    // Rectangulo Superior Header (x, y, width, height)
    doc.rect(30, 25, 550, 55).stroke(); // Solo borde
    // Crear linea vertical divisora 1
    const startX5 = 215; // Mantiene la misma posición en X
    const startY5 = 25; // Punto inicial en Y
    const endY5 = startY5 + 55; // Punto final en Y (ajusta la longitud)
    doc.moveTo(startX5, startY5) // Inicio de la línea
      .lineTo(startX5, endY5) // Mantiene X fijo y cambia solo Y
      .stroke();


    doc.image('./images/bancoLogo.png', 50, 50, {
      fit: [75, 75], // Tamaño ajustado
      align: 'left', // Alineado a la izquierda
      valign: 'top', // Alineado al principio
    })
    // (X, Y aliegn)
    doc.fontSize(7).text('FORMATO ÚNICO DE AUTORIZACIÓN PARA', 100, 45, { align: 'center' });
    doc.fontSize(7).text('OPERACIONES DEL ACTIVO Y PASIVO', 100, 55, { align: 'center' });

    // Crear linea vertical divisora 2
    const startX6 = 425;
    const startY6 = 25;
    const endY6 = startY6 + 55;
    doc.moveTo(startX6, startY6)
      .lineTo(startX6, endY6)
      .stroke();

    // Crear linea horizantal divisora 1
    const startX7 = 425;
    const endX7 = startX7 + 156;
    const middleY7 = 40;
    doc.moveTo(startX7, middleY7)
      .lineTo(endX7, middleY7)
      .stroke();

    // Crear linea horizantal divisora 2
    const startX8 = 425;
    const endX8 = startX8 + 156;
    const middleY8 = 55;
    doc.moveTo(startX8, middleY8)
      .lineTo(endX8, middleY8)
      .stroke();

    // Crear linea vertical divisora 3
    const startX9 = 505;
    const startY9 = 25;
    const endY9 = startY9 + 55;
    doc.moveTo(startX9, startY9)
      .lineTo(startX9, endY9)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(6).text('Código:', 455, 30);

    // (X, Y aliegn)
    doc.fontSize(6).text('DCC_FOR_130', 520, 30, { align: 'left', width: 250 });

    // (X, Y aliegn)
    doc.fontSize(6).text('Versión:', 455, 47);

    // (X, Y aliegn)
    doc.fontSize(6).text('V9', 540, 47, { align: 'left', width: 250 });

    // (X, Y aliegn)
    doc.fontSize(6).text('Fecha de actualización:', 435, 66);

    // (X, Y aliegn)
    doc.fontSize(6).text('26/03/2025', 530, 66, { align: 'left', width: 250 });

    // Rectangulo Superior Header (x, y, width, height)
    doc.rect(30, 90, 550, 90).stroke(); // Solo borde

    // Crear linea horizantal divisora 1
    const startX10 = 30;
    const endX10 = startX10 + 550;
    const middleY10 = 100;
    doc.moveTo(startX10, middleY10)
      .lineTo(endX10, middleY10)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('DETALLE CLIENTE', 100, 93, { align: 'center' });

    // Crear linea horizantal divisora 2
    const startX11 = 30;
    const endX11 = startX11 + 550;
    const middleY11 = 110;
    doc.moveTo(startX11, middleY11)
      .lineTo(endX11, middleY11)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Fecha de Solicitud:', 50, 103, { align: 'left' });

    // Crear linea vertical divisora 1
    const startX12 = 110;
    const startY12 = 100;
    const endY12 = startY12 + 10;
    doc.moveTo(startX12, startY12)
      .lineTo(startX12, endY12)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('30/09/2024', 115, 103, { align: 'left' }); //###

    // Crear linea vertical divisora 2
    const startX13 = 180;
    const startY13 = 100;
    const endY13 = startY13 + 10;
    doc.moveTo(startX13, startY13)
      .lineTo(startX13, endY13)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Código:', 185, 103, { align: 'left' });

    // Crear linea vertical divisora 3
    const startX14 = 210;
    const startY14 = 100;
    const endY14 = startY14 + 10;
    doc.moveTo(startX14, startY14)
      .lineTo(startX14, endY14)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('1779', 220, 103, { align: 'left' }); //###

    // Crear linea vertical divisora 4
    const startX15 = 240;
    const startY15 = 100;
    const endY15 = startY15 + 10;
    doc.moveTo(startX15, startY15)
      .lineTo(startX15, endY15)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Gerente CEO:', 245, 103, { align: 'left' });

    // Crear linea vertical divisora 5
    const startX16 = 280;
    const startY16 = 100;
    const endY16 = startY16 + 10;
    doc.moveTo(startX16, startY16)
      .lineTo(startX16, endY16)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Cristian Camilo Salazar Zuleta', 285, 103, { align: 'left' }); //###

    // Crear linea vertical divisora 6
    const startX17 = 375;
    const startY17 = 100;
    const endY17 = startY17 + 10;
    doc.moveTo(startX17, startY17)
      .lineTo(startX17, endY17)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Dirección:', 380, 103, { align: 'left' });

    // Crear linea vertical divisora 7
    const startX18 = 410;
    const startY18 = 100;
    const endY18 = startY18 + 10;
    doc.moveTo(startX18, startY18)
      .lineTo(startX18, endY18)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Corporativo', 415, 103, { align: 'left' });//###

    // Crear linea vertical divisora 8
    const startX19 = 470;
    const startY19 = 100;
    const endY19 = startY19 + 10;
    doc.moveTo(startX19, startY19)
      .lineTo(startX19, endY19)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Segmento:', 480, 103, { align: 'left' });

    // Crear linea vertical divisora 9
    const startX20 = 520;
    const startY20 = 100;
    const endY20 = startY20 + 10;
    doc.moveTo(startX20, startY20)
      .lineTo(startX20, endY20)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Corporativo', 535, 103, { align: 'left', width: 250 });//###

    // Crear linea horizantal divisora 3
    const startX21 = 30;
    const endX21 = startX21 + 550;
    const middleY21 = 120;
    doc.moveTo(startX21, middleY21)
      .lineTo(endX21, middleY21)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Cliente:', 50, 113, { align: 'left' });

    // Crear linea vertical divisora 10
    const startX22 = 110;
    const startY22 = 110;
    const endY22 = startY22 + 10;
    doc.moveTo(startX22, startY22)
      .lineTo(startX22, endY22)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('ISAGEN S.A.E.S.P', 115, 113, { align: 'left' });

    // Crear linea horizantal divisora 3
    const startX223 = 30;
    const endX223 = startX223 + 550;
    const middleY223 = 120;
    doc.moveTo(startX223, middleY223)
      .lineTo(endX223, middleY223)
      .stroke();


    // Crear linea horizantal divisora 4
    const startX23 = 30;
    const endX23 = startX23 + 550;
    const middleY23 = 130;
    doc.moveTo(startX23, middleY23)
      .lineTo(endX23, middleY23)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Tipo de ID:', 50, 123, { align: 'left' });

    // Crear linea vertical divisora 11
    const startX24 = 155;
    const startY24 = 120;
    const endY24 = startY24 + 10;
    doc.moveTo(startX24, startY24)
      .lineTo(startX24, endY24)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Nit', 180, 123, { align: 'left' }); //###

    // Crear linea vertical divisora 12
    const startX125 = 210;
    const startY125 = 120;
    const endY125 = startY125 + 10;
    doc.moveTo(startX125, startY125)
      .lineTo(startX125, endY125)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Número ID:', 216, 123, { align: 'left' });

    // Crear linea vertical divisora 13
    const startX126 = 250;
    const startY126 = 120;
    const endY126 = startY126 + 10;
    doc.moveTo(startX126, startY126)
      .lineTo(startX126, endY126)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('8110007404', 260, 123, { align: 'left' }); //###

    // Crear linea vertical divisora 14
    const startX127 = 295;
    const startY127 = 120;
    const endY127 = startY127 + 10;
    doc.moveTo(startX127, startY127)
      .lineTo(startX127, endY127)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Nombre Grupo:', 317, 123, { align: 'left' });

    // Crear linea vertical divisora 15
    const startX128 = 375;
    const startY128 = 120;
    const endY128 = startY128 + 10;
    doc.moveTo(startX128, startY128)
      .lineTo(startX128, endY128)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('ISAGEN S.A. E.S.P', 390, 123, { align: 'left' }); //###

    // Crear linea horizantal divisora 5
    const startX29 = 30;
    const endX29 = startX29 + 550;
    const middleY29 = 140;
    doc.moveTo(startX29, middleY29)
      .lineTo(endX29, middleY29)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Calificación Cifin:', 50, 133, { align: 'left' });

    // Crear linea vertical divisora 11
    const startX30 = 155;
    const startY30 = 130;
    const endY30 = startY30 + 10;
    doc.moveTo(startX30, startY30)
      .lineTo(startX30, endY30)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('A', 180, 133, { align: 'left' }); //###

    // Crear linea vertical divisora 12
    const startX131 = 210;
    const startY131 = 130;
    const endY131 = startY131 + 10;
    doc.moveTo(startX131, startY131)
      .lineTo(startX131, endY131)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Rating Financiero:', 230, 133, { align: 'left' });

    // Crear linea vertical divisora 12
    const startX132 = 295;
    const startY132 = 130;
    const endY132 = startY132 + 10;
    doc.moveTo(startX132, startY132)
      .lineTo(startX132, endY132)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('2', 335, 133, { align: 'left' }); //###

    // Crear linea vertical divisora 12
    const startX133 = 375;
    const startY133 = 130;
    const endY133 = startY133 + 10;
    doc.moveTo(startX133, startY133)
      .lineTo(startX133, endY133)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Clasificación (EPC)', 405, 133, { align: 'left' });

    // Crear linea vertical divisora 12
    const startX134 = 470;
    const startY134 = 130;
    const endY134 = startY134 + 10;
    doc.moveTo(startX134, startY134)
      .lineTo(startX134, endY134)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Estratégico', 510, 133, { align: 'left', width: 250 },);

    // Crear linea horizantal divisora 6
    const startX35 = 30;
    const endX35 = startX35 + 550;
    const middleY35 = 150;
    doc.moveTo(startX35, middleY35)
      .lineTo(endX35, middleY35)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Priorización (BCPM):', 50, 143, { align: 'left' });

    // Crear linea vertical divisora 12
    const startX136 = 315;
    const startY136 = 140;
    const endY136 = startY136 + 10;
    doc.moveTo(startX136, startY136)
      .lineTo(startX136, endY136)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Blindar', 435, 143, { align: 'left' }); //###

    // Crear linea horizantal divisora 7
    const startX37 = 30;
    const endX37 = startX37 + 550;
    const middleY37 = 160;
    doc.moveTo(startX37, middleY37)
      .lineTo(endX37, middleY37)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Relación pasivo/activo acumulado año (# veces):', 50, 153, { align: 'left' });

    // Crear linea vertical divisora 13
    const startX38 = 260;
    const startY38 = 150;
    const endY38 = startY38 + 10;
    doc.moveTo(startX38, startY38)
      .lineTo(startX38, endY38)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('0.03', 290, 153, { align: 'left' }); //###

    // Crear linea horizantal divisora 8
    const startX39 = 30;
    const endX39 = startX39 + 550;
    const middleY39 = 170;
    doc.moveTo(startX39, middleY39)
      .lineTo(endX39, middleY39)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Margen de contribución ultimos 12 meses Cliente (Cifras en miles de $):', 50, 163, { align: 'left' });

    // Crear linea vertical divisora 14
    const startX40 = 315;
    const startY40 = 160;
    const endY40 = startY40 + 10;
    doc.moveTo(startX40, startY40)
      .lineTo(startX40, endY40)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('-$ 4,092,432,417.63', 325, 163, { align: 'left' }); //##      

    // Crear linea vertical divisora 15
    const startX41 = 380;
    const startY41 = 160;
    const endY41 = startY41 + 10;
    doc.moveTo(startX41, startY41)
      .lineTo(startX41, endY41)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Mes corte MC:', 410, 163, { align: 'left' });

    // Crear linea vertical divisora 16
    const startX142 = 470;
    const startY142 = 160;
    const endY142 = startY142 + 10;
    doc.moveTo(startX142, startY142)
      .lineTo(startX142, endY142)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Junio', 480, 163, { align: 'left' }); //###

    // (X, Y aliegn)
    doc.fontSize(5).text('Margen de contribución año corrido Grupo (Cifras en miles de $):', 50, 173, { align: 'left' });

    // Crear linea vertical divisora 17
    const startX44 = 315;
    const startY44 = 170;
    const endY44 = startY44 + 10;
    doc.moveTo(startX44, startY44)
      .lineTo(startX44, endY44)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('-$ 4,092,432,418.00', 325, 173, { align: 'left' }); //##

    // Rectangulo con relleno azul
    doc.rect(30, 190, 550, 12).fill('#d6eaf8');

    // (X, Y aliegn)
    doc
      .fillColor('black')
      .fontSize(6).text('DETALLE OPERACIÓN QUE SE APRUEBA', 100, 195, { align: 'center' });

    // Rectangulo Superior Header (x, y, width, height)
    doc.rect(30, 215, 210, 13).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Producto', 50, 220, { align: 'left' });

    // Crear linea vertical divisora 17
    const startX45 = 150;
    const startY45 = 215;
    const endY45 = startY45 + 13;
    doc.moveTo(startX45, startY45)
      .lineTo(startX45, endY45)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Activo', 160, 220, { align: 'left' }); //###

    // Rectangulo Superior Header (x, y, width, height)
    doc.rect(30, 235, 550, 160).stroke();

    // Crear linea horizantal divisora 9
    const startX46 = 30;
    const endX46 = startX46 + 550;
    const middleY46 = 245;
    doc.moveTo(startX46, middleY46)
      .lineTo(endX46, middleY46)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Tipo de Operación:', 50, 239, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 17
    const startX47 = 240;
    const startY47 = 235;
    const endY47 = startY47 + 10;
    doc.moveTo(startX47, startY47)
      .lineTo(startX47, endY47)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Cartera Ordinaria', 248, 239, { align: 'left' }); //###

    // Crear linea vertical divisora 18
    const startX48 = 380;
    const startY48 = 235;
    const endY48 = startY48 + 10;
    doc.moveTo(startX48, startY48)
      .lineTo(startX48, endY48)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Operacíon Cr. Constructor:', 385, 239, { align: 'left' })
      .fillColor('black');


    // Crear linea vertical divisora 19
    const startX49 = 480;
    const startY49 = 235;
    const endY49 = startY49 + 10;
    doc.moveTo(startX49, startY49)
      .lineTo(startX49, endY49)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 490, 239, { align: 'left', width: 250 }); //###

    // Crear linea horizantal divisora 10
    const startX50 = 30;
    const endX50 = startX50 + 550;
    const middleY50 = 255;
    doc.moveTo(startX50, middleY50)
      .lineTo(endX50, middleY50)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Monto:', 50, 249, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 20
    const startX51 = 100;
    const startY51 = 245;
    const endY51 = startY51 + 10;
    doc.moveTo(startX51, startY51)
      .lineTo(startX51, endY51)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('200,000,000,000.00', 110, 249, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 21
    const startX52 = 200;
    const startY52 = 245;
    const endY52 = startY52 + 10;
    doc.moveTo(startX52, startY52)
      .lineTo(startX52, endY52)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Moneda:', 210, 249, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 22
    const startX53 = 240;
    const startY53 = 245;
    const endY53 = startY53 + 10;
    doc.moveTo(startX53, startY53)
      .lineTo(startX53, endY53)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('COP', 250, 249, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 23
    const startX54 = 270;
    const startY54 = 245;
    const endY54 = startY54 + 10;
    doc.moveTo(startX54, startY54)
      .lineTo(startX54, endY54)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Tasa Propuesta', 280, 249, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 24
    const startX55 = 330;
    const startY55 = 245;
    const endY55 = startY55 + 10;
    doc.moveTo(startX55, startY55)
      .lineTo(startX55, endY55)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('IBR 3m', 345, 249, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 25
    const startX56 = 380;
    const startY56 = 245;
    const endY56 = startY56 + 10;
    doc.moveTo(startX56, startY56)
      .lineTo(startX56, endY56)
      .stroke();


    // Crear linea vertical divisora 26
    const startX57 = 430;
    const startY57 = 245;
    const endY57 = startY57 + 10;
    doc.moveTo(startX57, startY57)
      .lineTo(startX57, endY57)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Spread', 435, 249, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 27
    const startX58 = 480;
    const startY58 = 245;
    const endY58 = startY58 + 10;
    doc.moveTo(startX58, startY58)
      .lineTo(startX58, endY58)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('2.95%', 500, 249, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 28
    const startX59 = 530;
    const startY59 = 245;
    const endY59 = startY59 + 10;
    doc.moveTo(startX59, startY59)
      .lineTo(startX59, endY59)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('TV', 540, 249, { align: 'left', width: 250 }); //###


    // Crear linea horizantal divisora 11
    const startX60 = 30;
    const endX60 = startX60 + 550;
    const middleY60 = 265;
    doc.moveTo(startX60, middleY60)
      .lineTo(endX60, middleY60)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Plazo:', 50, 259, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 29
    const startX61 = 100;
    const startY61 = 255;
    const endY61 = startY61 + 10;
    doc.moveTo(startX61, startY61)
      .lineTo(startX61, endY61)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('72', 120, 259, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 30
    const startX62 = 150;
    const startY62 = 255;
    const endY62 = startY62 + 10;
    doc.moveTo(startX62, startY62)
      .lineTo(startX62, endY62)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Meses', 163, 259, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 31
    const startX63 = 190;
    const startY63 = 255;
    const endY63 = startY63 + 10;
    doc.moveTo(startX63, startY63)
      .lineTo(startX63, endY63)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Periocidad pago de', 205, 259, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 32
    const startX64 = 260;
    const startY64 = 255;
    const endY64 = startY64 + 10;
    doc.moveTo(startX64, startY64)
      .lineTo(startX64, endY64)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Trimestral', 290, 259, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 33
    const startX65 = 380;
    const startY65 = 255;
    const endY65 = startY65 + 10;
    doc.moveTo(startX65, startY65)
      .lineTo(startX65, endY65)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Amortización:', 410, 259, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 34
    const startX66 = 480;
    const startY66 = 255;
    const endY66 = startY66 + 10;
    doc.moveTo(startX66, startY66)
      .lineTo(startX66, endY66)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Semestral', 500, 259, { align: 'left', width: 250 }); //###

    // Crear linea horizantal divisora 11
    const startX67 = 30;
    const endX67 = startX67 + 550;
    const middleY67 = 275;
    doc.moveTo(startX67, middleY67)
      .lineTo(endX67, middleY67)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Desembolso', 50, 269, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 35
    const startX68 = 100;
    const startY68 = 265;
    const endY68 = startY68 + 10;
    doc.moveTo(startX68, startY68)
      .lineTo(startX68, endY68)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Novación', 120, 269, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 36
    const startX69 = 190;
    const startY69 = 265;
    const endY69 = startY69 + 10;
    doc.moveTo(startX69, startY69)
      .lineTo(startX69, endY69)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Tasa', 200, 269, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 37
    const startX70 = 220;
    const startY70 = 265;
    const endY70 = startY70 + 10;
    doc.moveTo(startX70, startY70)
      .lineTo(startX70, endY70)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('IBR (3M)', 230, 269, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 38
    const startX71 = 260;
    const startY71 = 265;
    const endY71 = startY71 + 10;
    doc.moveTo(startX71, startY71)
      .lineTo(startX71, endY71)
      .stroke();

    // Crear linea vertical divisora 38
    const startX72 = 300;
    const startY72 = 265;
    const endY72 = startY72 + 10;
    doc.moveTo(startX72, startY72)
      .lineTo(startX72, endY72)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Spread:', 315, 269, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 39
    const startX73 = 345;
    const startY73 = 265;
    const endY73 = startY73 + 10;
    doc.moveTo(startX73, startY73)
      .lineTo(startX73, endY73)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('3.90%', 350, 269, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 40
    const startX74 = 370;
    const startY74 = 265;
    const endY74 = startY74 + 10;
    doc.moveTo(startX74, startY74)
      .lineTo(startX74, endY74)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('TV', 395, 269, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 41
    const startX75 = 430;
    const startY75 = 265;
    const endY75 = startY75 + 10;
    doc.moveTo(startX75, startY75)
      .lineTo(startX75, endY75)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Margen neto de intereses(%)', 450, 269, { align: 'left', width: 250 })
      .fillColor('black');

    // Crear linea vertical divisora 42
    const startX76 = 530;
    const startY76 = 265;
    const endY76 = startY76 + 10;
    doc.moveTo(startX76, startY76)
      .lineTo(startX76, endY76)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('0.84%', 550, 269, { align: 'left', width: 250 }); //###

    // Crear linea horizantal divisora 12
    const startX77 = 30;
    const endX77 = startX77 + 550;
    const middleY77 = 285;
    doc.moveTo(startX77, middleY77)
      .lineTo(endX77, middleY77)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Periodo de Gracia', 50, 279, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 35
    const startX78 = 100;
    const startY78 = 275;
    const endY78 = startY78 + 10;
    doc.moveTo(startX78, startY78)
      .lineTo(startX78, endY78)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Si', 125, 279, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 35
    const startX79 = 150;
    const startY79 = 275;
    const endY79 = startY79 + 10;
    doc.moveTo(startX79, startY79)
      .lineTo(startX79, endY79)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Plazo en meses:', 170, 279, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 35
    const startX80 = 220;
    const startY80 = 275;
    const endY80 = startY80 + 10;
    doc.moveTo(startX80, startY80)
      .lineTo(startX80, endY80)
      .stroke()

    // (X, Y aliegn)
    doc.fontSize(5).text('24', 237, 279, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 35
    const startX81 = 260;
    const startY81 = 275;
    const endY81 = startY81 + 10;
    doc.moveTo(startX81, startY81)
      .lineTo(startX81, endY81)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Clase de Garantia:', 330, 279, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 35
    const startX82 = 430;
    const startY82 = 275;
    const endY82 = startY82 + 10;
    doc.moveTo(startX82, startY82)
      .lineTo(startX82, endY82)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 460, 279, { align: 'left', width: 250 }); //###

    // Crear linea horizantal divisora 13
    const startX83 = 30;
    const endX83 = startX83 + 550;
    const middleY83 = 295;
    doc.moveTo(startX83, middleY83)
      .lineTo(endX83, middleY83)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('ROA (12 Meses): ', 50, 289, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 36
    const startX84 = 100;
    const startY84 = 285;
    const endY84 = startY84 + 10;
    doc.moveTo(startX84, startY84)
      .lineTo(startX84, endY84)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('-0.83%', 120, 289, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 37
    const startX85 = 150;
    const startY85 = 285;
    const endY85 = startY85 + 10;
    doc.moveTo(startX85, startY85)
      .lineTo(startX85, endY85)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('ROA de la ', 175, 289, { align: 'left' }) //***
      .fillColor('black');

    // Crear linea vertical divisora 38
    const startX86 = 220;
    const startY86 = 285;
    const endY86 = startY86 + 10;
    doc.moveTo(startX86, startY86)
      .lineTo(startX86, endY86)
      .stroke()

    // (X, Y aliegn)
    doc.fontSize(5).text('0.36%', 235, 289, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 38
    const startX87 = 260;
    const startY87 = 285;
    const endY87 = startY87 + 10;
    doc.moveTo(startX87, startY87)
      .lineTo(startX87, endY87)
      .stroke()

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('ROA del cliente incluyendo nueva operación: ', 270, 289, { align: 'left' }) //***
      .fillColor('black');

    // Crear linea vertical divisora 39
    const startX88 = 375;
    const startY88 = 285;
    const endY88 = startY88 + 10;
    doc.moveTo(startX88, startY88)
      .lineTo(startX88, endY88)
      .stroke()

    // (X, Y aliegn)
    doc.fontSize(5).text('-0.49%', 395, 289, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 40
    const startX89 = 430;
    const startY89 = 285;
    const endY89 = startY89 + 10;
    doc.moveTo(startX89, startY89)
      .lineTo(startX89, endY89)
      .stroke()

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Tarjet de rentabilidad objetivo del', 440, 289, { align: 'left', width: 250 }) //***
      .fillColor('black');

    // Crear linea vertical divisora 41
    const startX90 = 530;
    const startY90 = 285;
    const endY90 = startY90 + 10;
    doc.moveTo(startX90, startY90)
      .lineTo(startX90, endY90)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('0.04%', 550, 289, { align: 'left', width: 250 }); //###

    // Crear linea horizantal divisora 14
    const startX91 = 30;
    const endX91 = startX91 + 550;
    const middleY91 = 325;
    doc.moveTo(startX91, middleY91)
      .lineTo(endX91, middleY91)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Observaciones:', 50, 299, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 36
    const startX92 = 100;
    const startY92 = 295;
    const endY92 = startY92 + 30;
    doc.moveTo(startX92, startY92)
      .lineTo(startX92, endY92)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 110, 299, { align: 'left', width: 250 }); //### ***

    // (X, Y aliegn)
    doc.fontSize(5).text('Visto Bueno de Tasa', 120, 335, { align: 'left' });

    // Rectangulo de respuesta 1
    doc.rect(175, 330, 25, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('X', 185, 335, { align: 'left' }); //###

    // (X, Y aliegn)
    doc.fontSize(5).text('Nivel de Atribución', 210, 335, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text('Nivel de Atribución', 210, 350, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text('Nivel de Atribución', 210, 365, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text('Nivel de Atribución', 210, 380, { align: 'left' });

    // Rectangulo siguiente a la respuesta
    doc.rect(275, 330, 140, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('VP Ejecutivo', 285, 335, { align: 'left' }); //###

    // (X, Y aliegn)
    doc.fontSize(5).text('Internal.', 445, 335, { align: 'left' });

    // Rectangulo siguiente a la respuesta
    doc.rect(470, 330, 100, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 480, 335, { align: 'left', width: 250 }); //###


    // (X, Y aliegn)
    doc.fontSize(5).text('Visto Bueno Monto', 120, 350, { align: 'left' });

    // Rectangulo de respuesta 2
    doc.rect(175, 345, 25, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('X', 185, 350, { align: 'left' }); //###

    // (X, Y aliegn)
    doc.fontSize(5).text('Visto Bueno Excepción', 120, 365, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text('', 185, 365, { align: 'left' }); //###

    // Rectangulo siguiente a la respuesta
    doc.rect(275, 360, 140, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 285, 365, { align: 'left' }); //###

    // Rectangulo siguiente a la respuesta
    doc.rect(275, 375, 140, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 285, 380, { align: 'left' }); //###


    // Rectangulo siguiente a la respuesta
    doc.rect(275, 345, 140, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('VP Comercial Banca Empresas', 285, 350, { align: 'left' }); //###

    // (X, Y aliegn)
    doc.fontSize(5).text('Credito', 445, 350, { align: 'left' });

    // Rectangulo siguiente a la respuesta
    doc.rect(470, 345, 100, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('No Cobro sanción prepago ', 445, 380, { align: 'left' });

    // Rectangulo siguiente a la respuesta
    doc.rect(510, 375, 20, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 518, 380, { align: 'left' }); // ###

    // Rectangulo de respuesta 3
    doc.rect(175, 360, 25, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 185, 365, { align: 'left' }); //###

    // (X, Y aliegn)
    doc.fontSize(5).text('Visto Bueno Prórroga', 120, 380, { align: 'left' });

    // Rectangulo de respuesta 4
    doc.rect(175, 375, 25, 12).stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('', 185, 380, { align: 'left' }); //###


    // (X, Y aliegn)
    doc
      .fillColor('black')
      .fontSize(6).text('RECIPROCIDAD CIFRAS EN MILES DE $', 100, 410, { align: 'center' });

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Ahorros S.V.', 50, 422, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 49
    const startX114 = 170;
    const startY114 = 418;
    const endY114 = startY114 + 22;
    doc.moveTo(startX114, startY114)
      .lineTo(startX114, endY114)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`$ 8,138,764.00`, 180, 422, { align: 'left' }); //###

    // Crear linea vertical divisora 50
    const startX115 = 320;
    const startY115 = 418;
    const endY115 = startY115 + 10;
    doc.moveTo(startX115, startY115)
      .lineTo(startX115, endY115)
      .stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Corrientes S.V.', 330, 422, { align: 'left' })
      .fillColor('black');

    // Crear linea vertical divisora 51
    const startX116 = 450;
    const startY116 = 418;
    const endY116 = startY116 + 10;
    doc.moveTo(startX116, startY116)
      .lineTo(startX116, endY116)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`$ 0.00`, 460, 422, { align: 'left' }); //###

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('CDTS', 50, 434, { align: 'left' })
      .fillColor('black');

    // (X, Y aliegn)
    doc.fontSize(5).text(`$ 0.00`, 180, 434, { align: 'left' }); //###


    // Rectangulo Superior Header (x, y, width, height)
    doc.rect(30, 405, 550, 35).stroke();

    // Crear linea horizantal divisora 15
    const startX93 = 30;
    const endX93 = startX93 + 550;
    const middleY93 = 418;
    doc.moveTo(startX93, middleY93)
      .lineTo(endX93, middleY93)
      .stroke();

    // Crear linea horizantal divisora 16
    const startX94 = 30;
    const endX94 = startX94 + 550;
    const middleY94 = 428;
    doc.moveTo(startX94, middleY94)
      .lineTo(endX94, middleY94)
      .stroke();

    // Rectangulo con relleno azul
    doc.rect(30, 450, 550, 12).fill('#d6eaf8');

    // (X, Y aliegn)
    doc
      .fillColor('black')
      .fontSize(6).text('DETALLE ENDEUDAMIENTO', 100, 454, { align: 'center' });

    // Rectangulo Inferior Header (x, y, width, height)
    doc.rect(30, 470, 550, 40).stroke();

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('LEA (cifras en miles de $):', 50, 475, { align: 'left' })
      .fillColor('black');

    // (X, Y aliegn)
    doc.fontSize(5).text(`836,794,570.00`, 540, 475, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Total utilizado (cifras en miles de $):', 50, 485, { align: 'left' })
      .fillColor('black');

    // (X, Y aliegn)
    doc.fontSize(5).text(`539,887,757.00`, 540, 485, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Monto aprobado familia (cifras en miles de $):', 50, 495, { align: 'left' })
      .fillColor('black');

    // (X, Y aliegn)
    doc.fontSize(5).text(`400,000,000.00`, 540, 495, { align: 'left', width: 250 }); //###

    // (X, Y aliegn)
    doc
      .fillColor('#777777')
      .fontSize(5).text('Margen neto de intereses:', 50, 505, { align: 'left' })
      .fillColor('black');

    // (X, Y aliegn)
    doc.fontSize(5).text(`0.84%`, 557, 505, { align: 'left', width: 250 }); //###


    // Crear linea horizantal divisora 17
    const startX95 = 30;
    const endX95 = startX95 + 550;
    const middleY95 = 480;
    doc.moveTo(startX95, middleY95)
      .lineTo(endX95, middleY95)
      .stroke();

    // Crear linea horizantal divisora 18
    const startX96 = 30;
    const endX96 = startX96 + 550;
    const middleY96 = 490;
    doc.moveTo(startX96, middleY96)
      .lineTo(endX96, middleY96)
      .stroke();

    // Crear linea horizantal divisora 19
    const startX97 = 30;
    const endX97 = startX97 + 550;
    const middleY97 = 500;
    doc.moveTo(startX97, middleY97)
      .lineTo(endX97, middleY97)
      .stroke();

    // Crear linea vertical divisora 37
    const startX98 = 220;
    const startY98 = 470;
    const endY98 = startY98 + 40;
    doc.moveTo(startX98, startY98)
      .lineTo(startX98, endY98)
      .stroke();

    // Rectangulo con relleno azul
    doc.rect(30, 520, 550, 12).fill('#d6eaf8');

    // (X, Y aliegn)
    doc
      .fillColor('black')
      .fontSize(6).text('VALIDACIÓN COMERCIAL (RIESGO CLIENTE)', 100, 524, { align: 'center' });

    // Rectangulo Inferior Header (x, y, width, height)
    doc.rect(30, 540, 550, 100).stroke();

    // Crear linea horizantal divisora 20
    const startX99 = 30;
    const endX99 = startX99 + 550;
    const middleY99 = 555;
    doc.moveTo(startX99, middleY99)
      .lineTo(endX99, middleY99)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Se analizaron las Cifras del cliente?', 35, 545, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text(`Si`, 197, 545, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 37
    const startX100 = 180;
    const startY100 = 540;
    const endY100 = startY100 + 15;
    doc.moveTo(startX100, startY100)
      .lineTo(startX100, endY100)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Fecha de Corte de las Cifras', 224, 545, { align: 'left' });

    // Crear linea vertical divisora 38
    const startX101 = 220;
    const startY101 = 540;
    const endY101 = startY101 + 15;
    doc.moveTo(startX101, startY101)
      .lineTo(startX101, endY101)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`30/06/2024`, 380, 545, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 39
    const startX102 = 350;
    const startY102 = 540;
    const endY102 = startY102 + 15;
    doc.moveTo(startX102, startY102)
      .lineTo(startX102, endY102)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Se Revisó Cifin?:', 440, 545, { align: 'left' });

    // Crear linea vertical divisora 40
    const startX103 = 430;
    const startY103 = 540;
    const endY103 = startY103 + 15;
    doc.moveTo(startX103, startY103)
      .lineTo(startX103, endY103)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`Si`, 557, 545, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 41
    const startX104 = 540;
    const startY104 = 540;
    const endY104 = startY104 + 15;
    doc.moveTo(startX104, startY104)
      .lineTo(startX104, endY104)
      .stroke();

    // Crear linea horizantal divisora 21
    const startX105 = 30;
    const endX105 = startX105 + 550;
    const middleY105 = 580;
    doc.moveTo(startX105, middleY105)
      .lineTo(endX105, middleY105)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Observaciones para calificaciones diferentes a A: ', 35, 565, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text(``, 165, 565, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 42
    const startX106 = 160;
    const startY106 = 555;
    const endY106 = startY106 + 25;
    doc.moveTo(startX106, startY106)
      .lineTo(startX106, endY106)
      .stroke();

    // Crear linea horizantal divisora 22
    const startX107 = 30;
    const endX107 = startX107 + 550;
    const middleY107 = 590;
    doc.moveTo(startX107, middleY107)
      .lineTo(endX107, middleY107)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Realizo Visita comercial en el último trimestre?', 35, 583, { align: 'left' });

    // Crear linea vertical divisora 43
    const startX108 = 180;
    const startY108 = 580;
    const endY108 = startY108 + 10;
    doc.moveTo(startX108, startY108)
      .lineTo(startX108, endY108)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`Si`, 197, 583, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 44
    const startX109 = 220;
    const startY109 = 580;
    const endY109 = startY109 + 10;
    doc.moveTo(startX109, startY109)
      .lineTo(startX109, endY109)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Nivel de Riesgo:', 230, 583, { align: 'left' });

    // Crear linea vertical divisora 45
    const startX110 = 310;
    const startY110 = 580;
    const endY110 = startY110 + 10;
    doc.moveTo(startX110, startY110)
      .lineTo(startX110, endY110)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`Bajo`, 345, 583, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 46
    const startX111 = 390;
    const startY111 = 580;
    const endY111 = startY111 + 10;
    doc.moveTo(startX111, startY111)
      .lineTo(startX111, endY111)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Rating', 440, 583, { align: 'left' });

    // Crear linea vertical divisora 47
    const startX112 = 520;
    const startY112 = 580;
    const endY112 = startY112 + 10;
    doc.moveTo(startX112, startY112)
      .lineTo(startX112, endY112)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text(`2`, 548, 583, { align: 'left', width: 250 }); //###

    // Crear linea vertical divisora 48
    const startX113 = 140;
    const startY113 = 590;
    const endY113 = startY113 + 50;
    doc.moveTo(startX113, startY113)
      .lineTo(startX113, endY113)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Recomendación Comercial para el', 35, 605, { align: 'left' });
    doc.fontSize(5).text('desembolso:', 35, 610, { align: 'left' });

    // (X, Y aliegn)
    doc.fontSize(5).text(``, 145, 605, { align: 'left', width: 250 }); //###

    doc.end();

    await new Promise((resolve) => {
      doc.on('end', resolve);
    });

    const pdfBuffer = writableStream.getContents();
    const pdfBase64 = pdfBuffer.toString('base64');

    return res.send({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Resumen Pricing y FOR130 SIN Aprobar_${new Date().getTime()}.pdf"`,
      },
      builtPdf: pdfBase64,
      isBase64Encoded: true,
    });
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return res.send({
      statusCode: 500,
      builtPdf: JSON.stringify({
        message: 'Error al generar el PDF',
        error: error.message,
      }),
    });
  }
});

const response = async (statusCode, message, data) => {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: await servCryp.encrypt(
      JSON.stringify({ message: message, data: data }),
      sk
    ),
    isBase64Encoded: false,
  };
};

app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
