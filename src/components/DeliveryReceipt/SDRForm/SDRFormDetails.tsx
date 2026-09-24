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
import type { SDRFormDetailsProps } from "../interface";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import type { PaginatedPO, PurchaseOrder } from "../../../interface";
import SelectPOModal from "./SelectPOModal";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
  addCommaToNumberWithFourPlaces,
} from "../../../helper";

const SDRFormDetails = ({
  openEdit,
  selectedRow,
  suppliers,
  selectedPOs,
  setSelectedPOs,

  // Fields
  selectedSupplier,
  setSelectedSupplier,
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  remarks,
  setRemarks,
  referenceNumber,
  setReferenceNumber,
  pesoRate,
  currencyUsed,
  isEditDisabled,

  // Summary Amounts
  fobTotal,
  netAmount,
  landedTotal,
  amountDiscount,
  setAmountDiscount,
}: SDRFormDetailsProps): JSX.Element => {
  const [unservedPOs, setUnservedPOs] = useState<PurchaseOrder[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

  const isAmtDiscountAlreadyApplied = (PO: PurchaseOrder): boolean => {
    for (const POItem of PO.items) {
      // If on stock increased, meaning this PO has already been handled before
      if (POItem.on_stock > 0 || POItem.allocated > 0 || POItem.in_transit > 0)
        return true;
    }
    return false;
  };

  const getFixedAmtDiscounts = (): void => {
    let total = 0;

    for (const PO of selectedPOs) {
      // Check if this is not the first SDR with this PO
      // to apply the amount discount
      if (isAmtDiscountAlreadyApplied(PO)) {
        continue;
      }

      if (!PO.supplier_discount_1.includes("%"))
        total += Number(PO.supplier_discount_1);

      if (!PO.supplier_discount_2.includes("%"))
        total += Number(PO.supplier_discount_2);

      if (!PO.supplier_discount_3.includes("%"))
        total += Number(PO.supplier_discount_3);

      if (!PO.transaction_discount_1.includes("%"))
        total += Number(PO.transaction_discount_1);

      if (!PO.transaction_discount_2.includes("%"))
        total += Number(PO.transaction_discount_2);

      if (!PO.transaction_discount_3.includes("%"))
        total += Number(PO.transaction_discount_3);
    }

    setAmountDiscount(total);
  };

  useEffect(() => {
    if (selectedSupplier !== null && selectedSupplier !== undefined) {
      axiosInstance
        .get<PaginatedPO>(
          `/api/purchase_orders/supplier/${selectedSupplier.supplier_id}`,
        )
        .then((response) =>
          setUnservedPOs(
            response.data.items
              .filter((PO) => PO.status === "posted")
              .filter((PO) => PO.status === "posted")
              .sort((a, b) => b.id - a.id),
          ),
        )
        .catch((error) => console.error("Error:", error));
    }
  }, [selectedSupplier]);

  useEffect(() => {
    getFixedAmtDiscounts();
  }, [selectedPOs]);

  return (
    <Box className="transaction-details">
      <SelectPOModal
        open={isSelectModalOpen}
        setOpen={setIsSelectModalOpen}
        unservedPOs={unservedPOs}
        setSelectedPOs={setSelectedPOs}
      />
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  SDR No. {selectedRow?.id}
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
                    setSelectedPOs([]);
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
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Amount Disc. Total</FormLabel>
              <Textarea value={amountDiscount} disabled />
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
                disabled={selectedSupplier === null}
              >
                Fill Table
              </Button>
            )}
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <Box className="order-summary__totals" sx={{ mb: 1 }}>
            <span />
            <Typography level="body-xs">{currencyUsed}</Typography>
            <Typography level="body-xs">PHP</Typography>

            <Typography level="body-sm">FOB Total</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(fobTotal)}
            </Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(fobTotal * pesoRate)}
            </Typography>

            <Typography level="body-sm">NET Amount</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(netAmount)}
            </Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(netAmount * pesoRate)}
            </Typography>

            <Typography level="body-sm">LANDED Total</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(
                Number.isNaN(landedTotal / pesoRate)
                  ? 0
                  : landedTotal / pesoRate,
              )}
            </Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithFourPlaces(landedTotal)}
            </Typography>
          </Box>
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
        </div>
      </Card>
    </Box>
  );
};

export default SDRFormDetails;
