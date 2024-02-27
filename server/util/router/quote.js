const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager } = require("../function/authorization");
const { getProductInfo } = require("../function/getInfo");
const db = require("../function/conn");
const { createQuotation } = require("../function/pdfFactory");

//create new quotation
router.post(
  "/add",
  validateJWT,
  isManager,
  (req, res, next) => {
    const {
      quote_discount,
      quote_product_lists,
      quote_name,
      quote_client_name,
      quote_client_contact,
      quote_address,
      quote_prop_type,
    } = req.body;

    if (
      !quote_product_lists ||
      !Array.isArray(quote_product_lists) ||
      quote_product_lists.length === 0 ||
      !quote_name ||
      !quote_client_contact ||
      !quote_client_name ||
      !quote_address ||
      !quote_prop_type ||
      (quote_discount !== undefined && isNaN(parseFloat(quote_discount)))
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required information." });
    }

    next();
  },
  getProductInfo,
  (req, res, next) => {
    const productArray = req.productArray;
    const { quote_product_lists } = req.body;
    if (!productArray || !quote_product_lists)
      return res
        .status(500)
        .json({ message: "Server error, cannot perform validation" });

    const productIds = productArray.map((product) => product.id);
    let quoteSubTotal = 0;

    async function validateProducts() {
      for (const areaOfRenovation of quote_product_lists) {
        const { roomName, productList } = areaOfRenovation;

        if (
          !roomName ||
          !productList ||
          !Array.isArray(productList) ||
          productList.length < 1
        ) {
          return res
            .status(400)
            .json({ message: "Information provided is insufficient" });
        }

        productList.forEach((productListArray) => {
          const { product_id, product_quantity, product_unit_price } =
            productListArray;
          if (
            !product_id ||
            !product_quantity ||
            !parseInt(product_quantity) ||
            !product_unit_price ||
            !parseFloat(product_unit_price) ||
            !productIds.includes(product_id)
          )
            return res
              .status(400)
              .json({ message: "Information provided is incorrect" });

          quoteSubTotal +=
            parseInt(product_quantity) * parseFloat(product_unit_price);
        });
      }

      req.body.quote_sub_total = quoteSubTotal;
      next();
    }

    validateProducts().catch((err) => {
      res.status(500).json({ message: "An error occurred during validation" });
    });
  },
  (req, res, next) => {
    const { user_id } = req.user;
    const selectQuery =
      "SELECT quote_id FROM quotation WHERE pic_id = ? ORDER BY create_at DESC LIMIT 1;";

    db.query(selectQuery, [user_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });

      let newQuoteId = user_id;
      if (result.length !== 0) {
        const { quote_id } = result[0];
        const incrementPart = parseInt(quote_id.slice(6)) + 1;
        newQuoteId += incrementPart.toString().padStart(3, "0");
      } else {
        newQuoteId += "001";
      }
      req.newQuoteId = newQuoteId;
      next();
    });
  },
  (req, res) => {
    const {
      quote_discount,
      quote_product_lists,
      quote_name,
      quote_client_name,
      quote_client_contact,
      quote_address,
      quote_prop_type,
      quote_sub_total,
    } = req.body;
    const { user_id } = req.user;
    const { newQuoteId } = req;
    const stringify_quote_product_lists = JSON.stringify(quote_product_lists);

    const insertQuery =
      "INSERT INTO quotation (quote_id, quote_name, quote_client_name, quote_client_contact, quote_address, pic_id, quote_product_lists, quote_sub_total, quote_prop_type, quote_discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

    db.query(
      insertQuery,
      [
        newQuoteId,
        quote_name,
        quote_client_name,
        quote_client_contact,
        quote_address,
        user_id,
        stringify_quote_product_lists,
        quote_sub_total,
        quote_prop_type,
        quote_discount,
      ],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong " + err });
        return res
          .status(200)
          .json({ message: "Quotation list created successful" });
      }
    );
  }
);

//get all quotation info, with filter function
router.get("", validateJWT, isManager, (req, res) => {
  const searchTerm = req.query.searchterm || "";
  const { user_id } = req.user;

  let selectQuery = `SELECT quote_id AS "id", quote_name AS 'quotation name', quote_client_name AS "client name", quote_client_contact AS "contact", quote_sub_total AS "total charge", quote_address AS location FROM quotation WHERE pic_id = ? `;
  let queryParams = [user_id];

  if (searchTerm) {
    selectQuery += ` AND (quote_name LIKE ?
      OR quote_client_name LIKE ?
      OR quote_client_phone LIKE ?
      OR quote_address LIKE ?)`;
    queryParams.push(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
  }

  db.query(selectQuery, queryParams, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong" + err });

    const thead = results.length > 0 ? Object.keys(results[0]) : [];
    const responseBody = {
      thead: thead,
      tbody: results,
    };
    return res.status(200).json({ data: responseBody });
  });
});

//get specific quotation info
router.get("/:quote_id", validateJWT, isManager, (req, res) => {
  const { quote_id } = req.params;

  const selectQuery = "SELECT * FROM quotation WHERE quote_id = ?;";
  db.query(selectQuery, [quote_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });
    if (result.length !== 1)
      return res.status(400).json({ message: "Quotation list not found" });

    const returnObj = result[0];
    returnObj.quote_product_lists = JSON.parse(returnObj.quote_product_lists);

    return res.status(200).json({ data: returnObj });
  });
});

//update specific quotation
router.post(
  "/edit-quote/:quote_id",
  validateJWT,
  isManager,
  getProductInfo,
  (req, res) => {
    const {
      quote_name,
      quote_client_name,
      quote_client_contact,
      quote_discount,
      quote_address,
      quote_prop_type,
      quote_product_lists,
    } = req.body;
    const { user_id } = req.user;
    const { quote_id } = req.params;
    if (
      !quote_name ||
      !quote_client_name ||
      !quote_client_contact ||
      !quote_address ||
      !quote_prop_type ||
      !quote_product_lists ||
      typeof quote_product_lists !== "object"
    )
      return res
        .status(400)
        .json({ message: "Please provide all required information." });

    const productIds = req.productArray.map((product) => product.id);
    let isValid = true;
    let quote_sub_total = 0;

    quote_product_lists.forEach((productLists) => {
      const { roomName, productList } = productLists;
      if (!roomName || !productList || !Array.isArray(productList)) {
        return res
          .status(400)
          .json({ message: "Information provided is invalid" });
      }
      productList.forEach((material) => {
        const { product_id, product_unit_price, product_quantity } = material;
        if (
          !product_id ||
          !product_unit_price ||
          isNaN(product_quantity) ||
          isNaN(product_unit_price) ||
          !product_quantity ||
          !productIds.includes(product_id)
        ) {
          isValid = false;
        } else {
          quote_sub_total += parseFloat(
            product_quantity * product_unit_price
          ).toFixed(2);
        }
      });
    });

    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid material's information" });
    }

    const stringify_quote_product_lists = JSON.stringify(quote_product_lists);

    const updateQuery =
      "UPDATE quotation SET quote_name = ?, quote_client_name = ?, quote_client_contact = ?, quote_address =?, quote_prop_type = ?, quote_product_lists = ?, quote_sub_total = ?, quote_discount = ? WHERE pic_id = ? AND quote_id = ?;";

    db.query(
      updateQuery,
      [
        quote_name,
        quote_client_name,
        quote_client_contact,
        quote_address,
        quote_prop_type,
        stringify_quote_product_lists,
        quote_sub_total,
        quote_discount || 0,
        user_id,
        quote_id,
      ],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong " + err });
        return res
          .status(200)
          .json({ message: "Quotation list update successful" });
      }
    );
  }
);

//delete specific quotation
router.delete("/delete/:quote_id", validateJWT, isManager, (req, res) => {
  const { quote_id } = req.params;
  if (!quote_id)
    return res
      .status(400)
      .json({ message: "Please provide all required info" });

  const deleteQuery = "DELETE FROM quotation WHERE quote_id = ?;";
  db.query(deleteQuery, [quote_id], (err) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });
    return res.status(200).json({ message: "Delete successful" });
  });
});

router.get("/quotation-list/:quote_id", (req, res) => {
  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment;filename=quotation-list.pdf`,
  });
  createQuotation(
    (chunk) => stream.write(chunk),
    () => stream.end()
  );
});

module.exports = router;
