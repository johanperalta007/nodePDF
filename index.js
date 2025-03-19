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

    // Obtener la fecha actual
    const fechaActual = new Date();

    // Formatear la fecha en el formato "23 de diciembre de 2024"
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    // Rectangulo 1 (x, y, width, height)
    doc.rect(30, 25, 550, 55).stroke(); // Solo borde
    //doc.rect(300, 50, 200, 100).fill('#3498db'); // Relleno azul

    doc.image('./images/bancoLogo.png', 50, 50, {
      fit: [75, 75], // Tamaño ajustado
      align: 'left', // Alineado a la izquierda
      valign: 'top', // Alineado al principio
    });

    doc.fontSize(8).text('Herramienta de Pricing CEOIS Versión: V5', 100, 50, { align: 'center' });
    doc
      .fontSize(6)
      .text(`Fecha de vigencia de la herramienta del ${dia} de`, 100, 45, {
        align: 'right',
      });
    doc
      .fontSize(6)
      .text(`${mes} al ${dia} de Septiembre de ${anio}`, 100, 55, { align: 'right' });

    doc.moveDown(2); // Espaciado adicional

    // Título principal
    //doc
    //.fontSize(20)
    //.font('Times-Bold')
    //.text('DOCUMENTO LEGAL', { align: 'center' });
    //doc.fontSize(16).font('Times-Bold').text('Herramienta de Pricing CEOIS Versión: V5', { align: 'center' });

    doc.moveDown(1); // Espaciado adicional

    // Rectangulo 2 (x, y, width, height)
    doc.rect(30, 90, 280, 45).stroke();

    // Rectangulo 2.0 (x, y, width, height)
    doc.rect(30, 145, 280, 45).stroke();

    doc.moveDown(2); // Espaciado adicional

    // Pipe el PDF a un archivo
    doc.pipe(fs.createWriteStream('output.pdf'));

    // Ajustar la posición x para alinear más a la izquierda
    const leftMargin = 50;

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
      .text('Pago Intereses', 178, 520, { align: 'left' },);

      // (X, Y aliegn) Valor 2
    doc.fontSize(7).text('Trimestral', 265, 520, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Comisiones Negociadas', 35, 550, { align: 'left' },)
      .text('(por año) %', 35, 556, { align: 'left' },);
      // (X, Y aliegn) Valor
    doc.fontSize(7).text('0.00%', 116, 550, { align: 'left' }); //###

    doc
      .fontSize(7)
      .font('Times-Bold')
      .text('Evaluación de Rentabilidad (Anualidad)', 395, 395, { underline: true, align: 'left', width: 250 },);


    // Rectangulo 7 (x, y, width, height)
    doc.rect(320, 390, 260, 235).stroke();
    // Crear linea horizantal divisora 4
    const startX4 = 320;
    const endX4 = startX4 + 260;
    const middleY4 = 405;
    doc.moveTo(startX4, middleY4)
      .lineTo(endX4, middleY4)
      .stroke();

    // Rectangulo 8 (x, y, width, height)
    doc.rect(30, 600, 280, 145).stroke();

    // Rectangulo 9 (x, y, width, height)
    doc.rect(320, 635, 260, 60).stroke();

    // Rectangulo 10 (x, y, width, height)
    doc.rect(320, 705, 260, 60).stroke();

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
    doc.fontSize(6).text('DCC_FOR_130', 515, 30, { align: 'left' });

    // Rectangulo Superior Header (x, y, width, height)
    doc.rect(30, 90, 550, 130).stroke(); // Solo borde

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
    doc.fontSize(5).text('Segmento:', 480, 103, { align: 'left' });//###

    // Crear linea vertical divisora 9
    const startX20 = 520;
    const startY20 = 100;
    const endY20 = startY20 + 10;
    doc.moveTo(startX20, startY20)
      .lineTo(startX20, endY20)
      .stroke();

    // (X, Y aliegn)
    doc.fontSize(5).text('Esto es una ', 520, 103, { align: 'left' });//###





    // Creación de nuava pagina en blanco con la opción de texto
    doc
      .fontSize(10)
      .text(
        'Esto es un documento que se a generado automaticamente. Actualemnte en construcción 🚧',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

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
