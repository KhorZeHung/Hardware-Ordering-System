const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isAdmin } = require("../function/authorization");
const db = require("../function/conn");

const malaysiaTimezoneOffset = 8 * 60;
const malaysiaDateTime = new Date(Date.now() + malaysiaTimezoneOffset * 60000);
const currentMonth = malaysiaDateTime.getMonth();
const currentYear = malaysiaDateTime.getFullYear();
const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 2)
  .toISOString()
  .split("T")[0];

const getnewQuoteOverall = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.query;
  const selectQuery = `SELECT COUNT(quote_id) AS new_quote, ROUND(AVG(quote_sub_total), 2) AS average_quote_sub_total 
  FROM quotation 
  WHERE created_at BETWEEN ? AND DATE_ADD(?, INTERVAL ? MONTH);`;
  const queryParams = [startDate, startDate, duration];
  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.newQuoteOverallData = result[0];
    next();
  });
};

const getnewProjectOverall = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.query;
  const selectQuery = `SELECT 
  COUNT(project_id) AS new_project, 
  ROUND(AVG(project_sub_total), 2) AS average_project_sub_total,
  ROUND(SUM(project_sub_total),2) AS new_sales,
  SUM(project_outstanding) AS total_outstanding,
  COUNT(CASE WHEN project_outstanding != 0 THEN 1 END) AS active_project
FROM 
  project 
WHERE 
  created_at BETWEEN ? AND DATE_ADD(?, INTERVAL ? MONTH);
`;
  const queryParams = [startDate, startDate, duration];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    req.newProjectOverallData = result[0];
    next();
  });
};

const getnewAccountOverall = (req, res, next) => {
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.query;
  const selectQuery = `SELECT 
  COALESCE(SUM(CASE WHEN account_status_payment_refer != 0 THEN amount ELSE 0 END), 0) AS debit_total,
  COALESCE(SUM(CASE WHEN account_status_payment_refer = 0 THEN amount ELSE 0 END), 0) AS credit_total
FROM 
  account_status 
WHERE 
  created_at BETWEEN ? AND DATE_ADD(?, INTERVAL ? MONTH);

      `;
  const queryParams = [startDate, startDate, duration];

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
  const { startDate = lastDayOfPreviousMonth, duration = 1 } = req.query;
  let selectQuery = `SELECT 
  SUM(CASE WHEN project_sub_total BETWEEN 0 AND 50000 THEN 1 ELSE 0 END) AS "< 50k",
  SUM(CASE WHEN project_sub_total BETWEEN 50000 AND 100000 THEN 1 ELSE 0 END) AS "50k-100k",
  SUM(CASE WHEN project_sub_total BETWEEN 100001 AND 250000 THEN 1 ELSE 0 END) AS "100k-250k",
  SUM(CASE WHEN project_sub_total BETWEEN 250001 AND 500000 THEN 1 ELSE 0 END) AS "250k-500k",
  SUM(CASE WHEN project_sub_total > 500000 THEN 1 ELSE 0 END) AS ">500k"
FROM 
  project
WHERE 
  created_at BETWEEN ? AND DATE_ADD(?, INTERVAL ? MONTH)`;
  let queryParams = [startDate, startDate, duration];

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    const returnData = Object.values(result[0]);
    const returnLabel = Object.keys(result[0]);
    req.bonutChartData = { labels: returnLabel, data: returnData };
    next();
  });
};

const getBarChart = (req, res, next) => {
  let selectQuery = `SELECT 
  DATE_FORMAT(month_date, '%m-%Y') AS month,
  COALESCE(project_count, 0) AS project_count,
  COALESCE(quote_count, 0) AS quote_count
FROM (
  SELECT 
    DATE_SUB(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), INTERVAL n MONTH) AS month_date
  FROM 
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
     UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
     UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11) AS months
) AS all_months
LEFT JOIN (
  SELECT 
    DATE_FORMAT(created_at, '%Y-%m-01') AS month,
    COUNT(DISTINCT project_id) AS project_count
  FROM 
    project
  WHERE 
    created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  GROUP BY 
    month
) AS project_counts ON all_months.month_date = project_counts.month
LEFT JOIN (
  SELECT 
    DATE_FORMAT(created_at, '%Y-%m-01') AS month,
    COUNT(DISTINCT quote_id) AS quote_count
  FROM 
    quotation
  WHERE 
    created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  GROUP BY 
    month
) AS quote_counts ON all_months.month_date = quote_counts.month
ORDER BY 
  month_date;
`;

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

    const { duration } = req.query;
    const lastMonthTxt =
      duration && duration > 1 ? `last ${duration} month` : "last month";

    const returnObj = {
      sales: {
        cardData: [
          {
            value: `RM ${parseFloat(newProjectOverallData.new_sales).toFixed(
              2
            )}`,
            description: lastMonthTxt,
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
            description: lastMonthTxt,
            title: "avg deal rate",
          },
        ],
      },
      marketing: {
        donutChartData: {
          title: "Sales chart",
          datas: bonutChartData,
          description: lastMonthTxt,
        },
        barChartData: barChartData,
        cardData: [
          {
            value: newQuoteOverallData.new_quote,
            description: lastMonthTxt,
            title: "new quote",
          },
          {
            value: `${parseFloat(
              (newProjectOverallData.new_project /
                newQuoteOverallData.new_quote) *
                100
            ).toFixed(2)}%`,
            description: lastMonthTxt,
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
            description: lastMonthTxt,
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
            description: lastMonthTxt,
            title: "in-flow",
          },
          {
            value: `RM ${parseFloat(newAccountOverallData.credit_total).toFixed(
              2
            )}`,
            description: lastMonthTxt,
            title: "out-flow",
          },
          {
            value: `RM ${parseFloat(averageProjectData.average_sales).toFixed(
              2
            )}`,
            description: "per month",
            title: "avg inflow",
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
