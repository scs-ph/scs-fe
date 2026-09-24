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
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
} from "../../../helper";
import type { CPOFormProps } from "../interface";

const INITIAL_SELECTED_ITEMS = [{ id: null }];

const CPOFormDetails = ({
  openEdit,
  selectedRow,
  customers,
  setSelectedItems,

  // Fields
  selectedCustomer,
  setSelectedCustomer,
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
  // Summary Amounts
  netTotal,
  grossTotal,
}: CPOFormProps): JSX.Element => {
  const isEditDisabled =
    selectedRow !== undefined && selectedRow?.status !== "unposted";

  const handleDiscountChange = (
    type: "customer" | "transaction",
    index: number,
    value: string,
  ): void => {
    const newDiscounts = { ...discounts };
    newDiscounts[type][index] = value;
    setDiscounts(newDiscounts);
  };

  return (
    <Box className="transaction-details">
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  CPO No. {selectedRow?.id}
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
                    // @ts-expect-error (Used null instead of undefined.)
                    setSelectedItems(INITIAL_SELECTED_ITEMS);
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
              <FormLabel>Ref No.</FormLabel>
              <Input
                size="sm"
                placeholder="Ref No."
                onChange={(e) => setReferenceNumber(e.target.value)}
                value={referenceNumber}
                disabled={isEditDisabled}
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Cust Disc. 1 (%)</FormLabel>
              <Input
                value={discounts.customer[0]}
                onChange={(e) =>
                  handleDiscountChange("customer", 0, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Trans Disc. 1 (%)</FormLabel>
              <Input
                value={discounts.transaction[0]}
                onChange={(e) =>
                  handleDiscountChange("transaction", 0, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Cust Disc. 2 (%)</FormLabel>
              <Input
                value={discounts.customer[1]}
                onChange={(e) =>
                  handleDiscountChange("customer", 1, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Trans Disc. 2 (%)</FormLabel>
              <Input
                value={discounts.transaction[1]}
                onChange={(e) =>
                  handleDiscountChange("transaction", 1, e.target.value)
                }
                placeholder="0"
                disabled={isEditDisabled}
              />
            </FormControl>
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <Box className="summary-figures" sx={{ mb: 1 }}>
            <Typography level="body-sm">Gross Total</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(grossTotal)}
            </Typography>

            <Typography level="body-sm">NET Amount</Typography>
            <Typography level="title-sm">
              {addCommaToNumberWithTwoPlaces(netTotal)}
            </Typography>
          </Box>
          <Divider />
          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 3.5 }}>
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
          <FormControl size="sm" sx={{ mb: 3, mt: 3 }}>
            <FormLabel>Remarks</FormLabel>
            <Textarea
              minRows={1}
              placeholder="Remarks"
              onChange={(e) => setRemarks(e.target.value)}
              value={remarks}
              disabled={isEditDisabled}
            />
          </FormControl>
        </div>
      </Card>
    </Box>
  );
};

export default CPOFormDetails;
