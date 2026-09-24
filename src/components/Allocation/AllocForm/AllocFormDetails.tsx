import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  Select,
  Option,
  Box,
  Autocomplete,
  Typography,
} from "@mui/joy";
import type { AllocFormDetailsProps } from "../interface";
import { formatToDateTime } from "../../../helper";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";

const AllocFormDetails = ({
  openEdit,
  selectedRow,
  // Fields
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  remarks,
  setRemarks,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  getCPOsByCustomer,
  setCPOItems,
  cpoNumbers,
  selectedCPO,
  setSelectedCPO,
  CPOItems,
}: AllocFormDetailsProps): JSX.Element => {
  const isEditDisabled =
    selectedRow !== undefined && selectedRow?.status !== "unposted";

  return (
    <Box className="transaction-details">
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  Alloc No. {selectedRow?.id}
                </Typography>
              </div>
            )}
          </div>

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
                    setSelectedCPO(null);

                    if (newValue !== undefined && newValue !== null) {
                      getCPOsByCustomer(newValue?.customer_id);
                    } else {
                      setCPOItems([]);
                    }
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
              <FormLabel>CPO No. Filter</FormLabel>
              <div className="flex">
                <Autocomplete
                  options={cpoNumbers}
                  getOptionLabel={(option) => String(option)}
                  value={selectedCPO}
                  onChange={(event, newValue) => {
                    setSelectedCPO(newValue);

                    // SIDE LOGIC: For edit, if its empty, need to fetch all CPO again (cause only posted items are displayed)
                    if (
                      selectedCustomer !== null &&
                      CPOItems.filter((item) => item.id === newValue).length ===
                        0
                    ) {
                      getCPOsByCustomer(selectedCustomer.customer_id, false);
                    }
                  }}
                  size="sm"
                  className="w-[100%]"
                  placeholder="Select CPO"
                  disabled={isEditDisabled}
                />
              </div>
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
          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 1.7 }}>
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

export default AllocFormDetails;
