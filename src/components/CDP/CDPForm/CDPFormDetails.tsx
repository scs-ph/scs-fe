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
import type { CDPFormDetailsProps, UnplannedAlloc } from "../interface";
import TooltipAutocomplete from "../../shared/TooltipAutocomplete";
import TooltipInput from "../../shared/TooltipInput";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import {
  formatToDateTime,
  addCommaToNumberWithTwoPlaces,
} from "../../../helper";
import SelectAllocModal from "./SelectAllocModal";

const CDPFormDetails = ({
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
}: CDPFormDetailsProps): JSX.Element => {
  const [isLoadingUnserved, setIsLoadingUnserved] = useState(false);
  const [unservedAllocs, setUnservedAllocs] = useState<UnplannedAlloc[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

  useEffect(() => {
    if (selectedCustomer !== null && selectedCustomer !== undefined) {
      setIsLoadingUnserved(true);
      axiosInstance
        .get<UnplannedAlloc[]>(
          `/api/allocations/unplanned/${selectedCustomer.customer_id}`,
        )
        .then((response) => {
          setUnservedAllocs(
            response.data
              .filter((alloc) => alloc.status === "posted")
              .sort((a, b) => b.id - a.id),
          );
          setIsLoadingUnserved(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoadingUnserved(false);
        });
    }
  }, [selectedCustomer]);

  return (
    <Box className="transaction-details">
      <SelectAllocModal
        open={isSelectModalOpen}
        setOpen={setIsSelectModalOpen}
        unservedAllocs={unservedAllocs}
        setFormattedAllocs={setFormattedAllocs}
        isLoadingUnserved={isLoadingUnserved}
      />
      <Card variant="soft" color="neutral">
        <div>
          <div className="flex justify-between items-center mb-2">
            {openEdit && (
              <div>
                <Typography level="title-lg">
                  CDP No. {selectedRow?.id}
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
              <FormLabel>Ref No.</FormLabel>
              <TooltipInput
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
                disabled={selectedCustomer === null}
              >
                Fill Table
              </Button>
            )}
          </Box>
        </div>
      </Card>
      <Card variant="soft" color="neutral">
        <div>
          <Box className="summary-figures" sx={{ mb: 1 }}>
            <Typography level="body-sm">Total Items</Typography>
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

export default CDPFormDetails;
