import React from "react";

const QuoteProjSummary = ({ formInputValue, discountHandler }) => {
  const { quote_sub_total, quote_grand_total, quote_discount } = formInputValue;
  return (
    <div className="subTotalSec">
      <table>
        <tbody>
          <tr>
            <td>Subtotal</td>
            <td>: RM {parseFloat(quote_sub_total).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Discount (RM)</td>
            <td>
              :
              <input
                type="number"
                name="discount"
                defaultValue={parseFloat(quote_discount).toFixed(2)}
                step={0.01}
                max={quote_sub_total}
                onChange={discountHandler}
              />
            </td>
          </tr>
          <tr>
            <td>Total After Discount</td>
            <td>: RM {parseFloat(quote_grand_total).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Grand Total</td>
            <td>: RM {parseFloat(quote_grand_total).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuoteProjSummary;
