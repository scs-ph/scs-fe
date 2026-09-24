import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  Button,
  Select,
  Option,
  Box,
  Divider,
  Typography,
} from "@mui/joy";
import type { RRFormDetailsProps } from "../interface";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import type { PaginatedSDR, Currency } from "../../../interface";
import SelectPOModal from "./SelectRRModal";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
  addCommaToNumberWithFourPlaces,
} from "../../../helper";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";
import { toast } from "react-toastify";

const RRFormDetails = ({
  openEdit,
  selectedRow,
  suppliers,
  selectedSDRs,
  setSelectedSDRs,

  // Fields
  selectedSupplier,
  setSelectedSupplier,
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  pesoRate,
  setPesoRate,
  currencyUsed,
  setCurrencyUsed,
  remarks,
  setRemarks,
  referenceNumber,
  setReferenceNumber,
  amountDiscount,
  setAmountDiscount,

  // Summary Amounts
  netAmount,
  totalExpense,
  percentNetCost,
  isEditDisabled,
}: RRFormDetailsProps): JSX.Element => {
  const [unservedSDRs, setUnservedSDRs] = useState<PaginatedSDR | undefined>();
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    if (selectedSupplier !== null && selectedSupplier !== undefined) {
      axiosInstance
        .get<PaginatedSDR>(
          `/api/supplier-delivery-receipts/?supplier_id=${selectedSupplier.supplier_id}&sort_order=desc&unassigned_to_rr=true`,
        )
        .then((response) => setUnservedSDRs(response.data))
        .catch((error) => console.error("Error:", error));
    }
  }, [selectedSupplier]);

  useEffect(() => {
    axiosInstance
      .get<Currency[]>("/api/currencies")
      .then((response) => setCurrencies(response.data))
      .catch((error) => console.error("Error fetching currencies:", error));
  }, []);

  const getFixedAmtDiscounts = (): void => {
    let total = 0;
    selectedSDRs.forEach((SDR) => {
      total += SDR.discount_amount;
    });

    setAmountDiscount(total);
  };

  useEffect(() => {
    getFixedAmtDiscounts();

    if (selectedSDRs.length > 0) {
      // Get reference number from first SDR
      const firstSDR = selectedSDRs[0];
      setReferenceNumber(firstSDR.reference_number);

      // Only auto-set currency and rate when creating a new RR, not when editing
      // In edit mode, the rate should come from the saved RR data
      if (!openEdit) {
        // Check if all SDRs have the same currency
        let commonCurrency: string | null = null;
        let commonRate: number | null = null;

        for (const sdr of selectedSDRs) {
          if (sdr.purchase_orders?.length > 0) {
            const sdrCurrency = sdr.purchase_orders[0].currency_used;
            const sdrRate = sdr.purchase_orders[0].peso_rate;

            if (commonCurrency === null) {
              // First SDR sets the currency
              commonCurrency = sdrCurrency;
              commonRate = sdrRate;
            } else if (commonCurrency !== sdrCurrency) {
              // Found different currency - this shouldn't happen but handle it
              toast.warning(
                `Warning: SDR ${sdr.id} has different currency (${sdrCurrency}) from others (${commonCurrency})`,
              );
            }
          }
        }

        // Set the common currency and rate
        if (commonCurrency !== null && commonRate !== null) {
          setCurrencyUsed(commonCurrency);
          setPesoRate(commonRate);
        }
      }
    }
  }, [selectedSDRs, openEdit]);

  return (
    <Box className="transaction-details">
      <SelectPOModal
        open={isSelectModalOpen}
        setOpen={setIsSelectModalOpen}
        unservedSDRs={unservedSDRs}
        setSelectedSDRs={setSelectedSDRs}
      />
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  RR No. {selectedRow?.id}
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
                    setSelectedSDRs([]);
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
                  if (value !== null) setStatus(value);
                }}
                size="sm"
                value={status}
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
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Amount Disc. Total</FormLabel>
              <Textarea value={amountDiscount} disabled />
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
                onChange={(e) => setPesoRate(e.target.value)}
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
                disabled
                required
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
            {(!openEdit || status === "unposted") && (
              <Button
                sx={{ gridColumn: "-2 / -1", alignSelf: "end", mt: 2 }}
                className="bg-button-primary"
                size="sm"
                onClick={() => setIsSelectModalOpen(true)}
                disabled={selectedSupplier === null || isEditDisabled}
              >
                Fill Up SDR Table
              </Button>
            )}
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <Box className="summary-figures" sx={{ mb: 1 }}>
            <Typography level="body-sm">Invoice Amount</Typography>
            <Typography level="title-sm">
              {`${currencyUsed} ${addCommaToNumberWithTwoPlaces(netAmount)}`}
            </Typography>

            <Typography level="body-sm">Landed Total</Typography>
            <Typography level="title-sm">
              ₱{addCommaToNumberWithFourPlaces(netAmount * Number(pesoRate))}
            </Typography>

            <Typography level="body-sm">% NET Cost</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(percentNetCost)}
            </Typography>

            <Typography level="body-sm">Total Expense</Typography>
            <Typography level="title-sm">
              ₱{addCommaToNumberWithTwoPlaces(Number(totalExpense))}
            </Typography>
          </Box>
          <Divider />
          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 2.5 }}>
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

export default RRFormDetails;
