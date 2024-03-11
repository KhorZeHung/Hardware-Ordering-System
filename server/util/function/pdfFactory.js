const { sign } = require("crypto");
const PDFDocument = require("pdfkit");

function createQuotation(data, start, end) {
  // Create a new PDF document
  const doc = new PDFDocument({ bufferPages: true });

  const displayCenter = {
    width: doc.page.width,
    align: "center",
  };

  doc.on("data", start);
  doc.on("end", end);

  doc.moveDown(0.3);
  doc.x = 0;
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text("THINKTOP DESIGN SERVICES", displayCenter);

  doc.moveDown(0.3);
  doc
    .fontSize(8)
    .font("Helvetica")
    .text("Reg No : 202203091468 (AS0446602-U)", displayCenter);
  doc.moveDown(0.3);
  doc.text(
    "No 8, Jalan Pandan Indah 4/22, Pandan Indah, 55100 Kuala Lumpur",
    displayCenter
  );
  doc.moveDown(0.3);
  doc.text(
    "Email : thinktopdesign@gmail.com       Contact: 017-609 6446",
    displayCenter
  );

  doc.moveDown(2);
  doc.moveTo(0, doc.y).lineTo(doc.page.width, doc.y).stroke();
  doc.moveDown(2);
  // Title
  doc.fontSize(14).text("Quotation List", displayCenter);

  // Define table width and column widths
  const tableWidth = 500;
  const column1Width = 0.3 * tableWidth;
  const quote_total = data.quote_sub_total;
  const maxPageHeight = doc.page.height - 70;

  const clientInfo = {
    attn: [
      data.quote_client_name,
      data.quote_client_contact,
      data.quote_prop_type,
    ].join(", "),
    address: data.quote_address,
  };

  const referenceInfo = {
    "quote id": data.quote_id,
    date: new Date(data.created_at).toLocaleDateString("en-GB"),
  };

  const y = doc.y;

  // Draw client information on the left side
  Object.entries(clientInfo).forEach(([key, value], index) => {
    const valueHeight = doc.heightOfString(value, {
      width: 250,
    });
    let leftY = y + (index + 1) * 20;
    doc.x = 50;
    doc.y = leftY;
    doc.font("Helvetica").fontSize(9).fillColor("#000");
    doc.text(`${key} : `, {
      lineBreak: false,
    });

    doc.font("Helvetica").fontSize(9).fillColor("#000");
    doc.x = 100;
    doc.y = leftY;

    doc.text(value, {
      width: 280,
      height: valueHeight,
      align: "left",
      lineBreak: true,
    });

    doc.moveDown();
  });

  // Draw reference information on the right side
  Object.entries(referenceInfo).forEach(([key, value], index) => {
    const valueHeight = doc.heightOfString(value, {
      width: 250,
    });
    let rightY = y + (index + 1) * 20;
    doc.x = 400;
    doc.y = rightY;
    // Set font and size for client info
    doc.font("Helvetica").fontSize(9).fillColor("#000");
    doc.text(`${key} : `, {
      lineBreak: false,
    });

    // Set font and size for client info (value)
    doc.font("Helvetica").fontSize(9).fillColor("#000");
    doc.x = 450;
    doc.y = rightY;

    // Draw client info (value) on the left side
    doc.text(value, {
      width: 250, // Adjust the width as needed
      height: valueHeight,
      align: "left",
      lineBreak: true,
    });

    // Move to the next line
    doc.moveDown();
    rightY = doc.y + 5;
  });

  doc.moveDown(3);
  doc.x = 0;
  // Product/Service Required Title
  doc.fontSize(13).text("Product/Service Required", {
    width: doc.page.width,
    align: "center",
  });
  doc.moveDown(1);
  data.quote_product_lists.forEach((room) => {
    let subtotal = 0.0;

    doc.x = 50;
    if (doc.y + 30 > maxPageHeight) {
      doc.addPage();
    }
    doc
      .fontSize(13)
      .font("Helvetica")
      .text(`room : ${room.roomName}`, { align: "left" });
    doc.moveDown(0.5);

    // Create a table header
    doc.rect(50, doc.y, 500, 20).fill("#ccc");
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
    const headerHeight = 15;
    const headerY = doc.y + 5;
    doc.text("Product Name", 60, headerY, { width: 100, align: "center" });
    doc.text("Description", 160, headerY, { width: 250 });
    doc.text("Quantity", 410, headerY, { width: 60, align: "center" });
    doc.text("Unit Price", 470, headerY, { width: 80, align: "center" });

    // Draw a line below the table header
    doc
      .moveTo(50, headerY + headerHeight)
      .lineTo(550, headerY + headerHeight)
      .stroke();
    doc.moveDown(1);
    room.productList.forEach((product) => {
      const maxHeight =
        Math.max(
          doc.heightOfString(product.product_name, { width: 90 }),
          doc.heightOfString(product.product_description, {
            width: 240,
            wrap: true,
          })
        ) + 10;

      if (doc.y + maxHeight > maxPageHeight) {
        doc.addPage();
        doc.strokeColor("#ccc").moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      }
      const strokeY = doc.y + maxHeight;
      let y = doc.y + 5;
      doc.moveDown(1);
      doc.fontSize(8).font("Helvetica").fillColor("#000");
      doc.text(product.product_name, 60, y, { width: 90, wrap: true });
      doc.text(product.product_description, 160, y, { width: 240, wrap: true });
      doc.text(product.product_quantity, 410, y, {
        width: 60,
        align: "center",
      });
      doc.text(parseFloat(product.product_unit_price).toFixed(2), 470, y, {
        width: 80,
        align: "center",
      });

      doc.strokeColor("#ccc").moveTo(50, strokeY).lineTo(550, strokeY).stroke();
      doc.moveDown(1);
      doc.y = strokeY;
      subtotal += parseFloat(
        product.product_unit_price * product.product_quantity
      );
    });

    // Add spacing
    doc.moveDown(1);

    // Function to draw summary
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");
    doc.text(`RM ${subtotal.toFixed(2)}`, 460, doc.y, {
      align: "right",
    });
    // Add spacing
    doc.moveDown(1);
    doc.x = 60;
  });

  const discount = data.quote_discount; // Example value, replace with actual discount
  const grandTotal = quote_total - discount; // Calculate grand total
  // Draw table for quotation summary
  if (doc.y + 300 > maxPageHeight) {
    doc.addPage();
    doc.x = 30;
    doc.y = 30;
  }
  doc
    .moveDown(3)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(
      `Total before discount (RM) :` + parseFloat(quote_total).toFixed(2),
      480 - doc.widthOfString(`Total before discount (RM) :`),
      doc.y
    );
  doc.moveDown(0.5); // Add spacing

  doc.text(
    `Discount (RM) : ${parseFloat(discount).toFixed(2)}`,
    480 - doc.widthOfString(`Discount (RM) :`),
    doc.y
  );
  doc.moveDown(0.5); // Add spacing

  doc.text(
    `Total (RM) : ${parseFloat(grandTotal).toFixed(2)}`,
    480 - doc.widthOfString(`Total (RM) :`),
    doc.y
  ); // Set width for the title

  if (doc.y + 300 > maxPageHeight) {
    doc.addPage();
    doc.x = 30;
    doc.y = 30;
  }
  //Term and condition
  doc.moveDown(5);
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");
  doc.text("TERMS & CONDITIONS:", 90, doc.y);
  doc.fontSize(8).font("Helvetica").fillColor("#000");
  doc.text(
    "1.) Payment Term : 50% upon confirmation of order; Balance upon completion"
  );
  doc.text("2.) Bank Account : Maybank 5560 8952 7157");
  doc.text("3.) Price Validity : 7 DAYS ONLY, form the date here of");
  doc.text(
    "4.) Any fee charges by Local Authority or Building Management shall be borne by the Landlord"
  );
  doc.text(
    "5.) Items which are not stated above shall be treated as Variation Order."
  );
  doc.text(
    "6.) We reserve the right to withhold/stop supply, terminate any order to be made under thus Quotation and also recollect whatsover item(s) deemed proper, should there be any default in payment",
    { wrap: true }
  );

  doc.moveDown(5);

  let currentY = doc.y;

  doc.text(
    "I/We Hereby Acknowledge Acceptance to The Above Terms & Conditions: ",
    { height: 20 }
  );
  doc.moveDown(10);
  let signY = doc.y;
  doc.strokeColor("#ccc").moveTo(90, doc.y).lineTo(350, doc.y).stroke();
  doc.moveDown();
  doc.text("Name:");
  doc.text("Date:");

  doc.y = currentY;
  doc.x = 400;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
  doc.text("THINKTOP DESIGN SERVICES", {
    height: 20,
    width: 140,
    align: "center",
  });
  doc.moveDown(10);
  doc.strokeColor("#ccc").moveTo(400, signY).lineTo(540, signY).stroke();
  doc.fontSize(8).font("Helvetica").fillColor("#000");
  doc.text("Authorised Signature", 400, doc.y - 20, {
    width: 140,
    align: "center",
  });

  // Finalize the PDF and close the document
  doc.end();
}

function createPurchaseOrder(data, start, end) {
  const doc = new PDFDocument({ bufferPages: true });
  const displayCenter = {
    width: doc.page.width,
    align: "center",
  };

  doc.on("data", start);
  doc.on("end", end);

  doc.x = 0;
  doc.y = 20;

  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text("THINKTOP DESIGN SERVICES", displayCenter);

  doc.moveDown(0.3);
  doc
    .fontSize(8)
    .font("Helvetica")
    .text("Reg No : 202203091468 (AS0446602-U)", displayCenter);
  doc.moveDown(0.3);
  doc.text(
    "No 8, Jalan Pandan Indah 4/22, Pandan Indah, 55100 Kuala Lumpur",
    displayCenter
  );
  doc.moveDown(0.3);
  doc.text(
    "Email : thinktopdesign@gmail.com       Contact: 017-609 6446",
    displayCenter
  );

  doc.moveDown(1.5);
  doc.moveTo(0, doc.y).lineTo(doc.page.width, doc.y).stroke();
  doc.moveDown(2);

  doc.fontSize(14).text("Purcahse Order", {
    width: doc.page.width,
    align: "center",
  });

  doc.moveDown(0.5);
  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      `NO REFER : PO${data.project_order_id
        .toString()
        .padStart(6, "0")}               DATE: ${new Date().toLocaleDateString(
        "en-GB"
      )}`,
      displayCenter
    );

  doc.moveDown(1);

  const headerY = doc.y + 10;
  doc.rect(50, doc.y, doc.page.width - 100, 26).fill("#27413e");

  doc.font("Helvetica-Bold").fillColor("#fff").fontSize(10);
  doc.text("SUPPLIER", 80, headerY);
  doc.text("DELIVERY ADDRESS", 300, headerY);

  doc.moveDown(1);
  let infoY = doc.y;
  doc.font("Helvetica").fillColor("#000").fontSize(8);
  [
    data.supplier_cmp_name,
    data.supplier_pic,
    data.supplier_address,
    data.supplier_contact,
  ].forEach((info) => {
    doc.text(info, 80, doc.y + 5, {
      width: 200,
      wrap: true,
    });
  });

  const heightOfAddress = doc.heightOfString(data.project_address, {
    width: 250,
  });

  doc.text(data.project_address, 300, infoY + 5, {
    width: 250,
    wrap: true,
  });

  doc
    .font("Helvetica-Bold")
    .text("Delivery by: ", 300, infoY + heightOfAddress + 20, {
      continued: true,
    })
    .font("Helvetica")
    .text(new Date().toLocaleDateString("en-GB"));

  doc.moveDown(3);

  const headerY2 = doc.y + 10;
  doc.rect(50, doc.y, doc.page.width - 100, 26).fill("#27413e");

  doc.font("Helvetica-Bold").fillColor("#fff").fontSize(9);
  doc.text("ITEM", 80, headerY2);
  doc.text("UNIT PRICE (RM)", doc.page.width - 300, headerY2, {
    width: 80,
    align: "center",
  });
  doc.text("QUANTITY", doc.page.width - 220, headerY2, {
    width: 70,
    align: "center",
  });
  doc.text("SUB-TOTAL (RM)", doc.page.width - 150, headerY2, {
    width: 100,
    align: "center",
  });
  doc.moveDown(0.5);

  let subtotal = 0;
  data.project_order_product_lists.forEach((product, index) => {
    const rowY = doc.y + 10;
    const heightOfRow = Math.max(
      doc.heightOfString(product.product_name, { width: 210 })
    );
    const productSubTotal =
      parseFloat(product.unit_cost) * parseInt(product.total_quantity);
    if (doc.y + heightOfRow + 14 > doc.page.height - 70) {
      doc.addPage();
      doc.y = 20;
    }

    doc.font("Helvetica").fillColor("#000").fontSize(9);
    doc.text(product.product_name, 80, rowY, {
      width: 210,
      wrap: true,
    });
    doc.text(
      parseFloat(product.unit_cost).toFixed(2),
      doc.page.width - 300,
      rowY,
      {
        width: 80,
        align: "center",
      }
    );
    doc.text(parseInt(product.total_quantity), doc.page.width - 220, rowY, {
      width: 70,
      align: "center",
    });
    doc.text(productSubTotal.toFixed(2), doc.page.width - 150, rowY, {
      width: 100,
      align: "center",
    });
    doc.y += heightOfRow;
    doc
      .strokeColor("#ccc")
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    subtotal += productSubTotal;
  });

  doc.moveDown(1.5);
  doc.font("Helvetica-Bold").fillColor("#000").fontSize(10);
  const widthOfSubtotal = doc.widthOfString(
    "subtotal : RM " + parseFloat(subtotal).toFixed(2)
  );
  doc.text(
    `subtotal : RM ${subtotal.toFixed(2)}`,
    doc.page.width - 80 - widthOfSubtotal,
    doc.y,
    {
      wrap: false,
    }
  );
  doc.end();
}

// Export the function
module.exports = {
  createQuotation,
  createPurchaseOrder,
};
