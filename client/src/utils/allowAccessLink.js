import { decode } from "jsonwebtoken";
import { getCookie } from "./cookie";

export const allowAccessLink = () => {
  if (!getCookie("token")) return;

  const position = decode(getCookie("token")).user_authority;
  switch (position) {
    case 1:
      return ["contact", "order", "quotation", "project", "user"];

    case 2:
      return ["contact", "order", "project", "user"];
    case 3:
      return ["contact", "order", "quotation", "project"];
    default:
      return;
  }
};
