const XLSX = require("xlsx");

const createOrderSpreadSheet = (req, res) => {
  try {
    if (!Array.isArray(req.excelData)) {
      throw new Error("req.excelData must be an array");
    }

    const workbook = XLSX.utils.book_new();

    const columnNames = req.excelHeader;
    req.excelData.forEach((supplier) => {
      const sheetName = supplier.supplier_cmp_name;
      const sheetData = [columnNames].concat(
        supplier.project_order_product_lists
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(sheetData),
        sheetName
      );
    });

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", 'attachment; filename="order.xlsx"');
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong " + (error.msssage || error) });
  }
};

module.exports = {
  createOrderSpreadSheet,
};
