import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Card,
  Stack,
  Select,
  Option,
  Box,
  Divider,
  Button,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";

import type { POFormProps } from "../interface";
import type { Currency } from "../../../interface";
import axiosInstance from "../../../utils/axiosConfig";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
  addCommaToNumberWithFourPlaces,
} from "../../../helper";

const POFormDetails = ({
  openEdit,
  selectedRow,
  suppliers,

  // Fields
  selectedSupplier,
  setSelectedSupplier,
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  discounts,
  setDiscounts,
  remarks,
  setRemarks,
  referenceNumber,
  setReferenceNumber,
  currencyUsed,
  setCurrencyUsed,
  pesoRate,
  setPesoRate,
  // Toggle for showing/hiding totals
  showTotals,
  setShowTotals,
  // Summary Amounts
  fobTotal,
  netAmount,
  landedTotal,
}: POFormProps): JSX.Element => {
  const isEditDisabled =
    selectedRow !== undefined && selectedRow?.status !== "unposted";

  const [currencies, setCurrencies] = useState<Currency[]>(() => {
    const code = selectedSupplier?.currency;
    if (typeof code === "string" && code.trim() !== "") {
      const placeholder: Currency = { id: -1, code };
      return [placeholder];
    }
    return [];
  });

  const handleDiscountChange = (
    type: "supplier" | "transaction",
    index: number,
    value: string,
  ): void => {
    const newDiscounts = { ...discounts };
    newDiscounts[type][index] = value;
    setDiscounts(newDiscounts);
  };

  useEffect(() => {
    if (selectedRow?.currency_used !== undefined) {
      setCurrencyUsed(selectedRow.currency_used);
    } else {
      const code = selectedSupplier?.currency;
      if (typeof code === "string" && code.trim() !== "") {
        setCurrencyUsed(code); // Update currencyUsed to match supplier's currency
      }
    }
  }, [selectedSupplier]);

  useEffect(() => {
    axiosInstance
      .get<Currency[]>("/api/currencies")
      .then((response) => setCurrencies(response.data))
      .catch((error) => console.error("Error fetching currencies:", error));
  }, []);

  return (
    <Box className="transaction-details">
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  PO No. {selectedRow?.id}
                </Typography>
              </div>
            )}
          </div>
          {openEdit && <Divider />}

          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 1 }}>
            <FormControl size="sm">
              <FormLabel>Supplier</FormLabel>
              <div className="flex">
                <TooltipAutocomplete
                  options={suppliers.items}
                  getOptionLabel={(option) => option.name}
                  value={selectedSupplier}
                  onChange={(event, newValue) => {
                    setSelectedSupplier(newValue);
                  }}
                  size="sm"
                  className="w-[100%]"
                  placeholder="Select Supplier"
                  disabled={isEditDisabled}
                  required
                />
              </div>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Status</FormLabel>
              <Select
                onChange={(event, value) => {
                  if (value !== null) {
                    setStatus(value);
                    // Automatically show totals when status is changed to posted
                    if (value === "posted" && setShowTotals !== undefined) {
                      setShowTotals(true);
                    }
                  }
                }}
                size="sm"
                value={status}
                disabled={isEditDisabled}
              >
                <Option value="unposted">Unposted</Option>
                <Option value="posted">Posted</Option>
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
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Currency Used</FormLabel>
              <Select
                onChange={(event, value) => {
                  if (value !== null) setCurrencyUsed(value);
                }}
                size="sm"
                placeholder="USD"
                value={currencyUsed}
                disabled={isEditDisabled}
              >
                {currencies.map((currency) => (
                  <Option key={currency.id} value={currency.code}>
                    {currency.code}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Philippine Peso Rate</FormLabel>
              <Input
                startDecorator="₱"
                type="number"
                size="sm"
                placeholder="56"
                value={pesoRate}
                onChange={(e) => {
                  setPesoRate(e.target.value);
                }}
                slotProps={{
                  input: {
                    min: 0,
                    step: ".0001",
                  },
                }}
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Ref No.</FormLabel>
              <Input
                size="sm"
                placeholder="Search"
                onChange={(e) => setReferenceNumber(e.target.value)}
                value={referenceNumber}
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Supp Disc. 1</FormLabel>
              <Input
                value={discounts.supplier[0]}
                onChange={(e) =>
                  handleDiscountChange("supplier", 0, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
              <FormHelperText sx={{ fontSize: "11px" }}>
                Add &quot;%&quot; if percent disc.
              </FormHelperText>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Trans Disc. 1</FormLabel>
              <Input
                value={discounts.transaction[0]}
                onChange={(e) =>
                  handleDiscountChange("transaction", 0, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
              <FormHelperText sx={{ fontSize: "11px" }}>
                Add &quot;%&quot; if percent disc.
              </FormHelperText>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Supp Disc. 2</FormLabel>
              <Input
                value={discounts.supplier[1]}
                onChange={(e) =>
                  handleDiscountChange("supplier", 1, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
              <FormHelperText sx={{ fontSize: "11px" }}>
                Add &quot;%&quot; if percent disc.
              </FormHelperText>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Trans Disc. 2</FormLabel>
              <Input
                value={discounts.transaction[1]}
                onChange={(e) =>
                  handleDiscountChange("transaction", 1, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
              <FormHelperText sx={{ fontSize: "11px" }}>
                Add &quot;%&quot; if percent disc.
              </FormHelperText>
            </FormControl>
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between mb-2">
            <Typography level="title-lg">Order Summary</Typography>
            <Button
              variant="outlined"
              size="sm"
              onClick={() =>
                setShowTotals !== undefined && setShowTotals((prev) => !prev)
              }
            >
              {showTotals === true ? "Hide Totals" : "Show Totals"}
            </Button>
          </div>
          {showTotals === true && (
            <Box className="order-summary__totals" sx={{ mb: 1 }}>
              <span />
              <Typography level="body-xs">{currencyUsed}</Typography>
              <Typography level="body-xs">PHP</Typography>

              <Typography level="body-sm">FOB Total</Typography>
              <Typography level="title-sm">
                {addCommaToNumberWithTwoPlaces(fobTotal)}
              </Typography>
              <Typography level="title-sm">
                {addCommaToNumberWithTwoPlaces(fobTotal * Number(pesoRate))}
              </Typography>

              <Typography level="body-sm">NET Amount</Typography>
              <Typography level="title-sm">
                {addCommaToNumberWithTwoPlaces(netAmount)}
              </Typography>
              <Typography level="title-sm">
                {addCommaToNumberWithTwoPlaces(netAmount * Number(pesoRate))}
              </Typography>

              <Typography level="body-sm">LANDED Total</Typography>
              <Typography level="title-sm">
                {addCommaToNumberWithTwoPlaces(landedTotal / Number(pesoRate))}
              </Typography>
              <Typography level="title-sm">
                {addCommaToNumberWithFourPlaces(landedTotal)}
              </Typography>
            </Box>
          )}
          <Divider />
          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 1 }}>
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
          <Stack direction="row" spacing={2} sx={{ mb: 1, mt: 2 }}>
            <FormControl size="sm" sx={{ mb: 3, width: "100%" }}>
              <FormLabel>Remarks</FormLabel>
              <Textarea
                minRows={1}
                placeholder="Remarks"
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                disabled={isEditDisabled}
              />
            </FormControl>
          </Stack>
        </div>
      </Card>
    </Box>
  );
};

export default POFormDetails;
