const PDFDocument = require("pdfkit");

function createQuotation(data, start, end) {
  // Create a new PDF document
  const doc = new PDFDocument({ bufferPages: true });

  doc.on("data", start);
  doc.on("end", end);

  // Set font family to Helvetica
  doc.font("Helvetica");

  // Title
  doc.fontSize(20).text("Quotation List", { align: "center" });

  // Add padding
  doc.moveDown().moveDown();

  // Define table width and column widths
  const tableWidth = 500;
  const column1Width = 0.3 * tableWidth;
  const quote_total = data.quote_sub_total;

  const quoteInfo = {
    "quote name": data.quote_name,
    "client name": data.quote_client_name,
    "client contact": data.quote_client_contact,
    address: data.quote_address,
    type: data.quote_prop_type,
  };

  // Set initial y position
  let y = doc.y;

  // Iterate over each key-value pair in quoteInfo
  for (const [key, value] of Object.entries(quoteInfo)) {
    // Set font and size for header
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#000");

    // Draw header (key)
    doc.text(`${key} : `, {
      width: column1Width,
      align: "left",
      lineBreak: false,
    });

    // Set font and size for cell value
    doc.font("Helvetica").fontSize(10).fillColor("#000");

    // Draw cell value (value)
    doc.text(value, {
      width: tableWidth,
      align: "left",
      lineBreak: true,
    });

    // Move to the next line
    doc.moveDown();
  }

  // Product/Service Required Title
  doc.fontSize(16).text("Product/Service Required", { align: "center" });

  data.quote_product_lists.forEach((room) => {
    let subtotal = 0.0;
    const lineHeight = 20;
    const maxRowsPerPage = Math.floor(
      (doc.page.height - doc.y - 50) / lineHeight
    ); // Assuming a bottom margin of 50

    // Add spacing
    doc.moveDown(2);

    doc.fontSize(13).text(`room : ${room.roomName}`, { align: "left" });
    doc.moveDown(0.5);

    // Create a table header
    doc.rect(50, doc.y, 500, 20).fill("#ccc");
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
    const headerHeight = 15;
    const headerY = doc.y + 5;
    doc.text("Product Name", 60, headerY);
    doc.text("Quantity", 160, headerY);
    doc.text("Unit Price", 220, headerY);
    doc.text("Description", 300, headerY);

    // Draw a line below the table header
    doc
      .moveTo(50, headerY + headerHeight)
      .lineTo(550, headerY + headerHeight)
      .stroke();
    doc.moveDown(1);

    let rowCount = 0;
    room.productList.forEach((product) => {
      if (rowCount >= maxRowsPerPage) {
        // Move to the next page
        doc.addPage();
        // Recreate the table header
        doc.rect(50, doc.y, 500, 20).fill("#ccc");
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
        doc.text("Product Name", 60, doc.y + 5);
        doc.text("Quantity", 160, doc.y + 5);
        doc.text("Unit Price", 220, doc.y + 5);
        doc.text("Description", 300, doc.y + 5);
        // Draw a line below the table header
        doc
          .moveTo(50, doc.y + 20)
          .lineTo(550, doc.y + 20)
          .stroke();
        // Reset rowCount
        rowCount = 0;
      }

      let y = doc.y + 5;
      doc.moveDown(1);

      doc.fontSize(10).font("Helvetica").fillColor("#000");
      let productNameWidth = 100;
      if (product.product_name.length > productNameWidth) {
        // If the product name is too long, reduce the width
        productNameWidth = Math.min(product.product_name.length * 5, 160);
      }
      doc.text(product.product_name, 60, y, { width: productNameWidth });
      doc.text(product.product_quantity, 160, y);
      doc.text(parseFloat(product.product_unit_price).toFixed(2), 220, y);
      doc.text(product.product_description, 300, y, { width: 250, wrap: true });

      doc
        .strokeColor("#ccc")
        .moveTo(50, y + 30)
        .lineTo(550, y + 30)
        .stroke();
      doc.moveDown(1);
      subtotal += parseFloat(
        product.product_unit_price * product.product_quantity
      );

      rowCount++;
    });

    // Add spacing
    doc.moveDown(1);

    // Function to draw summary
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
    doc.text(`Subtotal: RM ${subtotal.toFixed(2)}`, 350, doc.y, {
      align: "right",
    });
    // Add spacing
    doc.moveDown(1);
    doc.addPage();
    doc.y = 30;
    doc.x = 60;
  });

  const discount = data.quote_discount; // Example value, replace with actual discount
  const grandTotal = quote_total - discount; // Calculate grand total

  doc.x = 350;
  // Draw table for quotation summary
  doc
    .moveDown()
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(
      `Subtotal (RM) :` + parseFloat(quote_total).toFixed(2),
      450 - doc.widthOfString(`Subtotal (RM) :`),
      doc.y
    );
  doc.moveDown(0.5); // Add spacing

  doc.text(
    `Discount (RM) : ${parseFloat(discount).toFixed(2)}`,
    450 - doc.widthOfString(`Discount (RM) :`),
    doc.y
  );
  doc.moveDown(0.5); // Add spacing

  doc.text(
    `Grand Total (RM) : ${parseFloat(grandTotal).toFixed(2)}`,
    450 - doc.widthOfString(`Grand Total (RM) :`),
    doc.y
  ); // Set width for the title

  // Finalize the PDF and close the document
  doc.end();
}

// Export the function
module.exports = {
  createQuotation,
};
