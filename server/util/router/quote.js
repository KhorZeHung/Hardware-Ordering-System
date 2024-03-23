const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager } = require("../function/authorization");
const { getProductInfo } = require("../function/getInfo");
const db = require("../function/conn");
const { createQuotation } = require("../function/pdfFactory");

const generateQuotePK = (req, res, next) => {
  const { user_id } = req.user;
  const selectQuery =
    "SELECT quote_id FROM quotation WHERE pic_id = ? ORDER BY created_at DESC LIMIT 1;";

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
};

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
    const productObj = productArray.reduce((summary, product) => {
      summary[product.id] = product;
      return summary;
    }, {});
    let quoteSubTotal = 0;

    async function validateProducts() {
      let validatedProductLists = [];
      for (const areaOfRenovation of quote_product_lists) {
        const { roomName, productList } = areaOfRenovation;

        if (
          !roomName ||
          !productList ||
          !Array.isArray(productList) ||
          productList.length < 1
        ) {
          throw new Error("Information provided is insufficient");
        }

        const validatedProductList = productList.reduce((summary, product) => {
          const {
            product_id,
            product_quantity,
            product_unit_price,
            product_name,
          } = product;
          if (
            !product_id ||
            !product_quantity ||
            !parseInt(product_quantity) ||
            !product_unit_price ||
            !parseFloat(product_unit_price) ||
            !productIds.includes(product_id)
          ) {
            return res
              .status(400)
              .json({ message: "Information provided is not complete" });
          }

          quoteSubTotal +=
            parseInt(product_quantity) * parseFloat(product_unit_price);

          if (product_name === formatedProductArray[product_id].name) {
            const { product_name, ...remainingObj } = product;
            product = remainingObj;
          }

          summary.push(product);
          return summary;
        }, []);

        validatedProductLists.push({
          roomName,
          productList: validatedProductList,
        });
      }

      return validatedProductLists;
    }

    validateProducts()
      .then((validatedLists) => {
        req.body.quote_product_lists = validatedLists;
        req.body.quote_sub_total = quoteSubTotal;
        next();
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  },
  generateQuotePK,
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
        return res.status(200).json({
          message: "Quotation list created successful",
          quote_id: newQuoteId,
        });
      }
    );
  }
);

//get all quotation info, with filter function
router.get("", validateJWT, isManager, (req, res) => {
  const { searchterm, filteroption, sort, desc, page } = req.query;
  const { user_id } = req.user;

  let selectQuery = `SELECT quote_id AS "id", quote_name AS 'quotation name', quote_client_name AS "client name", quote_client_contact AS "contact", quote_sub_total AS "total charge", quote_address AS location FROM quotation WHERE pic_id = ? `;
  let queryParams = [user_id];

  if (searchterm) {
    selectQuery += ` AND (quote_name LIKE ?
      OR quote_client_name LIKE ?
      OR quote_id LIKE ?
      OR quote_client_contact LIKE ?
      OR quote_address LIKE ?)`;
    queryParams.push(
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`
    );
  }

  if (filteroption) {
    selectQuery += " AND quote_prop_type = ?";
    queryParams.push(filteroption);
  }

  if (sort) {
    const sortColumnNameMap = {
      id: "quote_id",
      "quotation name": "quote_name",
      "client name": "quote_client_name",
      contact: "quote_client_contact",
      "total charge": "quote_sub_total",
      location: "quote_address",
    };

    if (sortColumnNameMap[sort]) {
      selectQuery += ` ORDER BY ${sortColumnNameMap[sort]} ${
        desc ? "DESC" : "ASC"
      }`;
    }
  }

  // if (page) {
  //   const limit = 25 * page;
  //   selectQuery += " LIMIT " + limit + ";";
  // }

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
//get all quotation info, with filter function
router.get("/options", validateJWT, isManager, (req, res) => {
  const { searchterm, filteroption } = req.query;
  const { user_id } = req.user;

  let selectQuery = `SELECT quote_id AS 'id', quote_name AS 'quotation name', quote_client_name AS "client name", quote_client_contact AS "contact", quote_sub_total AS "total charge" FROM quotation WHERE pic_id = ? AND quote_id NOT IN (
    SELECT project_id
    FROM project)`;
  let queryParams = [user_id];

  if (searchterm) {
    selectQuery += ` AND (quote_name LIKE ?
      OR quote_client_name LIKE ?
      OR quote_id LIKE ?
      OR quote_client_contact LIKE ?
      OR quote_address LIKE ?)`;
    queryParams.push(
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`
    );
  }

  if (filteroption) {
    selectQuery += " AND quote_prop_type = ?";
    queryParams.push(filteroption);
  }

  selectQuery += " ORDER BY created_at DESC;";

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

// duplicate a quotation
router.get(
  "/duplicate/:quote_id",
  validateJWT,
  isManager,
  generateQuotePK,
  (req, res) => {
    const { quote_id } = req.params;
    const { newQuoteId } = req;

    const duplicateQuery = `INSERT INTO quotation (quote_id, quote_name, quote_client_name, quote_client_contact, quote_address, pic_id, quote_product_lists, quote_sub_total, quote_prop_type, quote_discount)
        SELECT ?, quote_name, quote_client_name, quote_client_contact, quote_address, pic_id, quote_product_lists, quote_sub_total, quote_prop_type, quote_discount
        FROM quotation
        WHERE quote_id = ?;`;

    db.query(duplicateQuery, [newQuoteId, quote_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });

      if (result.affectedRows !== 1) {
        return res
          .status(500)
          .json({ message: "No such quotation / duplicate failed" });
      }

      return res.status(200).json({
        data: { quote_id: newQuoteId },
        message: "Duplicate successful, redirect in 2 seconds",
      });
    });
  }
);

//update specific quotation
router.post(
  "/edit-quote/:quote_id",
  validateJWT,
  isManager,
  getProductInfo,
  (req, res, next) => {
    const {
      quote_name,
      quote_client_name,
      quote_client_contact,
      quote_discount,
      quote_address,
      quote_prop_type,
      quote_product_lists,
    } = req.body;
    if (
      !quote_name ||
      !quote_client_name ||
      !quote_client_contact ||
      !quote_address ||
      !quote_prop_type ||
      !quote_product_lists ||
      !quote_discount < 0 ||
      typeof quote_product_lists !== "object"
    )
      return res
        .status(400)
        .json({ message: "Please provide all required information." });
    const { productArray } = req;
    const productIds = productArray.map((product) => product.id);
    let formatedProductArray = productArray.reduce((productObj, product) => {
      const stringProductId = String(product.id);
      productObj[stringProductId] = product;
      return productObj;
    }, {});
    let quote_sub_total = 0.0;

    async function validateProducts() {
      let validatedProductLists = [];
      for (const areaOfRenovation of quote_product_lists) {
        const { roomName, productList } = areaOfRenovation;

        if (
          !roomName ||
          !productList ||
          !Array.isArray(productList) ||
          productList.length < 1
        ) {
          throw new Error("Information provided is insufficient");
        }

        const validatedProductList = productList.reduce((summary, product) => {
          const {
            product_id,
            product_quantity,
            product_unit_price,
            product_name,
          } = product;
          if (
            !product_id ||
            !product_quantity ||
            !parseInt(product_quantity) ||
            !product_unit_price ||
            !parseFloat(product_unit_price) ||
            !productIds.includes(product_id)
          ) {
            return res
              .status(400)
              .json({ message: "Information provided is not complete" });
          }

          quote_sub_total +=
            parseInt(product_quantity) * parseFloat(product_unit_price);

          if (product_name === formatedProductArray[product_id].name) {
            const { product_name, ...remainingObj } = product;
            product = remainingObj;
          }

          summary.push(product);
          return summary;
        }, []);

        validatedProductLists.push({
          roomName,
          productList: validatedProductList,
        });
      }

      return validatedProductLists;
    }

    validateProducts()
      .then((validatedLists) => {
        req.formated_quote_product_lists = validatedLists;
        req.quote_sub_total = quote_sub_total;
        next();
      })
      .catch((err) => {
        return res.status(400).json({ message: err.message });
      });
  },
  (req, res) => {
    const stringify_quote_product_lists = JSON.stringify(
      req.formated_quote_product_lists
    );
    const {
      quote_name,
      quote_client_name,
      quote_client_contact,
      quote_discount,
      quote_address,
      quote_prop_type,
    } = req.body;
    const { user_id } = req.user;
    const { quote_id } = req.params;
    const { quote_sub_total } = req;

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
        quote_sub_total.toFixed(2),
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

router.get(
  "/quotation-list/:quote_id",
  validateJWT,
  isManager,
  getProductInfo,
  (req, res, next) => {
    const { quote_id } = req.params;

    const selectQuery = "SELECT * FROM quotation WHERE quote_id = ?;";
    db.query(selectQuery, [quote_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      if (result.length !== 1)
        return res.status(400).json({ message: "Quotation list not found" });

      const returnObj = result[0];
      returnObj.quote_product_lists = JSON.parse(returnObj.quote_product_lists);
      req.quoteData = returnObj;
      next();
    });
  },
  (req, res, next) => {
    const { quoteData, productArray } = req;
    let { pic_id, last_edit_time, ...newQuoteData } = quoteData;

    let formatedProductArray = productArray.reduce((productObj, product) => {
      const stringProductId = String(product.id);
      productObj[stringProductId] = product;
      return productObj;
    }, {});

    newQuoteData.quote_product_lists = newQuoteData.quote_product_lists.map(
      (room) => {
        const newProductList = room.productList.map((product) => {
          const referProduct = formatedProductArray[String(product.product_id)];
          const newProductDescription = product.product_description.map(
            (index) => referProduct.description[index]
          );
          return {
            ...product,
            product_name: product.product_name || referProduct.name,
            product_description: newProductDescription,
          };
        });

        return { ...room, productList: newProductList };
      }
    );
    req.quoteData = newQuoteData;
    next();
  },
  (req, res) => {
    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment;filename=quotation-list.pdf`,
    });
    createQuotation(
      req.quoteData,
      (chunk) => stream.write(chunk),
      () => stream.end()
    );
  }
);

module.exports = router;
