import React from "react";
import { Link } from "react-router-dom";
import "./AccountStatusCard.css";

const AccountStatusCard = () => {
  return (
    <>
      <div className="accountStatusSec">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Doc no</th>
              <th>Description</th>
              <th>Debit (RM)</th>
              <th>Credit (RM)</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12-12-2023</td>
              <td>
                <Link to="./">INV TAG</Link>
              </td>
              <td>Deposit (50%)</td>
              <td>6000.00</td>
              <td></td>
              <td>6000.00</td>
            </tr>
            <tr>
              <td>13-12-2023</td>
              <td>
                <Link to="./">INV TAG</Link>
              </td>
              <td>Hardware purchase (Soon Huat)</td>
              <td></td>
              <td>3000.00</td>
              <td>3000.00</td>
            </tr>
            <tr>
              <td>16-12-2023</td>
              <td>
                <Link to="./">INV TAG</Link>
              </td>
              <td>Customize cabinet</td>
              <td></td>
              <td>2000.00</td>
              <td>1000.00</td>
            </tr>
            <tr>
              <td>18-12-2023</td>
              <td>
                <Link to="./">INV TAG</Link>
              </td>
              <td>Wages (Mozaic)</td>
              <td></td>
              <td>300.00</td>
              <td>700.00</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <th style={{ textAlign: "right" }}>Total : </th>
              <th>6000.00</th>
              <th>5700.00</th>
              <th>300.00</th>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AccountStatusCard;
