import { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  Select,
  Option,
  Box,
  Button,
  Divider,
  Typography,
} from "@mui/joy";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import type { ARFormDetailsProps } from "../interface";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
  addTwoPlaces,
} from "../../../helper";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";

const ARFormDetails = ({
  openEdit,
  selectedRow,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  fetchARByCustomer,
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  remarks,
  setRemarks,
  isEditDisabled,
  paymentMode,
  setPaymentMode,
  checkDate,
  setCheckDate,
  checkNumber,
  setCheckNumber,
  amountPaid,
  setAmountPaid,
  lessAmount,
  setLessAmount,
  addAmount1,
  addAmount2,
  addAmount3,
  setAddAmount1,
  setAddAmount2,
  setAddAmount3,
  totalApplied,
  paymentAmount,
  refNo,
  setRefNo,
  paymentStatus,
  selectedCDR,
  setSelectedCDR,
  cdrNumbers,
  outstandingTrans,
  setOutstandingTrans,
}: ARFormDetailsProps): JSX.Element => {
  const [showAuditDetails, setShowAuditDetails] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDRFilter = (
    event: React.SyntheticEvent,
    newValue: string | null,
  ): void => {
    setSelectedCDR(newValue);
    // Make sure complete payment
    if (newValue !== null) {
      // SIDE LOGIC: For edit, if its empty, need to fetch all AR again (cause only posted items are displayed)
      if (
        selectedCustomer !== null &&
        outstandingTrans.filter((trans) =>
          [trans.transaction_number, trans.reference].includes(
            String(newValue),
          ),
        ).length === 0
      ) {
        fetchARByCustomer(selectedCustomer?.customer_id, {}, [], true);
      }

      // Normal case: when DR choice is changed, select only relevant DRs
      setOutstandingTrans(
        outstandingTrans.map((t) => {
          if ([t.transaction_number, t.reference].includes(String(newValue))) {
            return {
              ...t,
              payment: addTwoPlaces(Number(t.transaction_amount)),
            };
          }

          return {
            ...t,
            payment: "",
          };
        }),
      );
    } else {
      setOutstandingTrans(
        outstandingTrans.map((t) => {
          return {
            ...t,
            payment: "",
          };
        }),
      );
    }
  };

  return (
    <Box className="transaction-details">
      <Card variant="soft" color="neutral">
        <div>
          <div className="mb-2">
            {openEdit && (
              <div className="flex justify-between items-center w-full">
                <Typography level="title-lg">
                  Receipt No. {selectedRow?.id} -{" "}
                  {paymentStatus.charAt(0).toUpperCase() +
                    paymentStatus.slice(1)}
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
                    setSelectedCDR(null);

                    if (newValue !== undefined && newValue !== null)
                      fetchARByCustomer(newValue?.customer_id);
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
              <FormLabel>Payment Mode</FormLabel>
              <Select
                onChange={(event, value) => {
                  if (value !== null) setPaymentMode(value);
                  setCheckDate("");
                }}
                size="sm"
                value={paymentMode}
                disabled={isEditDisabled}
              >
                <Option value="cash">Cash</Option>
                <Option value="check">Check</Option>
              </Select>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Amount Paid</FormLabel>
              <Input
                type="number"
                name="amountPaid"
                size="sm"
                placeholder="0"
                value={amountPaid}
                slotProps={{
                  input: {
                    min: 0,
                    step: 0.01,
                  },
                }}
                onChange={(e) => setAmountPaid(String(e.target.value))}
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Check No.</FormLabel>
              <Input
                type="text"
                value={refNo}
                placeholder="0"
                onChange={(e) => setRefNo(e.target.value)}
                disabled={isEditDisabled}
              />
            </FormControl>
            {paymentMode === "check" && (
              <FormControl size="sm">
                <FormLabel>Check Date</FormLabel>
                <Input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  disabled={isEditDisabled || paymentMode !== "check"}
                />
              </FormControl>
            )}

            {/* <FormControl size="sm">
              <FormLabel>DR No. Filter</FormLabel>
              <div className="flex">
                <Autocomplete
                  options={cdrNumbers}
                  getOptionLabel={(option) => option}
                  value={selectedCDR}
                  onChange={handleDRFilter}
                  size="sm"
                  className="w-[100%]"
                  placeholder="Select DR"
                  disabled={isEditDisabled}
                />
              </div>
            </FormControl> */}
            <FormControl size="sm">
              <FormLabel>Less</FormLabel>
              <Input
                type="number"
                name="lessAmount"
                size="sm"
                placeholder="0"
                value={lessAmount}
                slotProps={{
                  input: {
                    min: 0,
                    step: 0.01,
                  },
                }}
                onChange={(e) => setLessAmount(String(e.target.value))}
                disabled={isEditDisabled}
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Add</FormLabel>
              <Input
                type="number"
                name="addAmount1"
                size="sm"
                placeholder="0"
                value={addAmount1}
                slotProps={{
                  input: {
                    min: 0,
                    step: 0.01,
                  },
                }}
                onChange={(e) => setAddAmount1(String(e.target.value))}
                disabled={isEditDisabled}
              />
            </FormControl>
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <Box className="summary-figures" sx={{ mb: 1 }}>
            <Typography level="body-sm">Payment Amount</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(paymentAmount)}
            </Typography>

            <Typography level="body-sm">Total Applied</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(totalApplied)}
            </Typography>
          </Box>
          <Divider />
          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 1 }}>
            <FormControl size="sm" sx={{ gridColumn: "1 / -1" }}>
              <FormLabel>Remarks</FormLabel>
              <Textarea
                minRows={2}
                placeholder="Remarks"
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                disabled={isEditDisabled}
              />
            </FormControl>
            {/* <FormControl size="sm">
              <FormLabel>Add 2</FormLabel>
              <Input
                type="number"
                name="addAmount2"
                size="sm"
                placeholder="0"
                value={addAmount2}
                slotProps={{
                  input: {
                    min: 0,
                  },
                }}
                onChange={(e) => setAddAmount2(String(e.target.value))}
                disabled={isEditDisabled}
                required
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Add 3</FormLabel>
              <Input
                type="number"
                name="addAmount3"
                size="sm"
                placeholder="0"
                value={addAmount3}
                slotProps={{
                  input: {
                    min: 0,
                  },
                }}
                onChange={(e) => setAddAmount3(String(e.target.value))}
                disabled={isEditDisabled}
                required
              />
            </FormControl> */}
          </Box>

          {selectedRow !== undefined && (
            <>
              <Divider />
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setShowAuditDetails((prev) => !prev)}
                startDecorator={
                  showAuditDetails ? (
                    <ExpandLessRoundedIcon />
                  ) : (
                    <ExpandMoreRoundedIcon />
                  )
                }
                sx={{ mt: 1, alignSelf: "flex-start", px: 0.5 }}
              >
                {showAuditDetails ? "Hide record details" : "Record details"}
              </Button>
              {showAuditDetails && (
                <Box
                  className="transaction-details__fields"
                  sx={{ mb: 2, mt: 1 }}
                >
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
              )}
            </>
          )}
        </div>
      </Card>
    </Box>
  );
};

export default ARFormDetails;
