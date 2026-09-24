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
import { toast } from "react-toastify";
import type {
  PaginatedStockAdjustments,
  PaginationQueryParams,
  ViewStockAdjustmentProps,
  StockAdjustmentResponse,
} from "../../interface";

import { convertToQueryParams, formatToDate } from "../../helper";
import { withTooltip } from "../shared/withTooltip";
import { AdjustmentTypeChip } from "../../utils/statusUtils";
import DateRangeFilter, {
  getDefaultDateFrom,
  getDefaultDateTo,
} from "../shared/DateRangeFilter";
import {
  TableLoadingRows,
  TableEmptyRow,
  TableErrorRow,
} from "../shared/ContentStates";

const ViewStockAdjustment = ({
  setOpenCreate,
}: ViewStockAdjustmentProps): JSX.Element => {
  const [adjustments, setAdjustments] = useState<PaginatedStockAdjustments>({
    total: 0,
    page: 1,
    limit: 50,
    total_pages: 1,
    items: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("all");
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
  const getAllAdjustments = (): void => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset state for new search
    setPage(1);
    setAdjustments({
      total: 0,
      page: 1,
      limit: 50,
      total_pages: 1,
      items: [],
    });
    setHasMore(true);
    setLoadError(null);
    setIsLoading(true);
    isLoadingRef.current = false;

    const payload: PaginationQueryParams = {
      page: 1,
      limit,
      sort_by: "date_created",
      sort_order: "desc",
      date_from: dateFrom,
      date_to: dateTo,
    };

    if (searchTerm !== "") {
      payload.search_term = searchTerm;
    }

    if (adjustmentType !== "all") {
      payload.adjustment_type = adjustmentType;
    }

    axiosInstance
      .get<PaginatedStockAdjustments>(
        `/api/stock-adjustments/?${convertToQueryParams(payload)}`,
      )
      .then((response) => {
        setAdjustments(response.data);
        setHasMore(response.data.items.length < response.data.total);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
        setLoadError(
          "Could not load stock adjustments. Check your connection and try again.",
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
      sort_by: "date_created",
      sort_order: "desc",
      date_from: dateFrom,
      date_to: dateTo,
    };

    if (searchTerm !== "") {
      payload.search_term = searchTerm;
    }

    if (adjustmentType !== "all") {
      payload.adjustment_type = adjustmentType;
    }

    axiosInstance
      .get<PaginatedStockAdjustments>(
        `/api/stock-adjustments/?${convertToQueryParams(payload)}`,
      )
      .then((response) => {
        const newItems = response.data.items;
        setAdjustments((prev) => {
          const updated = {
            ...response.data,
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
    adjustmentType,
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
      getAllAdjustments();
    }, 300); // wait 300 ms after the last key-press

    return () => clearTimeout(timeout); // cancel if any dep changes
  }, [searchTerm, adjustmentType, dateFrom, dateTo]);

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
            Stock Adjustment
          </Typography>
          <Button
            className="bg-button-primary"
            color="primary"
            startDecorator={<AddRoundedIcon />}
            onClick={() => {
              setOpenCreate(true);
            }}
          >
            Add Adjustment
          </Button>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 3,
            flexWrap: "wrap",
            alignItems: "flex-end",
            p: 1.5,
            borderRadius: "sm",
            backgroundColor: "background.level1",
          }}
        >
          <FormControl sx={{ flexGrow: 1, minWidth: 200 }}>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>Search</FormLabel>
            <Input
              size="sm"
              placeholder="Search by stock code, stock name, or warehouse..."
              startDecorator={<SearchRoundedIcon fontSize="small" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>
              Adjustment Type
            </FormLabel>
            <Select
              size="sm"
              value={adjustmentType}
              onChange={(_, value) => setAdjustmentType(value ?? "all")}
            >
              <Option value="all">All Types</Option>
              <Option value="surplus">Surplus</Option>
              <Option value="deficit">Deficit</Option>
            </Select>
          </FormControl>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        </Box>

        {/* Table */}
        <Sheet
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: "sm",
            overflow: "auto",
            maxHeight: "calc(100dvh - 280px)",
          }}
          ref={scrollContainerRef}
        >
          <Table
            aria-label="stock adjustments table"
            stickyHeader
            hoverRow
            sx={{
              "--Table-headerUnderlineThickness": "1px",
              "--TableRow-hoverBackground":
                "var(--joy-palette-background-level1)",
              "--TableCell-paddingY": "4px",
              "--TableCell-paddingX": "8px",
              "& thead th": {
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: "background.level1",
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 45, padding: "12px 6px" }}>ID</th>
                <th style={{ width: 90, padding: "12px 6px" }}>Date</th>
                <th style={{ width: 130, padding: "12px 6px" }}>Stock Code</th>
                <th style={{ width: 180, padding: "12px 6px" }}>Stock Name</th>
                <th
                  style={{
                    width: 80,
                    padding: "12px 6px",
                    textAlign: "center",
                  }}
                >
                  Type
                </th>
                <th
                  style={{ width: 50, padding: "12px 6px", textAlign: "right" }}
                >
                  Qty
                </th>
                <th
                  style={{ width: 55, padding: "12px 6px", textAlign: "right" }}
                >
                  Prev
                </th>
                <th
                  style={{ width: 55, padding: "12px 6px", textAlign: "right" }}
                >
                  New
                </th>
                <th style={{ width: 130, padding: "12px 6px" }}>Warehouse</th>
                <th style={{ width: 120, padding: "12px 6px" }}>Created By</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableLoadingRows
                columns={10}
                numericColumns={[5, 6, 7]}
                statusColumns={[4]}
              />
            ) : (
              <tbody>
                {loadError !== null && adjustments.items.length === 0 && (
                  <TableErrorRow
                    colSpan={10}
                    message={loadError}
                    onRetry={getAllAdjustments}
                  />
                )}
                {adjustments.items.length === 0 && loadError === null && (
                  <TableEmptyRow
                    colSpan={10}
                    title="No stock adjustments found"
                    description={
                      searchTerm !== "" || adjustmentType !== "all"
                        ? "Try adjusting your search or filters."
                        : "Get started by adding your first stock adjustment."
                    }
                  />
                )}
                {adjustments.items.map(
                  (adjustment: StockAdjustmentResponse) => (
                    <tr key={adjustment.id}>
                      <td>{adjustment.id}</td>
                      <td>{formatToDate(adjustment.date_created)}</td>
                      <td>{withTooltip(adjustment.stock_code, 120)}</td>
                      <td>{withTooltip(adjustment.item_name, 200)}</td>

                      <td style={{ textAlign: "center" }}>
                        <AdjustmentTypeChip
                          adjustmentType={adjustment.adjustment_type}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          style={{
                            color:
                              adjustment.adjustment_type === "surplus"
                                ? "green"
                                : "red",
                          }}
                        >
                          {adjustment.adjustment_type === "surplus" ? "+" : "-"}
                          {adjustment.adjustment_amount.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {adjustment.previous_on_stock.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {adjustment.new_on_stock.toLocaleString()}
                      </td>
                      <td>{withTooltip(adjustment.warehouse_name, 150)}</td>
                      <td>{adjustment.created_by_name}</td>
                    </tr>
                  ),
                )}
              </tbody>
            )}
          </Table>
        </Sheet>

        {/* Infinite scroll status */}
        <Box
          sx={{
            display: adjustments.items.length > 0 ? "block" : "none",
            mt: 2,
            textAlign: "center",
          }}
        >
          {isLoadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm">Loading more...</Typography>
            </Box>
          )}
          {!isLoading && !isLoadingMore && (
            <Typography level="body-sm">
              {hasMore
                ? `Showing ${adjustments.items.length} of ${adjustments.total} items • Scroll for more`
                : `Showing all ${adjustments.total} items`}
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ViewStockAdjustment;
