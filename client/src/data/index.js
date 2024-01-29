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
    newModalForm: {
      title: "new supplier",
      submitValue: "add supplier",
      inputLists: [
        {
          type: "text",
          name: "splr_company",
          label: "supplier company name",
          placeholder: "Example sdn bhd",
        },
        {
          type: "checkbox",
          name: "splr_cat",
          label: "Supplier category",
          options: [
            "furniture",
            "carpentry",
            "curtain",
            "decoration",
            "general hardware",
            "electrical hardware",
            "plumbing hardware",
            "electrical service",
            "plumbing service",
          ].sort(),
        },
        {
          type: "text",
          name: "personInCharge",
          label: "Person In-charge",
          placeholder: "Full name with title",
        },
        {
          type: "email",
          name: "splr_email",
          label: "Company E-mail",
          placeholder: "example@gmail.com",
          required: false,
        },
        {
          type: "tel",
          name: "splr_contact",
          label: "Contact number",
          placeholder: "03-XXXX XXXX",
        },
      ],
    },
  },
  product: {
    tableData: { checkBox: true },
    cardData: [
      {
        value: "112",
        title: "total product",
      },
    ],
    newModalForm: {
      title: "new product / service",
      submitValue: "add product",
      inputLists: [
        {
          type: "text",
          name: "product_name",
          label: "Product/Service name",
          placeholder: "Cement 50kg 1pack ...",
        },
        {
          type: "text",
          name: "product_cost",
          label: "Cost (RM)",
          placeholder: "XXX.XX",
        },
        {
          type: "text",
          name: "product_price",
          label: "Charging Price (RM)",
          placeholder: "+15% to cost as default",
        },
        {
          type: "text",
          name: "product_brand",
          label: "Product Brand ",
          required: false,
          default: 1,
        },
        {
          type: "checkbox",
          name: "product_cat",
          label: "Supplier",
          options: [
            "supplier 1",
            "supplier 2",
            "supplier 3",
            "supplier 4",
            "supplier 5",
            "supplier 6",
            "supplier 7",
            "supplier 8",
            "supplier 9",
            "supplier 10",
          ].sort(),
        },
        {
          type: "checkbox",
          name: "splr_cat",
          label: "Product category",
          options: [
            "furniture",
            "carpentry",
            "curtain",
            "decoration",
            "general hardware",
            "electrical hardware",
            "plumbing hardware",
            "electrical service",
            "plumbing service",
          ].sort(),
        },
        {
          type: "textarea",
          name: "product_detail",
          label: "product detail",
          required: false,
          placeholder: "Record anything for internal use.",
        },
        {
          type: "multipletext",
          name: "product_description",
          label: "product description",
          placeholder: "Description for Quotation, hit enter to record",
        },
      ],
    },
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
  newModalForm: {
    title: "new user",
    submitValue: "add user",
    inputLists: [
      {
        type: "text",
        name: "user_name",
        label: "user name",
        placeholder: "Full name without title",
      },
      {
        type: "option",
        name: "user_authority",
        label: "Autority",
        options: ["super user", "manager", "admin"],
      },
      {
        type: "email",
        name: "user_email",
        label: "E-mail",
        placeholder: "example@email.com",
      },
      {
        type: "tel",
        name: "user_contact",
        label: "Contact number",
        placeholder: "01X-XXX XXXX",
      },
    ],
  },
};

export const newQuoteData = [
  {
    type: "text",
    name: "quote_name",
    label: "quote name",
    placeholder: "Describe location or version",
  },
  {
    type: "text",
    name: "quote_client_name",
    label: "Client name",
    placeholder: "Full name with title",
  },
  {
    type: "tel",
    name: "quote_client_contact",
    label: "Client contact number",
    placeholder: "01X-XXX XXXX",
  },
  {
    type: "text",
    name: "quote_address",
    label: "address",
    placeholder: "full address with unit",
  },
  {
    type: "option",
    name: "quote_prop_type",
    label: "Type",
    options: ["condo", "shoplot", "retail shop", "shopping mall", "terrace"],
  },
];
