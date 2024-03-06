const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isAdmin } = require("../function/authorization");
const db = require("../function/conn");

const malaysiaTimezoneOffset = 8 * 60;
const malaysiaDateTime = new Date(Date.now() + malaysiaTimezoneOffset * 60000);
const currentMonth = malaysiaDateTime.getMonth() + 1;
const currentYear = malaysiaDateTime.getFullYear();
const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 0)
  .toISOString()
  .split("T")[0];

const getnewQuoteOverall = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.body;
  const selectQuery = `SELECT COUNT(quote_id) AS new_quote, ROUND(AVG(quote_sub_total), 2) AS average_quote_sub_total 
  FROM quotation 
  WHERE created_at BETWEEN DATE_SUB(?, INTERVAL ? MONTH) AND ?;`;
  const queryParams = [startDate, duration, startDate];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.newQuoteOverallData = result[0];
    next();
  });
};

const getnewProjectOverall = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.body;
  const selectQuery = `SELECT 
  COUNT(project_id) AS new_project, 
  ROUND(AVG(project_sub_total), 2) AS average_project_sub_total,
  ROUND(SUM(project_sub_total),2) AS new_sales,
  SUM(project_outstanding) AS total_outstanding,
  COUNT(CASE WHEN project_outstanding != 0 THEN 1 END) AS active_project
FROM 
  project 
WHERE 
  created_at BETWEEN DATE_SUB(?, INTERVAL ? MONTH) AND ?;
`;
  const queryParams = [startDate, duration, startDate];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.newProjectOverallData = result[0];
    next();
  });
};

const getnewAccountOverall = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.body;
  const selectQuery = `SELECT 
  COALESCE(SUM(CASE WHEN isDebit = 1 THEN amount ELSE 0 END), 0) AS debit_total,
  COALESCE(SUM(CASE WHEN isDebit = 0 THEN amount ELSE 0 END), 0) AS credit_total
FROM 
  account_status 
WHERE 
  created_at BETWEEN DATE_SUB(?, INTERVAL ? MONTH) AND ?;

      `;
  const queryParams = [startDate, duration, startDate];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.newAccountOverallData = result[0];
    next();
  });
};

const getAverageProject = (req, res, next) => {
  const selectQuery = `SELECT ROUND(AVG(new_projects_count),2) AS average_new_projects_per_month, ROUND(new_sales/AVG(new_projects_count), 2) AS average_sales
  FROM (
      SELECT COUNT(project_id) AS new_projects_count, SUM(project_sub_total) AS new_sales
      FROM project
      GROUP BY YEAR(created_at), MONTH(created_at)
  ) AS monthly_counts;`;
  const queryParams = [];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.averageProjectData = result[0];
    next();
  });
};

const getAverageQuote = (req, res, next) => {
  const selectQuery = `SELECT ROUND(AVG(new_quote_count),2) AS average_new_quote_per_month 
  FROM (
      SELECT COUNT(quote_id) AS new_quote_count
      FROM quotation
      GROUP BY YEAR(created_at), MONTH(created_at)
  ) AS monthly_counts;`;
  const queryParams = [];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.averageQuoteData = result[0];
    next();
  });
};

const getDonutChart = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.body;
  let selectQuery = `SELECT 
  SUM(CASE WHEN project_sub_total BETWEEN 0 AND 100000 THEN 1 ELSE 0 END) AS range_0_to_100000,
  SUM(CASE WHEN project_sub_total BETWEEN 100001 AND 200000 THEN 1 ELSE 0 END) AS range_100001_to_200000,
  SUM(CASE WHEN project_sub_total BETWEEN 200001 AND 400000 THEN 1 ELSE 0 END) AS range_200001_to_400000,
  SUM(CASE WHEN project_sub_total > 400000 THEN 1 ELSE 0 END) AS range_400000_plus
FROM 
  project
WHERE 
  created_at BETWEEN DATE_SUB(?, INTERVAL ? MONTH) AND ?`;
  let queryParams = [startDate, duration, startDate];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    const returnArray = Object.values(result[0]);
    req.bonutChartData = returnArray;
    next();
  });
};

const getBarChart = (req, res, next) => {
  let selectQuery = `SELECT 
  DATE_FORMAT(DATE(t1.created_at), '%m-%Y') AS month,
  COUNT(DISTINCT t1.project_id) AS project_count,
  COUNT(DISTINCT t2.quote_id) AS quote_count
FROM 
  project AS t1
LEFT JOIN 
  quotation t2 ON DATE(t1.created_at) = DATE(t2.created_at)
WHERE 
  t1.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  AND t2.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY 
  MONTH(t1.created_at), YEAR(t1.created_at)
ORDER BY 
  YEAR(t1.created_at), MONTH(t1.created_at);`;

  let queryParams = [];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.barChartData = {
      xaxis: { categories: result.map((value) => value.month) },
      series: [
        {
          name: "marketing",
          data: result.map((value) => value.quote_count),
        },
        {
          name: "sales",
          data: result.map((value) => value.project_count),
        },
      ],
    };
    next();
  });
};

router.get(
  "",
  validateJWT,
  getAverageProject,
  getAverageQuote,
  getBarChart,
  getDonutChart,
  getnewAccountOverall,
  getnewProjectOverall,
  getnewQuoteOverall,
  (req, res) => {
    const {
      newQuoteOverallData,
      newProjectOverallData,
      averageProjectData,
      averageQuoteData,
      bonutChartData,
      barChartData,
      newAccountOverallData,
    } = req;

    const returnObj = {
      sales: {
        cardData: [
          {
            value: `RM ${parseFloat(newProjectOverallData.new_sales).toFixed(
              2
            )}`,
            description: "last month",
            title: "new sales",
          },
          {
            value: `RM ${averageProjectData.average_sales}`,
            description: "per month",
            title: "avg sales",
          },
          {
            value: `${parseFloat(
              (newProjectOverallData.new_project /
                newQuoteOverallData.new_quote) *
                100
            ).toFixed(2)}%`,
            description: "last month",
            title: "avg deal rate",
          },
        ],
      },
      marketing: {
        donutChartData: {
          title: "Sales chart",
          datas: bonutChartData,
          description: "last month",
        },
        barChartData: barChartData,
        cardData: [
          {
            value: newQuoteOverallData.new_quote,
            description: "last month",
            title: "new quote",
          },
          {
            value: `${parseFloat(
              (newProjectOverallData.new_project /
                newQuoteOverallData.new_quote) *
                100
            ).toFixed(2)}%`,
            description: "last month",
            title: "deal rate",
          },
          {
            value: `${parseFloat(
              (averageProjectData.average_new_projects_per_month /
                averageQuoteData.average_new_quote_per_month) *
                100
            ).toFixed(2)}%`,
            description: "per month",
            title: "avg deal rate",
          },
          {
            value: `RM ${parseFloat(averageProjectData.average_sales).toFixed(
              2
            )}`,
            description: "per proj",
            title: "avg charge",
          },
        ],
      },
      project: {
        cardData: [
          {
            value: String(newProjectOverallData.new_project),
            description: "last month",
            title: "new project",
          },
          {
            value: String(averageProjectData.average_new_projects_per_month),
            description: "per month",
            title: "avg new proj",
          },
          {
            value: `${newProjectOverallData.active_project}`,
            description: "currently",
            title: "active proj",
          },
        ],
      },
      account: {
        cardData: [
          {
            value: `RM ${parseFloat(newAccountOverallData.debit_total).toFixed(
              2
            )}`,
            description: "per month",
            title: "new payment",
          },
          {
            value: `RM ${parseFloat(averageProjectData.average_sales).toFixed(
              2
            )}`,
            description: "per month",
            title: "avg payment",
          },
          {
            value: `RM ${parseFloat(
              newProjectOverallData.total_outstanding
            ).toFixed(2)}`,
            description: `${newProjectOverallData.active_project} projects`,
            title: "active outstanding",
          },
        ],
      },
    };

    return res.status(200).json({ data: returnObj });
  }
);

module.exports = router;
