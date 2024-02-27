const PDFDocument = require("pdfkit");

function createQuotation(start, end) {
  // Create a new PDF document
  const doc = new PDFDocument({ bufferPages: true, font: "Courier" });

  doc.on("data", start);
  doc.on("end", end);

  // Define project details
  const projectDetails = {
    referenceNumber: "REF123456",
    dateIssued: "2024-02-20",
    customerName: "John Doe",
    customerPhoneNumber: "123-456-7890",
    projectId: "PROJ001",
    projectLocation: "123 Main Street, Cityville",
    managerInCharge: "Jane Smith",
    managerPhoneNumber: "987-654-3210",
    managerEmail: "jane@example.com",
  };

  // Define list of quotations for rooms
  const quotationList = [
    {
      roomName: "Living Room",
      materials: [
        { name: "Flooring", quantity: 100, unitPrice: 50 },
        { name: "Paint", quantity: 5, unitPrice: 20 },
        // Add more materials as needed
      ],
    },
    {
      roomName: "Kitchen",
      materials: [
        { name: "Cabinets", quantity: 10, unitPrice: 150 },
        { name: "Countertop", quantity: 1, unitPrice: 200 },
        // Add more materials as needed
      ],
    },
    // Add more rooms as needed
  ];

  // Draw project details
  doc
    .fontSize(12)
    .text("Project Details", { underline: true })
    .moveDown(0.5)
    .text(`Reference Number: ${projectDetails.referenceNumber}`)
    .text(`Date Issued: ${projectDetails.dateIssued}`)
    .text(`Customer Name: ${projectDetails.customerName}`)
    .text(`Customer Phone Number: ${projectDetails.customerPhoneNumber}`)
    .text(`Project ID: ${projectDetails.projectId}`)
    .text(`Project Location: ${projectDetails.projectLocation}`)
    .text(`Manager in Charge: ${projectDetails.managerInCharge}`)
    .text(`Manager Phone Number: ${projectDetails.managerPhoneNumber}`)
    .text(`Manager Email: ${projectDetails.managerEmail}`)
    .moveDown(1);

  // Draw list of quotations for each room
  quotationList.forEach((quotation, index) => {
    const { roomName, materials } = quotation;
    const subTotal = calculateSubTotal(materials);

    doc
      .fontSize(12)
      .text(`Room Name: ${roomName}`, { underline: true })
      .moveDown(0.5);

    materials.forEach((material) => {
      doc.text(
        `- ${material.name}: ${material.quantity} units x $${
          material.unitPrice
        } = $${material.quantity * material.unitPrice}`
      );
    });

    doc.text(`Sub-Total: $${subTotal.toFixed(2)}`).moveDown(0.5);
    if (index < quotationList.length - 1) {
      doc.moveDown(1);
    }
  });

  // Calculate total charges
  const subTotals = quotationList.map((quotation) =>
    calculateSubTotal(quotation.materials)
  );
  const totalDiscount = calculateTotalDiscount(subTotals);
  const totalCharge = calculateTotalCharge(subTotals, totalDiscount);

  // Draw summary of quotation
  doc
    .fontSize(12)
    .text("Summary of Quotation", { underline: true })
    .moveDown(0.5)
    .text(
      `Sub-Total: $${subTotals
        .reduce((total, subTotal) => total + subTotal, 0)
        .toFixed(2)}`
    )
    .text(`Total Discount: $${totalDiscount.toFixed(2)}`)
    .text(`Total Charge: $${totalCharge.toFixed(2)}`)
    .moveDown(1);

  // Finalize the PDF and close the document
  doc.end();
}

// Define function to calculate sub-total for each room
function calculateSubTotal(materials) {
  return materials.reduce(
    (total, material) => total + material.quantity * material.unitPrice,
    0
  );
}

// Define function to calculate total discount (if any)
function calculateTotalDiscount(subTotals) {
  // Dummy function - implement your discount calculation logic here
  return 0;
}

// Define function to calculate total charge
function calculateTotalCharge(subTotals, totalDiscount) {
  const subTotal = subTotals.reduce((total, subTotal) => total + subTotal, 0);
  return subTotal - totalDiscount;
}

module.exports = {
  createQuotation,
};
