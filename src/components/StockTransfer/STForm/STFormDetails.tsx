import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  Select,
  Option,
  Box,
  Typography,
} from "@mui/joy";
import type { STFormDetailsProps } from "../interface";
import { formatToDateTime } from "../../../helper";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";

const STFormDetails = ({
  openEdit,
  selectedRow,

  // Fields
  status,
  setStatus,
  transactionDate,
  setTransactionDate,
  remarks,
  setRemarks,
  rrTransfer,
  setRRTransfer,
  warehouses,
  selectedWarehouse,
  setSelectedWarehouse,
  receivingAreaWarehouse,
  receivingReports,
  selectedRR,
  setSelectedRR,
  suppliers,
  selectedSupplier,
  setSelectedSupplier,
  fetchWarehouseItems,
  setWarehouseItems,
}: STFormDetailsProps): JSX.Element => {
  const isEditDisabled =
    selectedRow !== undefined && selectedRow?.status !== "unposted";

  const handleRRTransferChange = (value: string | null): void => {
    if (value !== null) {
      if (value === "no") {
        setSelectedRR(null);
        setSelectedSupplier(null);
        fetchWarehouseItems(selectedWarehouse?.id ?? 1, null);
      } else {
        setWarehouseItems([]);
        if (receivingAreaWarehouse !== null) {
          setSelectedWarehouse(receivingAreaWarehouse);
        }
      }
      setRRTransfer(value);
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
                  STR No. {selectedRow?.id}
                </Typography>
              </div>
            )}
          </div>

          <Box className="transaction-details__fields" sx={{ mb: 1, mt: 1 }}>
            <FormControl size="sm">
              <FormLabel>RR Transfer</FormLabel>
              <Select
                onChange={(_, value) => handleRRTransferChange(value)}
                size="sm"
                value={rrTransfer}
                disabled={isEditDisabled}
              >
                <Option value="yes">Yes</Option>
                <Option value="no">No</Option>
              </Select>
            </FormControl>
            <FormControl size="sm">
              <FormLabel>Supplier</FormLabel>
              <div className="flex">
                <TooltipAutocomplete
                  options={suppliers.items}
                  getOptionLabel={(option) => option.name}
                  value={selectedSupplier}
                  onChange={(event, newValue) => {
                    setSelectedSupplier(newValue);
                    setWarehouseItems([]);
                    setSelectedRR(null);
                  }}
                  size="sm"
                  className="w-[100%]"
                  placeholder="Select Supplier"
                  disabled={isEditDisabled || rrTransfer === "no"}
                  required
                />
              </div>
            </FormControl>
            <FormControl size="sm" sx={{ mb: 1, width: "46.5%" }}>
              <FormLabel>RR Ref No.</FormLabel>
              <TooltipAutocomplete
                options={receivingReports.items}
                getOptionLabel={(option) => option.reference_number}
                value={selectedRR}
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setSelectedRR(newValue);
                    console.log("Called");
                    fetchWarehouseItems(1, newValue);
                  }
                }}
                size="sm"
                className="w-[100%]"
                placeholder="Select Receiving Report"
                disabled={
                  rrTransfer === "no" ||
                  selectedSupplier === null ||
                  selectedSupplier === undefined
                }
              />
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
            <FormControl size="sm" sx={{ mb: 1, width: "46.5%" }}>
              <FormLabel>From Warehouse</FormLabel>
              <TooltipAutocomplete
                options={warehouses.items}
                getOptionLabel={(option) => option.code}
                value={selectedWarehouse}
                onChange={(event, newValue) => {
                  setSelectedWarehouse(newValue);
                  if (newValue !== null && newValue !== undefined) {
                    fetchWarehouseItems(newValue.id, null);
                  }
                }}
                size="sm"
                className="w-[100%]"
                placeholder="Select Warehouse"
                disabled={isEditDisabled || rrTransfer === "yes"}
                required
              />
            </FormControl>
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
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
          <FormControl size="sm" sx={{ mb: 3 }}>
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

export default STFormDetails;
