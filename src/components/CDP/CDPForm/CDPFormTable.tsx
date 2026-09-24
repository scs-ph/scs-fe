import { Sheet, Input } from "@mui/joy";
import Table from "@mui/joy/Table";

import type { AllocItemsFE, CDPFormTableProps } from "../interface";
import { addCommaToNumberWithTwoPlaces } from "../../../helper";
import { withTooltip } from "../../shared/withTooltip";

const CDPFormTable = ({
  formattedAllocs,
  setFormattedAllocs,
  isEditDisabled,
}: CDPFormTableProps): JSX.Element => {
  const calculateNetForRow = (
    newValue: number,
    allocItem: AllocItemsFE,
  ): number => {
    let result = newValue * allocItem.price;

    if (allocItem.customer_discount_1.includes("%")) {
      const cd1 = allocItem.customer_discount_1.slice(0, -1);
      result = result - result * (parseFloat(cd1) / 100);
    }

    if (allocItem.customer_discount_2.includes("%")) {
      const cd2 = allocItem.customer_discount_2.slice(0, -1);
      result = result - result * (parseFloat(cd2) / 100);
    }

    if (allocItem.customer_discount_3.includes("%")) {
      const cd3 = allocItem.customer_discount_3.slice(0, -1);
      result = result - result * (parseFloat(cd3) / 100);
    }

    if (allocItem.transaction_discount_1.includes("%")) {
      const td1 = allocItem.transaction_discount_1.slice(0, -1);
      result = result - result * (parseFloat(td1) / 100);
    }

    if (allocItem.transaction_discount_2.includes("%")) {
      const td2 = allocItem.transaction_discount_2.slice(0, -1);
      result = result - result * (parseFloat(td2) / 100);
    }

    if (allocItem.transaction_discount_3.includes("%")) {
      const td3 = allocItem.transaction_discount_3.slice(0, -1);
      result = result - result * (parseFloat(td3) / 100);
    }

    if (isNaN(result)) return 0;

    return result;
  };

  return (
    <Sheet
      sx={{
        "--TableCell-height": "40px",
        // the number is the amount of the header rows.
        "--TableHeader-height": "calc(1 * var(--TableCell-height))",
        "--Table-firstColumnWidth": "80px",
        "--Table-lastColumnWidth": "86px",
        // background needs to have transparency to show the scrolling shadows
        "--TableRow-hoverBackground": "rgba(0 0 0 / 0.04)",
        overflow: "auto",
        borderRadius: "sm",
        marginTop: 3,
        width: "fit-content",
        maxWidth: "100%",
        background: (
          theme,
        ) => `linear-gradient(to right, ${theme.vars.palette.background.surface} 30%, rgba(255, 255, 255, 0)),
              linear-gradient(to right, rgba(255, 255, 255, 0), ${theme.vars.palette.background.surface} 70%) 0 100%,
              radial-gradient(
                farthest-side at 0 50%,
                rgba(0, 0, 0, 0.12),
                rgba(0, 0, 0, 0)
              ),
                0 100%`,
        backgroundSize:
          "40px calc(100% - var(--TableCell-height)), 40px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height))",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "local, local, scroll, scroll",
        backgroundPosition:
          "var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height), var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height)",
        backgroundColor: "background.surface",
        maxHeight: "600px",
      }}
    >
      <Table
        className="h-5"
        size="sm"
        stickyHeader
        hoverRow
        sx={{
          fontSize: "13px",
          tableLayout: "fixed",
          "& tbody tr > *:first-child": {
            position: "sticky",
            zIndex: 2,
            left: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.surface",
          },
          "& thead tr > *:first-child": {
            position: "sticky",
            zIndex: 3,
            left: 0,
            top: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.level1",
          },
          "& tr > *:not(:first-child)": {
            position: "relative",
            zIndex: 0,
          },
          "& thead th": {
            backgroundColor: "background.level1",
          },
        }}
        borderAxis="both"
      >
        <thead>
          <tr>
            <th
              style={{
                width: "var(--Table-firstColumnWidth)",
              }}
            >
              Alloc No.
            </th>
            <th style={{ width: 150 }}>Stock Code</th>
            <th style={{ width: 300 }}>Name</th>
            <th style={{ width: 100, textAlign: "right" }}>Price</th>
            <th style={{ width: 100, textAlign: "right" }}>Alloc Qty.</th>
            <th style={{ width: 100, textAlign: "right" }}>DR Plan Qty.</th>
            <th style={{ width: 100, textAlign: "right" }}>Gross Amount</th>
            <th style={{ width: 130, textAlign: "right" }}>
              Cust. Disc. 1 (%)
            </th>
            <th style={{ width: 130, textAlign: "right" }}>
              Cust. Disc. 2 (%)
            </th>
            {/* <th style={{ width: 150 }}>Cust. Disc. 3 (%)</th> */}
            <th style={{ width: 130, textAlign: "right" }}>
              Tran. Disc. 1 (%)
            </th>
            <th style={{ width: 130, textAlign: "right" }}>
              Tran. Disc. 2 (%)
            </th>
            {/* <th style={{ width: 150 }}>Tran. Disc. 3 (%)</th> */}
            <th style={{ width: 100, textAlign: "right" }}>NET Amount</th>
          </tr>
        </thead>
        <tbody>
          {formattedAllocs.map((item) => {
            // Identify a row by its allocation item: that is what the save
            // payload keys off, and two allocations can carry the same stock
            // code for the same customer.
            const key = `${item.alloc_item_id}`;
            const price = addCommaToNumberWithTwoPlaces(item?.price ?? 0);

            return (
              <tr key={key}>
                <td>{item.id}</td>
                <td>{withTooltip(item?.stock_code, "120px")}</td>
                <td>{withTooltip(item?.name, "180px")}</td>
                <td style={{ textAlign: "right" }}>{price}</td>
                <td style={{ textAlign: "right" }}>{item.alloc_qty}</td>
                <td style={{ textAlign: "right" }}>
                  <Input
                    type="number"
                    value={item.dp_qty}
                    sx={{
                      fontSize: "13px",
                      width: "100%",
                      minWidth: 0,
                      input: { textAlign: "right", minWidth: 0 },
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw !== "" && !/^\d+$/.test(raw)) return;
                      setFormattedAllocs((prevAllocItems) =>
                        prevAllocItems.map((allocItem) =>
                          allocItem.alloc_item_id === item.alloc_item_id
                            ? {
                                ...allocItem,
                                dp_qty: raw,
                                gross_amount: Number(item.price) * Number(raw),
                                net_amount: calculateNetForRow(
                                  Number(raw),
                                  allocItem,
                                ),
                              } // Update the matching item
                            : allocItem,
                        ),
                      );
                    }}
                    slotProps={{
                      input: {
                        min: 0,
                        step: 1,
                      },
                    }}
                    placeholder="0"
                    disabled={isEditDisabled}
                  />
                </td>
                <td style={{ textAlign: "right" }}>
                  {addCommaToNumberWithTwoPlaces(item.gross_amount)}
                </td>
                <td style={{ textAlign: "right" }}>
                  {item.customer_discount_1.includes("%")
                    ? item.customer_discount_1
                    : 0}
                </td>
                <td style={{ textAlign: "right" }}>
                  {item.customer_discount_2.includes("%")
                    ? item.customer_discount_2
                    : 0}
                </td>
                {/* <td style={{ textAlign: "right" }}>
                  {item.customer_discount_3.includes("%")
                    ? item.customer_discount_3
                    : 0}
                </td> */}
                <td style={{ textAlign: "right" }}>
                  {item.transaction_discount_1.includes("%")
                    ? item.transaction_discount_1
                    : 0}
                </td>
                <td style={{ textAlign: "right" }}>
                  {item.transaction_discount_2.includes("%")
                    ? item.transaction_discount_2
                    : 0}
                </td>
                {/* <td style={{ textAlign: "right" }}>
                  {item.transaction_discount_3.includes("%")
                    ? item.transaction_discount_3
                    : 0}
                </td> */}
                <td style={{ textAlign: "right" }}>
                  {addCommaToNumberWithTwoPlaces(item.net_amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default CDPFormTable;
