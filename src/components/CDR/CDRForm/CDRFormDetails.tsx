import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  Select,
  Option,
  Box,
  Divider,
  Typography,
} from "@mui/joy";
import type { CDRFormDetailsProps, AllocItemsFE } from "../interface";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";
import TooltipInput from "../../shared/TooltipInput";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
} from "../../../helper";
import { type CDP } from "../../../interface";

const CDRFormDetails = ({
  openEdit,
  selectedRow,
  customers,
  setFormattedAllocs,
  selectedCustomer,
  setSelectedCustomer,
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  remarks,
  setRemarks,
  referenceNumber,
  setReferenceNumber,
  isEditDisabled,
  totalNet,
  totalGross,
  totalItems,
  setAmountDiscount,
  selectedDP,
  setSelectedDP,
}: CDRFormDetailsProps): JSX.Element => {
  const [unservedDPs, setUnservedDPs] = useState<CDP[]>([]);

  useEffect(() => {
    if (selectedCustomer !== null && selectedCustomer !== undefined) {
      axiosInstance
        .get<CDP[]>(
          `/api/delivery-plans/available/${selectedCustomer.customer_id}`,
        )
        .then((response) =>
          setUnservedDPs(
            response.data
              .filter(
                (dp) =>
                  dp.status === "posted" && dp.delivery_plan_items.length > 0,
              )
              .sort((a, b) => b.id - a.id),
          ),
        )
        .catch((error) => console.error("Error:", error));
    }
  }, [selectedCustomer]);

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

  const handleCDPChange = (newValue: CDP | null): void => {
    setSelectedDP(newValue);

    if (newValue !== null) {
      setReferenceNumber(String(newValue.reference_number));
      setAmountDiscount(Number(newValue?.discount_amount ?? 0));
      // Set transaction date from selected CDP
      setTransactionDate(newValue.transaction_date);

      const formattedAllocs = newValue.delivery_plan_items.map((DPItem) => {
        const allocItem = DPItem.allocation_item;

        const itemObj = allocItem.customer_purchase_order.items.find(
          (item) => item.item_id === allocItem.item_id,
        );

        return {
          id: allocItem.allocation_id,
          stock_code: itemObj?.item.stock_code ?? "",
          name: itemObj?.item.name ?? "",
          cpo_id: allocItem.customer_purchase_order_id,
          dp_qty: String(DPItem.planned_qty),
          delivery_plan_item_id: DPItem.id,

          price: itemObj?.price ?? 0,
          gross_amount: (itemObj?.price ?? 0) * DPItem.planned_qty,
          net_amount: 0,

          customer_discount_1:
            allocItem.customer_purchase_order.customer_discount_1,
          customer_discount_2:
            allocItem.customer_purchase_order.customer_discount_2,
          customer_discount_3:
            allocItem.customer_purchase_order.customer_discount_3,

          transaction_discount_1:
            allocItem.customer_purchase_order.transaction_discount_1,
          transaction_discount_2:
            allocItem.customer_purchase_order.transaction_discount_2,
          transaction_discount_3:
            allocItem.customer_purchase_order.transaction_discount_3,
        };
      });

      const formattedAllocsWithNet = formattedAllocs.map((formattedAlloc) => {
        return {
          ...formattedAlloc,
          net_amount: calculateNetForRow(
            Number(formattedAlloc.dp_qty),
            formattedAlloc,
          ),
        };
      });

      setFormattedAllocs(formattedAllocsWithNet);
    } else {
      setReferenceNumber("");
      // Clear transaction date when no CDP is selected
      setTransactionDate("");
      setFormattedAllocs([]);
    }
  };

  return (
    <Box className="transaction-details">
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  CDR No. {selectedRow?.id}
                </Typography>
              </div>
            )}
          </div>
          {openEdit && <Divider />}

          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 1 }}>
            <FormControl size="sm">
              <FormLabel>Customer</FormLabel>
              <div className="flex">
                <TooltipAutocomplete
                  options={customers.items}
                  getOptionLabel={(option) => option.name}
                  value={selectedCustomer}
                  onChange={(event, newValue) => {
                    setSelectedCustomer(newValue);
                    setFormattedAllocs([]);
                    setSelectedDP(null);
                    // Clear transaction date when customer changes
                    setTransactionDate("");
                  }}
                  size="sm"
                  className="w-[100%]"
                  placeholder="Select Customer"
                  disabled={isEditDisabled}
                  required
                />
              </div>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>CDP No.</FormLabel>
              <div className="flex">
                <TooltipAutocomplete
                  options={unservedDPs}
                  getOptionLabel={(option) =>
                    `${String(option.id)} - Ref: ${option.reference_number}`
                  }
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      key={option.id}
                      style={{
                        ...props.style,
                        cursor: "pointer",
                        borderRadius: "var(--joy-radius-sm, 8px)",
                        margin:
                          "var(--ListItem-paddingY, 2px) var(--ListItem-paddingX, 4px)",
                        padding: 0,
                        transition:
                          "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F0F4F8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          padding:
                            "var(--ListItem-paddingBlock, 8px) var(--ListItem-paddingInline, 12px)",
                          minHeight: "var(--ListItem-minHeight, 40px)",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--joy-fontSize-sm, 0.875rem)",
                            fontWeight: "var(--joy-fontWeight-md, 500)",
                            lineHeight: "var(--joy-lineHeight-sm, 1.25)",
                            color: "var(--joy-palette-text-primary, #0B0D0E)",
                          }}
                        >
                          CDP-{String(option.id)}
                        </span>
                        <span
                          style={{
                            fontSize: "var(--joy-fontSize-xs, 0.75rem)",
                            color: "var(--joy-palette-text-secondary, #5A6169)",
                            marginTop: "2px",
                            lineHeight: "var(--joy-lineHeight-sm, 1.25)",
                          }}
                        >
                          Ref: {option.reference_number}
                        </span>
                      </div>
                    </li>
                  )}
                  onChange={(e, newValue) => handleCDPChange(newValue)}
                  value={selectedDP}
                  size="sm"
                  className="w-[100%]"
                  placeholder="Select CDP"
                  disabled={isEditDisabled}
                  required
                />
              </div>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Status</FormLabel>
              <Select
                onChange={(event, value) => {
                  if (value !== null) setStatus(value);
                }}
                size="sm"
                value={status}
                disabled={isEditDisabled}
              >
                <Option value="posted">Posted</Option>
                <Option value="unposted">Unposted</Option>
                {/* Display only - an archived record must never be created as one */}
                {status === "archived" && (
                  <Option value="archived">Archived</Option>
                )}
              </Select>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Transaction Date</FormLabel>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                disabled
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Ref No.</FormLabel>
              <TooltipInput
                size="sm"
                placeholder="Ref No."
                // onChange={(e) => setReferenceNumber(e.target.value)}
                value={referenceNumber}
                disabled
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Remarks</FormLabel>
              <Textarea
                minRows={1}
                placeholder="Remarks"
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                disabled={isEditDisabled}
              />
            </FormControl>
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <Box className="summary-figures" sx={{ mb: 1 }}>
            <Typography level="body-sm">Total Qty</Typography>
            <Typography level="title-sm">{totalItems}</Typography>

            <Typography level="body-sm">Total Gross</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(totalGross)}
            </Typography>

            <Typography level="body-sm">Total NET</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(totalNet)}
            </Typography>
          </Box>
          <Divider />
          <Box className="transaction-details__fields" sx={{ mb: 2, mt: 2 }}>
            <FormControl size="sm">
              <FormLabel>Created by</FormLabel>
              <p className="text-sm">
                {selectedRow?.creator?.full_name ?? "-"}
              </p>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Date Created</FormLabel>
              <p className="text-sm">
                {formatToDateTime(selectedRow?.date_created)}
              </p>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Modified by</FormLabel>
              <p className="text-sm">
                {selectedRow?.modifier?.full_name ?? "-"}
              </p>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Date Modified</FormLabel>
              <p className="text-sm">
                {formatToDateTime(selectedRow?.date_modified)}
              </p>
            </FormControl>
          </Box>
        </div>
      </Card>
    </Box>
  );
};

export default CDRFormDetails;
