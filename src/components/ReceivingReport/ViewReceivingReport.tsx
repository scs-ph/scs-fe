import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Table,
  Sheet,
  Input,
  Select,
  Option,
  FormControl,
  FormLabel,
  CircularProgress,
  Typography,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import axiosInstance from "../../utils/axiosConfig";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";
import ArchiveConfirmModal from "../shared/ArchiveConfirmModal";
import { toast } from "react-toastify";
import type {
  PaginatedRR,
  PaginationQueryParams,
  ViewReceivingReportProps,
} from "../../interface";

import {
  convertToQueryParams,
  addCommaToNumberWithTwoPlaces,
  addCommaToNumberWithFourPlaces,
  formatToDate,
  getErrorMessage,
} from "../../helper";
import { StatusChip } from "../../utils/statusUtils";
import { withTooltip } from "../shared/withTooltip";
import DateRangeFilter, {
  getDefaultDateFrom,
  getDefaultDateTo,
} from "../shared/DateRangeFilter";
import {
  TableLoadingRows,
  TableEmptyRow,
  TableErrorRow,
} from "../shared/ContentStates";

const ViewReceivingReport = ({
  setOpenCreate,
  setOpenEdit,
  selectedRow,
  setSelectedRow,
}: ViewReceivingReportProps): JSX.Element => {
  const [receivingReports, setReceivingReports] = useState<PaginatedRR>({
    total: 0,
    items: [],
  });
  const [openDelete, setOpenDelete] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState(getDefaultDateTo());

  // Infinite scroll states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  // Refs for infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load function - resets everything and loads first page
  const getAllRR = (): void => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset state for new search
    setPage(1);
    setReceivingReports({ total: 0, items: [] });
    setHasMore(true);
    setLoadError(null);
    setIsLoading(true);
    isLoadingRef.current = false;

    const payload: PaginationQueryParams = {
      page: 1,
      limit,
      sort_by: "transaction_date",
      sort_order: "desc",
      search_term: searchTerm,
      date_from: dateFrom,
      date_to: dateTo,
    };

    if (status !== "all") {
      payload.status = status;
    }

    axiosInstance
      .get<PaginatedRR>(
        `/api/receiving-reports/?${convertToQueryParams(payload)}`,
      )
      .then((response) => {
        setReceivingReports(response.data);
        setHasMore(response.data.items.length < response.data.total);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
        setLoadError(
          "Could not load receiving reports. Check your connection and try again.",
        );
      });
  };

  // Load more data for infinite scroll
  const loadMore = useCallback(() => {
    // Prevent duplicate requests using ref (synchronous check)
    if (isLoadingRef.current || isLoadingMore || !hasMore) {
      return;
    }

    // Mark as loading immediately (synchronous)
    isLoadingRef.current = true;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    const payload: PaginationQueryParams = {
      page: nextPage,
      limit,
      sort_by: "transaction_date",
      sort_order: "desc",
      search_term: searchTerm,
      date_from: dateFrom,
      date_to: dateTo,
    };

    if (status !== "all") {
      payload.status = status;
    }

    axiosInstance
      .get<PaginatedRR>(
        `/api/receiving-reports/?${convertToQueryParams(payload)}`,
      )
      .then((response) => {
        const newItems = response.data.items;
        setReceivingReports((prev) => {
          const updated = {
            total: response.data.total,
            items: [...prev.items, ...newItems],
          };
          setHasMore(updated.items.length < response.data.total);
          return updated;
        });
        setPage(nextPage);
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoadingMore(false);
        isLoadingRef.current = false;
        toast.error("Failed to load more. Please try scrolling again.");
      });
  }, [
    isLoadingMore,
    hasMore,
    page,
    searchTerm,
    status,
    dateFrom,
    dateTo,
    limit,
  ]);

  // Handle scroll event for infinite scroll with debouncing
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container === null) return;

    // Clear any existing timeout
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll events by 100ms
    scrollTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Trigger load more when scrolled to within 200px of bottom
      if (distanceFromBottom < 200 && hasMore && !isLoadingRef.current) {
        loadMore();
      }
    }, 100);
  }, [loadMore, hasMore]);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container === null) return;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      // Clear timeout on cleanup
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getAllRR();
    }, 300); // wait 300 ms after the last key-press

    return () => clearTimeout(timeout); // 💨 cancel if any dep changes
  }, [searchTerm, status, dateFrom, dateTo]);

  const handleDeleteRR = async (): Promise<void> => {
    if (selectedRow !== undefined) {
      const url = `/api/receiving-reports/${selectedRow.id}`;
      try {
        await axiosInstance.delete(url);
        toast.success("Delete successful!");
        setReceivingReports((prevRR) => ({
          ...prevRR,
          items: prevRR.items.filter((RR) => RR.id !== selectedRow.id),
          total: prevRR.total - 1,
        }));
      } catch (error: any) {
        toast.error(
          `Error message: ${getErrorMessage(error, "Delete unsuccessful")}`,
        );
      }
    }
  };

  const handleArchiveRR = async (): Promise<void> => {
    if (selectedRow !== undefined) {
      const url = `/api/receiving-reports/${selectedRow.id}`;
      try {
        const response = await axiosInstance.delete(url);
        toast.success("Receiving Report hidden successfully!");
        setReceivingReports((prevRR) => ({
          ...prevRR,
          items: prevRR.items.map((RR) =>
            RR.id === selectedRow.id ? { ...RR, ...response.data } : RR,
          ),
          total: prevRR.total,
        }));
      } catch (error: any) {
        toast.error(
          `Error message: ${getErrorMessage(error, "Hide unsuccessful")}`,
        );
      }
    }
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            mb: 3,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Typography level="h2" component="h1">
            Receiving Report
          </Typography>
          <Button
            className="bg-button-primary"
            color="primary"
            startDecorator={<AddRoundedIcon />}
            onClick={() => {
              setOpenCreate(true);
            }}
          >
            Add Receiving Report
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 1.5,
            mb: 3,
            p: 1.5,
            borderRadius: "sm",
            backgroundColor: "background.level1",
          }}
        >
          <FormControl>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>Search</FormLabel>
            <Input
              size="sm"
              sx={{ width: 300 }}
              placeholder="Ref No. or Supplier"
              startDecorator={<SearchRoundedIcon fontSize="small" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>Status</FormLabel>
            <Select
              sx={{ width: 130 }}
              onChange={(event, value) => {
                if (value !== null) setStatus(value);
              }}
              size="sm"
              value={status}
            >
              <Option value="all">Active</Option>
              <Option value="unposted">Unposted</Option>
              <Option value="posted">Posted</Option>
              <Option value="archived">Posted (Hidden)</Option>
            </Select>
          </FormControl>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
          {/* <Button
            onClick={getAllRR}
            sx={{
              ml: 2,
              width: "80px",
            }}
            className="bg-button-primary"
            size="sm"
          >
            Search
          </Button> */}
        </Box>

        <Sheet
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            "--TableCell-height": "40px",
            // the number is the amount of the header rows.
            "--TableHeader-height": "calc(1 * var(--TableCell-height))",
            "--Table-firstColumnWidth": "100px",
            "--Table-lastColumnWidth": "160px",
            "--TableRow-hoverBackground": "rgba(0 0 0 / 0.04)",
            overflow: "auto",
            borderRadius: "sm",
            background: (
              theme,
            ) => `linear-gradient(to right, ${theme.vars.palette.background.surface} 30%, rgba(255, 255, 255, 0)),
            linear-gradient(to right, rgba(255, 255, 255, 0), ${theme.vars.palette.background.surface} 70%) 0 100%,
            radial-gradient(
              farthest-side at 0 50%,
              rgba(0, 0, 0, 0.12),
              rgba(0, 0, 0, 0)
            ),
            radial-gradient(
                farthest-side at 100% 50%,
                rgba(0, 0, 0, 0.12),
                rgba(0, 0, 0, 0)
              )
              0 100%`,
            backgroundSize:
              "40px calc(100% - var(--TableCell-height)), 40px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height))",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "local, local, scroll, scroll",
            backgroundPosition:
              "var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height), var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height)",
            backgroundColor: "background.surface",
            maxHeight: "calc(100dvh - 280px)",
          }}
        >
          <Table
            className="h-5"
            size="sm"
            stickyHeader
            hoverRow
            sx={{
              fontSize: "13px",
              "& tbody tr > *:first-child": {
                position: "sticky",
                left: 0,
                boxShadow: "1px 0 var(--TableCell-borderColor)",
                bgcolor: "background.surface",
                zIndex: 10,
              },
              "& tbody tr > *:last-child": {
                position: "sticky",
                right: 0,
                bgcolor: "background.surface",
                zIndex: 10,
              },
              "& thead tr > *:first-child": {
                position: "sticky",
                left: 0,
                top: 0,
                boxShadow: "1px 0 var(--TableCell-borderColor)",
                bgcolor: "background.level1",
                zIndex: 11,
              },
              "& thead tr > *:last-child": {
                position: "sticky",
                right: 0,
                top: 0,
                bgcolor: "background.level1",
                zIndex: 11,
              },
              "& thead th": {
                backgroundColor: "background.level1",
              },
              "& tbody tr:hover": {
                cursor: "pointer",
              },
            }}
            borderAxis="both"
          >
            <thead>
              <tr>
                <th style={{ width: "var(--Table-firstColumnWidth)" }}>
                  RR No.
                </th>
                <th style={{ width: 120 }}>Tx. Date</th>
                <th style={{ width: 320 }}>Supplier</th>
                <th style={{ width: 180 }}>Ref No.</th>
                <th style={{ width: 150, textAlign: "center" }}>Status</th>
                <th style={{ width: 130, textAlign: "right" }}>Net Amount</th>
                <th style={{ width: 130, textAlign: "right" }}>FOB Total</th>
                <th style={{ width: 130, textAlign: "right" }}>
                  Landed Total (₱)
                </th>
                <th style={{ width: 100 }}>Currency</th>
                <th style={{ width: 70, textAlign: "right" }}>Rate</th>
                <th style={{ width: 200 }}>Remarks</th>
                <th style={{ width: 150 }}>Created By</th>
                <th style={{ width: 150 }}>Modified By</th>
                <th style={{ width: 120 }}>Date Created</th>
                <th style={{ width: 120 }}>Date Modified</th>
                <th
                  aria-label="actions"
                  style={{ width: "var(--Table-lastColumnWidth)" }}
                />
              </tr>
            </thead>
            {isLoading ? (
              <TableLoadingRows
                columns={16}
                numericColumns={[5, 6, 7, 9]}
                statusColumns={[4]}
                actionColumn={15}
                actionCount={2}
              />
            ) : (
              <tbody>
                {loadError !== null && receivingReports.items.length === 0 && (
                  <TableErrorRow
                    colSpan={16}
                    message={loadError}
                    onRetry={getAllRR}
                  />
                )}
                {receivingReports.items.length === 0 && loadError === null && (
                  <TableEmptyRow
                    colSpan={16}
                    title="No receiving reports found"
                    description={
                      searchTerm !== "" || status !== "all"
                        ? "Try adjusting your search or filters."
                        : "Get started by adding your first receiving report."
                    }
                  />
                )}
                {receivingReports.items.map((receivingReport) => (
                  <tr
                    key={receivingReport.id}
                    onDoubleClick={() => {
                      setOpenEdit(true);
                      setSelectedRow(receivingReport);
                    }}
                  >
                    <td>{receivingReport.id}</td>
                    <td>{receivingReport.transaction_date}</td>
                    <td>
                      {withTooltip(receivingReport.supplier.name, "280px")}
                    </td>
                    <td>
                      {withTooltip(receivingReport.reference_number, "160px")}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <StatusChip status={receivingReport.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(
                        receivingReport.net_amount,
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(receivingReport.fob_total)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithFourPlaces(
                        receivingReport.landed_total,
                      )}
                    </td>
                    <td>{receivingReport.currency}</td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(receivingReport.rate)}
                    </td>
                    <td>{withTooltip(receivingReport.remarks, "180px")}</td>
                    <td>
                      {withTooltip(receivingReport?.creator?.username, "130px")}
                    </td>
                    <td>
                      {withTooltip(
                        receivingReport?.modifier?.username,
                        "130px",
                      )}
                    </td>
                    <td>{formatToDate(receivingReport.date_created)}</td>
                    <td>{formatToDate(receivingReport.date_modified)}</td>
                    <td>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          sx={{ minWidth: 70, fontSize: "13px" }}
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => {
                            setOpenEdit(true);
                            setSelectedRow(receivingReport);
                          }}
                        >
                          {receivingReport.status !== "unposted"
                            ? "View"
                            : "Edit"}
                        </Button>
                        {(receivingReport.status === "posted" ||
                          receivingReport.status === "archived") && (
                          <Button
                            sx={{ fontSize: "13px" }}
                            size="sm"
                            variant="soft"
                            color="warning"
                            onClick={() => {
                              setOpenArchive(true);
                              setSelectedRow(receivingReport);
                            }}
                            disabled={receivingReport.status === "archived"}
                          >
                            Hide
                          </Button>
                        )}

                        {receivingReport.status === "unposted" && (
                          <Button
                            sx={{ fontSize: "13px" }}
                            size="sm"
                            variant="soft"
                            color="danger"
                            className="bg-delete-red"
                            onClick={() => {
                              setOpenDelete(true);
                              setSelectedRow(receivingReport);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </Table>
        </Sheet>
      </Box>

      {/* Infinite Scroll Status */}
      {receivingReports.items.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
            px: 1,
            gap: 2,
          }}
        >
          {isLoadingMore ? (
            <>
              <CircularProgress size="sm" />
              <Typography level="body-sm">Loading more...</Typography>
            </>
          ) : hasMore ? (
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Showing {receivingReports.items.length} of{" "}
              {receivingReports.total} items • Scroll for more
            </Typography>
          ) : (
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Showing all {receivingReports.total} items
            </Typography>
          )}
        </Box>
      )}

      <DeleteConfirmModal
        open={openDelete}
        setOpen={setOpenDelete}
        title="Delete Receiving Report"
        entityLabel="Receiving Report"
        onDelete={handleDeleteRR}
      />

      <ArchiveConfirmModal
        open={openArchive}
        setOpen={setOpenArchive}
        transactionType="Receiving Report"
        onArchive={handleArchiveRR}
      />
    </>
  );
};

export default ViewReceivingReport;
