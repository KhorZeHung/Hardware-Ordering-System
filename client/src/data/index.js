export const dashBoardData = {
  marketing: {
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
    // tableData: {},
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
    // tableData: {},
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
    // tableData: {},
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
    tableData: {
      checkBox: {
        handlerArray: [
          {
            name: "edit",
            endPoint: "/edit",
          },
          {
            name: "delete",
            endPoint: "/delete",
          },
        ],
      },
      endPoint: "/supplier",
      filter: {
        options: [
          { name: "Interior Design", value: 1 },
          { name: "Kitchen Renovation", value: 2 },
          { name: "Bathroom Remodeling", value: 3 },
          { name: "Flooring", value: 4 },
          { name: "Painting", value: 5 },
          { name: "Roofing", value: 6 },
          { name: "Electrical Work", value: 7 },
          { name: "Plumbing", value: 8 },
          { name: "Landscaping", value: 9 },
        ],
      },
    },
    // cardData: [
    //   {
    //     value: "15",
    //     title: "total supplier",
    //   },
    // ],
    newModalForm: {
      title: "new supplier",
      submitValue: "add supplier",
      getDefaultValueEndPoint: "/supplier/",
      endPoint: "/supplier/register",
      inputLists: [
        {
          type: "text",
          name: "supplier_cmp_name",
          label: "supplier company name",
          placeholder: "Example sdn bhd",
        },
        {
          type: "checkbox",
          name: "supplier_category",
          label: "Supplier category",
          options: [
            { name: "Interior Design", value: 1 },
            { name: "Kitchen Renovation", value: 2 },
            { name: "Bathroom Remodeling", value: 3 },
            { name: "Flooring", value: 4 },
            { name: "Painting", value: 5 },
            { name: "Roofing", value: 6 },
            { name: "Electrical Work", value: 7 },
            { name: "Plumbing", value: 8 },
            { name: "Landscaping", value: 9 },
          ],
        },
        {
          type: "text",
          name: "supplier_pic",
          label: "Person In-charge",
          placeholder: "Full name with title",
        },
        {
          type: "text",
          name: "supplier_address",
          label: "Address",
          placeholder: "full address without post code",
          required: false,
        },
        {
          type: "tel",
          name: "supplier_contact",
          label: "Contact number",
          placeholder: "03-XXXX XXXX",
        },
        {
          type: "hidden",
          name: "supplier_id",
        },
      ],
    },
  },
  product: {
    tableData: {
      checkBox: {
        addCheckBox: true,
        handlerArray: [
          {
            name: "edit",
            endPoint: "/edit",
          },
          {
            name: "delete",
            endPoint: "/delete",
          },
        ],
      },
      filter: {
        options: [
          { name: "Interior Design", value: 1 },
          { name: "Kitchen Renovation", value: 2 },
          { name: "Bathroom Remodeling", value: 3 },
          { name: "Flooring", value: 4 },
          { name: "Painting", value: 5 },
          { name: "Roofing", value: 6 },
          { name: "Electrical Work", value: 7 },
          { name: "Plumbing", value: 8 },
          { name: "Landscaping", value: 9 },
        ],
      },
      endPoint: "/product",
    },
    // cardData: [
    //   {
    //     value: "112",
    //     title: "total product",
    //   },
    // ],
    newModalForm: {
      title: "new product / service",
      submitValue: "add product",
      getDefaultValueEndPoint: "/product/",
      endPoint: "/product/register",
      inputLists: [
        {
          type: "text",
          name: "product_name",
          label: "Product/Service name",
          placeholder: "Nippon paint 1L",
        },
        {
          type: "text",
          name: "product_unit_cost",
          label: "Cost (RM)",
          placeholder: "XXX.XX",
        },
        {
          type: "text",
          name: "product_unit_price",
          label: "Charging Price (RM)",
          placeholder: "XXX.XX",
        },
        {
          type: "option",
          name: "supplier_id",
          label: "Supplier",
        },
        {
          type: "checkbox",
          name: "product_category",
          label: "Product category",
          options: [
            { name: "Interior Design", value: 1 },
            { name: "Kitchen Renovation", value: 2 },
            { name: "Bathroom Remodeling", value: 3 },
            { name: "Flooring", value: 4 },
            { name: "Painting", value: 5 },
            { name: "Roofing", value: 6 },
            { name: "Electrical Work", value: 7 },
            { name: "Plumbing", value: 8 },
            { name: "Landscaping", value: 9 },
          ],
        },
        {
          type: "multipletext",
          name: "product_description",
          label: "product description",
          placeholder: "Description for Quotation, hit + to record",
        },
        {
          type: "hidden",
          name: "product_id",
        },
      ],
    },
  },
};
export const orderData = {
  tableData: {
    checkBox: {
      handlerArray: [
        {
          name: "view",
        },
      ],
    },
    filter: {
      options: [
        { name: "Proceed to order", value: "Proceed to order" },
        { name: "Order confirm", value: "Order confirm" },
        { name: "Ready to pick-up", value: "Ready to pick-up" },
        { name: "Paid", value: "Paid" },
        { name: "Rejected", value: "Rejected" },
        { name: "Problematic", value: "Problematic" },
      ],
    },
    endPoint: "/order",
  },
  // cardData: [
  //   {
  //     value: "RM 65,000.00",
  //     title: "total order",
  //     description: "last month",
  //   },
  //   {
  //     value: "RM 30,000",
  //     title: "unpaid amount",
  //     description: "12 order",
  //   },
  //   {
  //     value: "4",
  //     title: "uncheck order",
  //   },
  // ],
  orderRecordForm: {
    title: "edit order",
    submitValue: "save",
    endPoint: "/order/edit",
    grid: false,
    inputLists: [
      {
        type: "option",
        name: "project_order_status",
        label: "Status",
        options: [
          { name: "Proceed to order", value: "Proceed to order" },
          { name: "Order confirm", value: "Order confirm" },
          { name: "Ready to pick-up", value: "Ready to pick-up" },
          { name: "Paid", value: "Paid" },
          { name: "Rejected", value: "Rejected" },
          { name: "Problematic", value: "Problematic" },
        ],
      },
      {
        type: "hidden",
        name: "project_order_id",
      },
    ],
  },
  orderStatementForm: {
    title: "payment",
    submitValue: "add payment",
    endPoint: "/account/add",
    inputLists: [
      {
        type: "hidden",
        name: "isDebit",
        defaultValue: false,
      },
      {
        type: "date",
        name: "account_status_date",
        label: "Date",
      },
      {
        type: "file",
        name: "doc_refer",
        label: "Doc to refer",
        limit: 2,
      },
      {
        type: "number",
        name: "amount",
        label: "Amount",
        placeholder: "RM XXX.XX",
      },
      {
        type: "hidden",
        name: "account_status_description",
        defaultValue: "payment for ",
      },
      {
        type: "hidden",
        name: "project_id",
      },
    ],
  },
};

export const quoteData = {
  tableData: {
    endPoint: "/quote",
    checkBox: {
      addCheckBox: false,
      handlerArray: [
        {
          name: "edit",
          endPoint: "/edit",
        },
        {
          name: "delete",
          endPoint: "/delete",
        },
      ],
    },
    filter: {
      options: [
        { name: "condo", value: "condo" },
        { name: "shoplot", value: "shoplot" },
        { name: "mall", value: "mall" },
        { name: "terrace", value: "terrace" },
        { name: "banglow", value: "banglow" },
        { name: "semi-banglow", value: "semi-banglow" },
      ],
    },
  },
  // cardData: [
  //   {
  //     value: "13",
  //     title: "new quote",
  //     description: "last month",
  //   },
  //   {
  //     value: "33.33%",
  //     title: "convert rate",
  //     description: "last month",
  //   },
  //   {
  //     value: "RM 82,942.21",
  //     title: "avg charge / proj",
  //     description: "last month",
  //   },
  // ],
};
export const projectData = {
  endPoint: "/project",
  tableData: {
    endPoint: "/project",
    checkBox: {
      addCheckBox: false,
      handlerArray: [
        {
          name: "edit",
          endPoint: "/edit",
        },
      ],
    },
  },
  // cardData: [
  //   {
  //     value: "5",
  //     title: "new proj",
  //     description: "last month",
  //   },
  //   {
  //     value: "85.33%",
  //     title: "avg prog rate",
  //     description: "acive proj",
  //   },
  //   {
  //     value: "RM 6,342.21",
  //     title: "cash flow",
  //     description: "last month",
  //   },
  //   {
  //     value: "RM 22,942.21",
  //     title: "avg cost / proj",
  //     description: "last month",
  //   },
  // ],
  inputLists: [
    {
      type: "text",
      name: "project_name",
      label: "project name",
      disable: true,
    },
    {
      type: "text",
      name: "project_client_name",
      label: "Client name",
      disable: true,
    },
    {
      type: "tel",
      name: "project_client_contact",
      label: "Client contact number",
      disable: true,
    },
    {
      type: "text",
      name: "project_address",
      label: "address",
      disable: true,
    },
    {
      type: "option",
      name: "project_prop_type",
      label: "Type",
      options: [
        { name: "condo", value: "condo" },
        { name: "shoplot", value: "shoplot" },
        { name: "mall", value: "mall" },
        { name: "terrace", value: "terrace" },
        { name: "banglow", value: "banglow" },
        { name: "semi-banglow", value: "semi-banglow" },
      ],
      disable: true,
    },
  ],
};
export const userData = {
  tableData: {
    checkBox: {
      addCheckBox: true,
      handlerArray: [
        {
          name: "edit",
          endPoint: "/edit-profile",
        },
        {
          name: "delete",
          endPoint: "/delete",
        },
      ],
    },
    endPoint: "/user",
    filter: {
      options: [
        { name: "super user", value: 1 },
        { name: "admin", value: 2 },
        { name: "manager", value: 3 },
      ],
    },
  },
  newModalForm: {
    title: "new user",
    submitValue: "add user",
    endPoint: "/user/register",
    getDefaultValueEndPoint: "/user/",
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
        options: [
          { name: "superuser", value: 1 },
          { name: "admin", value: 2 },
          { name: "manager", value: 3 },
        ],
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

export const profileData = {
  profileForm: {
    title: "Profile",
    submitValue: "update profile",
    endPoint: "/user/edit-profile",
    getDefaultValueEndPoint: "/user/",
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
        options: [
          { name: "superuser", value: 1 },
          { name: "admin", value: 2 },
          { name: "manager", value: 3 },
        ],
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
      {
        type: "hidden",
        name: "update",
        defaultValue: true,
      },
    ],
  },
};

export const newQuoteData = {
  endPoint: "/quote/add",
  title: "new quote",
  inputLists: [
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
      options: [
        { name: "condo", value: "condo" },
        { name: "shoplot", value: "shoplot" },
        { name: "mall", value: "mall" },
        { name: "terrace", value: "terrace" },
        { name: "banglow", value: "banglow" },
        { name: "semi-banglow", value: "semi-banglow" },
      ],
    },
  ],
};

export const loginData = [
  {
    type: "text",
    name: "user_email",
    label: "Email",
    placeholder: "example@mail.com",
  },
  {
    type: "password",
    name: "user_password",
    label: "Password",
    placeholder: "keep it secret",
  },
];

export const forgotPasswordData = [
  [
    {
      type: "text",
      name: "user_email",
      label: "Email",
      placeholder: "example@gmail.com",
    },
  ],
  [
    {
      type: "text",
      name: "user_password",
      label: "Temporary password",
      placeholder: "has send to provided email",
    },
  ],
  [
    {
      type: "password",
      name: "user_password",
      label: "New password",
      placeholder: "be creative",
      onKeyUpCheck: true,
    },
    {
      type: "password",
      name: "user_repeat_password",
      label: "Repeat password",
      placeholder: "same as new password",
    },
  ],
];

export const accountData = {
  newAccountForm: {
    title: "new statement",
    submitValue: "add statement",
    endPoint: "/account/add",
    inputLists: [
      {
        type: "option",
        name: "isDebit",
        label: "Type of statement",
        options: [
          { name: "debit", value: true },
          { name: "credit", value: false },
        ],
      },
      {
        type: "date",
        name: "account_status_date",
        label: "Date",
      },
      {
        type: "number",
        name: "amount",
        label: "Amount",
        placeholder: "RM XXX.XX",
      },
      {
        type: "file",
        name: "doc_refer",
        label: "Doc to refer",
        limit: 2,
      },
      {
        type: "text",
        name: "account_status_description",
        label: "Description",
        placeholder: "characteristic of statement",
      },
      {
        type: "hidden",
        name: "project_id",
      },
    ],
  },
};

export const APIGateway = "http://localhost:8080";
export const ImgPathWay = "/images/";
