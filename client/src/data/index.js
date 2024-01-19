export const dashBoardData = {
  marketing: {
    tableData: {},
    donutChartData: {
      title: "sales and quote comparison",
      label: [1991, 1992, 1993],
      datas: [
        [1, 2, 3],
        [1, 2, 3],
      ],
      description: "last month",
    },
    barChartData: {},
    cardData: [
      {
        value: "43",
        description: "last month",
        title: "new quote",
      },
      {
        value: "33.33%",
        description: "last month",
        title: "deal rate",
      },
      {
        value: "30.13%",
        description: "per month",
        title: "avg deal rate",
      },
      {
        value: "RM 268212.00",
        description: "per proj",
        title: "avg charge",
      },
    ],
  },
  sales: {
    tableData: {},
    cardData: [
      {
        value: "RM 635432.30",
        description: "last month",
        title: "new sales",
      },
      {
        value: "RM 764132.29",
        description: "per month",
        title: "avg sales",
      },
      {
        value: "33.34%",
        description: "last month",
        title: "Conversation rate",
      },
      {
        value: "Mr James",
        description: "RM 132k last month",
        title: "top sales",
      },
    ],
  },
  project: {
    tableData: {},
    cardData: [
      {
        value: "15",
        description: "last month",
        title: "new project",
      },
      {
        value: "11.34",
        description: "per month",
        title: "avg new proj",
      },
      {
        value: "20",
        description: "currently",
        title: "active proj",
      },
      {
        value: "85.66%",
        description: "currently",
        title: "active progress",
      },
    ],
  },
  account: {
    tableData: {},
    cardData: [
      {
        value: "RM 314432.30",
        description: "per month",
        title: "new payment",
      },
      {
        value: "RM 214132.29",
        description: "per month",
        title: "avg payment",
      },
      {
        value: "RM 434300.00",
        description: "10 projects",
        title: "active outstanding",
      },
    ],
  },
};

export const contactData = {
  supplier: {
    tableData: { checkBox: true },
    cardData: [
      {
        value: "15",
        title: "total supplier",
      },
    ],
  },
  product: {
    tableData: { checkBox: true },
    cardData: [
      {
        value: "112",
        title: "total product",
      },
    ],
  },
};
export const notificationData = {
  tableData: { checkBox: true, filterOption: ["all", "unseen", "seen"] },
};
export const orderData = {
  tableData: { checkBox: true, filterOption: ["all", "uncheck", "checked"] },
  cardData: [
    {
      value: "RM 65,000.00",
      title: "total order",
      description: "last month",
    },
    {
      value: "RM 30,000",
      title: "unpaid amount",
      description: "12 order",
    },
    {
      value: "4",
      title: "uncheck order",
    },
  ],
};

export const quoteData = {
  tableData: { checkBox: true },
  cardData: [
    {
      value: "13",
      title: "new quote",
      description: "last month",
    },
    {
      value: "33.33%",
      title: "convert rate",
      description: "last month",
    },
    {
      value: "RM 82,942.21",
      title: "avg charge / proj",
      description: "last month",
    },
  ],
};
export const projectData = {
  tableData: { checkBox: true, filterOption: ["all", "active", "terminated"] },
  cardData: [
    {
      value: "5",
      title: "new proj",
      description: "last month",
    },
    {
      value: "85.33%",
      title: "avg prog rate",
      description: "acive proj",
    },
    {
      value: "RM 6,342.21",
      title: "cash flow",
      description: "last month",
    },
    {
      value: "RM 22,942.21",
      title: "avg cost / proj",
      description: "last month",
    },
  ],
};
export const userData = {
  tableData: { checkBox: true },
};
