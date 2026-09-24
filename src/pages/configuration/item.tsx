import { useEffect, useState, useRef, useCallback } from "react";
import ItemsModal from "../../components/Items/ItemsModal";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Input,
  Autocomplete,
  FormControl,
  FormLabel,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/joy";
import DeleteConfirmModal from "../../components/shared/DeleteConfirmModal";
import CurrencyModal from "../../components/Items/CurrencyModal";
import PrintStocksModal from "../../components/Items/PrintStocksModal";
import PrintTotalCostDetailModal from "../../components/Items/PrintTotalCostDetailModal";
import { generateTotalCostPDF } from "../../components/Items/generateTotalCostPDF";
import axiosInstance, { getCompanyId } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type {
  Brand,
  Category,
  Item,
  PaginatedItems,
  Currency,
  PaginatedWarehouse,
} from "../../interface";
import {
  convertToQueryParams,
  addCommaToNumberWithTwoPlaces,
} from "../../helper";
import TooltipTableCell from "../../components/shared/TooltipTableCell";
import {
  TableLoadingRows,
  TableEmptyRow,
  TableErrorRow,
} from "../../components/shared/ContentStates";

const ItemForm = (): JSX.Element => {
  const [items, setItems] = useState<PaginatedItems>({
    total: 0,
    items: [],
  });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCurrencyModal, setOpenCurrencyModal] = useState(false);
  const [openPrintStocksModal, setOpenPrintStocksModal] = useState(false);
  const [openPrintTotalCostModal, setOpenPrintTotalCostModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Item>();

  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<PaginatedWarehouse>({
    total: 0,
    items: [],
  });
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");

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
  const getAllStocks = (searchTerm: string): void => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset state for new search
    setPage(1);
    setItems({ total: 0, items: [] });
    setHasMore(true);
    setLoadError(null);
    setIsLoading(true);
    isLoadingRef.current = false;

    axiosInstance
      .get<PaginatedItems>(
        `/api/items/?${convertToQueryParams({
          page: 1,
          limit,
          sort_by: "stock_code",
          sort_order: "asc",
          search_term: searchTerm,
          brand: selectedBrand,
          category: selectedCategory,
          status: selectedStatus,
        })}`,
      )
      .then((response) => {
        setItems(response.data);
        setHasMore(response.data.items.length < response.data.total);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
        setLoadError(
          "Could not load items. Check your connection and try again.",
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

    axiosInstance
      .get<PaginatedItems>(
        `/api/items/?${convertToQueryParams({
          page: nextPage,
          limit,
          sort_by: "stock_code",
          sort_order: "asc",
          search_term: searchTerm,
          brand: selectedBrand,
          category: selectedCategory,
          status: selectedStatus,
        })}`,
      )
      .then((response) => {
        const newItems = response.data.items;
        setItems((prev) => {
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
    selectedBrand,
    selectedCategory,
    selectedStatus,
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
      getAllStocks(searchTerm);
    }, 300); // wait 300 ms after the last key-press

    return () => clearTimeout(timeout); // 💨 cancel if any dep changes
  }, [searchTerm, selectedBrand, selectedCategory, selectedStatus]);

  useEffect(() => {
    // Fetch items
    // getAllStocks(page, searchTerm);

    // Fetch categories
    axiosInstance
      .get<Category[]>(`/api/categories`)
      .then((response) => {
        setCategories(
          response.data.map((category) => category.normalized_name),
        );
      })
      .catch((error) => console.error("Error:", error));

    // Fetch brands
    axiosInstance
      .get<Brand[]>(`/api/brands`)
      .then((response) => {
        setBrands(response.data.map((brand) => brand.normalized_name));
      })
      .catch((error) => console.error("Error:", error));

    // Fetch warehouses
    axiosInstance
      .get<PaginatedWarehouse>("/api/warehouses/")
      .then((response) => {
        setWarehouses(response.data);
      })
      .catch((error) => console.error("Error:", error));

    // Fetch currencies
    axiosInstance
      .get<Currency[]>(`/api/currencies`)
      .then((response) => {
        setCurrencies(response.data);
      })
      .catch((error) => console.error("Error fetching currencies:", error));
  }, []);

  const handleSaveItem = async (newItem: Item): Promise<void> => {
    const url = `/api/items/${newItem.id}`;

    const payload = {
      stock_code: newItem.stock_code,
      name: newItem.name,
      status: newItem.status,
      category: newItem.category,
      brand: newItem.brand,
      acquisition_cost: newItem.acquisition_cost,
      net_cost_before_tax: newItem.net_cost_before_tax,
      currency_id: newItem.currency_id,
      rate: newItem.rate,
      last_sale_price: newItem.last_sale_price,
      srp: newItem.srp,
    };

    const response = await axiosInstance.put(url, payload);
    setItems((prevItems) => ({
      ...prevItems,
      items: prevItems.items.map((item) =>
        item.id === response.data.id ? response.data : item,
      ),
    }));

    toast.success("Save successful!");
  };

  const handleCreateItem = async (newItem: Item): Promise<void> => {
    const payload = {
      stock_code: newItem.stock_code,
      name: newItem.name,
      status: newItem.status,
      category: newItem.category,
      brand: newItem.brand,
      acquisition_cost: newItem.acquisition_cost,
      net_cost_before_tax: newItem.net_cost_before_tax,
      currency_id: newItem.currency_id,
      rate: newItem.rate,
      last_sale_price: newItem.last_sale_price,
      srp: newItem.srp,
    };
    const response = await axiosInstance.post("/api/items/", payload);

    setItems((prevItems) => ({
      ...prevItems,
      items: [response.data, ...prevItems.items],
      total: prevItems.total + 1,
    }));

    toast.success("Save successful!");
  };

  const handleDeleteItem = async (): Promise<void> => {
    if (selectedRow !== undefined) {
      const url = `/api/items/${selectedRow.id}`;
      try {
        await axiosInstance.delete(url);
        toast.success("Delete successful!");
        setItems((prevItems) => ({
          ...prevItems,
          items: prevItems.items.filter((item) => item.id !== selectedRow.id),
          total: prevItems.total - 1,
        }));
      } catch (error) {
        console.error("Error:", error);
        if (isAxiosError(error)) {
          if (
            error.response?.status === 400 &&
            (error.response.data as any)?.detail ===
              "Cannot delete item with associated purchase orders."
          ) {
            toast.error("Cannot delete item with associated purchase orders.");
          } else {
            toast.error("An error occurred while deleting the item.");
          }
        } else {
          toast.error("An error occurred while deleting the item.");
        }
      }
    }
  };

  function isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError !== undefined;
  }

  const handlePrintTotalCost = async (): Promise<void> => {
    try {
      // Fetch all items to calculate totals
      const response = await axiosInstance.get<PaginatedItems>("/api/items/");

      const allItems = response.data.items;

      // Calculate totals for items with and without net cost
      // Items WITH net cost: must have cost > 0 AND stock > 0
      const withNetCost = allItems.filter(
        (item) =>
          Number(item.net_cost_before_tax ?? 0) > 0 &&
          (item.total_on_stock ?? 0) > 0,
      );
      // Items WITHOUT net cost: either no cost OR no stock
      const withoutNetCost = allItems.filter(
        (item) =>
          Number(item.net_cost_before_tax ?? 0) <= 0 ||
          (item.total_on_stock ?? 0) <= 0,
      );

      const withNetCostTotal = withNetCost.reduce((sum, item) => {
        const totalOnStock = item.total_on_stock ?? 0;
        const netCost = Number(item.net_cost_before_tax ?? 0);
        return sum + totalOnStock * netCost;
      }, 0);

      const withoutNetCostTotal = withoutNetCost.reduce((sum, item) => {
        const totalOnStock = item.total_on_stock ?? 0;
        const netCost = Number(item.net_cost_before_tax ?? 0);
        return sum + totalOnStock * netCost;
      }, 0);

      const totalCostData = {
        withNetCost: {
          totalCost: withNetCostTotal,
          productCount: withNetCost.length,
        },
        withoutNetCost: {
          totalCost: withoutNetCostTotal,
          productCount: withoutNetCost.length,
        },
      };

      // Get company ID
      const companyId = getCompanyId();

      generateTotalCostPDF(totalCostData, companyId);
    } catch (error) {
      console.error("Error generating Total Cost PDF:", error);
      toast.error("Failed to generate Total Cost PDF");
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
            Stocks
          </Typography>

          <div className="flex items-center gap-3">
            {/* Print Reports Dropdown */}
            <Dropdown>
              <MenuButton
                variant="soft"
                sx={{
                  width: "140px",
                  height: "36px",
                }}
                className="bg-button-soft-primary"
              >
                Print Reports
              </MenuButton>
              <Menu>
                <MenuItem
                  onClick={() => setOpenPrintStocksModal(true)}
                  sx={{ fontSize: "14px" }}
                >
                  Print Stocks
                </MenuItem>
                <MenuItem
                  onClick={() => setOpenPrintTotalCostModal(true)}
                  sx={{ fontSize: "14px" }}
                >
                  Print Total Cost Detail
                </MenuItem>
                <MenuItem
                  onClick={handlePrintTotalCost}
                  sx={{ fontSize: "14px" }}
                >
                  Print Total Cost
                </MenuItem>
              </Menu>
            </Dropdown>

            {/* Manage Currencies Button */}
            <Button
              sx={{ width: "140px", height: "36px" }}
              variant="outlined"
              color="primary"
              onClick={() => setOpenCurrencyModal(true)}
            >
              Currencies
            </Button>

            {/* Add Stock Button */}
            <Button
              sx={{ height: "36px" }}
              className="bg-button-primary"
              color="primary"
              startDecorator={<AddRoundedIcon />}
              onClick={() => {
                setOpenAdd(true);
              }}
            >
              Add Stock
            </Button>
          </div>
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
              placeholder="Stock Code or Description"
              startDecorator={<SearchRoundedIcon fontSize="small" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ width: 130 }}>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>Category</FormLabel>
            <Autocomplete
              placeholder="All"
              options={["", ...categories]}
              value={selectedCategory}
              onChange={(event, value) => {
                setSelectedCategory(value ?? "");
              }}
              getOptionLabel={(option) => {
                if (option === "") return "All";
                return option.toUpperCase();
              }}
              size="sm"
            />
          </FormControl>
          <FormControl sx={{ width: 130 }}>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>Brand</FormLabel>
            <Autocomplete
              placeholder="All"
              options={["", ...brands]}
              value={selectedBrand}
              onChange={(event, value) => {
                setSelectedBrand(value ?? "");
              }}
              getOptionLabel={(option) => {
                if (option === "") return "All";
                return option.toUpperCase();
              }}
              size="sm"
            />
          </FormControl>
          <FormControl sx={{ width: 130 }}>
            <FormLabel sx={{ fontSize: "12px", mb: 0.5 }}>Status</FormLabel>
            <Autocomplete
              placeholder="All"
              options={[
                { value: "", label: "All" },
                { value: "active", label: "ACTIVE" },
                { value: "inactive", label: "INACTIVE" },
              ]}
              value={
                selectedStatus !== ""
                  ? {
                      value: selectedStatus,
                      label:
                        selectedStatus === "active" ? "ACTIVE" : "INACTIVE",
                    }
                  : { value: "", label: "All" }
              }
              onChange={(event, value) => {
                setSelectedStatus(value?.value ?? "");
              }}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              size="sm"
            />
          </FormControl>
          {/* <Button
            onClick={() => {
              getAllStocks(1, searchTerm);
            }}
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
            "--Table-firstColumnWidth": "150px",
            "--Table-lastColumnWidth": "140px",
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
                  Stock Code
                </th>
                <th style={{ width: 300 }}>Description</th>
                <th style={{ width: 100, textAlign: "right" }}>On Stock</th>
                <th style={{ width: 100, textAlign: "right" }}>Available</th>
                <th style={{ width: 100, textAlign: "right" }}>Allocated</th>

                <th style={{ width: 100, textAlign: "right" }}>Purchased</th>
                <th style={{ width: 100, textAlign: "right" }}>Returned</th>
                <th style={{ width: 100, textAlign: "right" }}>Net Sold</th>
                <th style={{ width: 150, textAlign: "right" }}>SRP (₱)</th>
                <th style={{ width: 150, textAlign: "right" }}>
                  Last Sale Price (₱)
                </th>
                <th style={{ width: 150, textAlign: "right" }}>
                  Acqui. Cost (₱)
                </th>
                <th style={{ width: 150, textAlign: "right" }}>
                  Net B/F Tax (₱)
                </th>
                <th style={{ width: 100 }}>Category</th>
                <th style={{ width: 100 }}>Brand</th>
                <th style={{ width: 110 }}>Status</th>
                <th
                  aria-label="actions"
                  style={{ width: "var(--Table-lastColumnWidth)" }}
                />
              </tr>
            </thead>
            {isLoading ? (
              <TableLoadingRows
                columns={16}
                numericColumns={[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                actionColumn={15}
                actionCount={2}
              />
            ) : (
              <tbody>
                {loadError !== null && items.items.length === 0 && (
                  <TableErrorRow
                    colSpan={16}
                    message={loadError}
                    onRetry={() => getAllStocks(searchTerm)}
                  />
                )}
                {items.items.length === 0 && loadError === null && (
                  <TableEmptyRow
                    colSpan={16}
                    title="No stocks found"
                    description={
                      searchTerm !== "" || selectedStatus !== "active"
                        ? "Try adjusting your search or filters."
                        : "Get started by adding your first item."
                    }
                  />
                )}
                {items.items.map((item) => (
                  <tr
                    key={item.id}
                    onDoubleClick={() => {
                      setOpenEdit(true);
                      setSelectedRow(item);
                    }}
                  >
                    <td>
                      <TooltipTableCell maxWidth="150px">
                        {item.stock_code}
                      </TooltipTableCell>
                    </td>
                    <td>
                      <TooltipTableCell maxWidth="300px">
                        {item.name}
                      </TooltipTableCell>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {(
                        item.total_on_stock + item.total_allocated
                      ).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.total_on_stock.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.total_allocated.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.total_purchased.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.total_returned.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.total_net_sold.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(item.srp)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(item.last_sale_price)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(item.acquisition_cost)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {addCommaToNumberWithTwoPlaces(item.net_cost_before_tax)}
                    </td>
                    <td>
                      <TooltipTableCell maxWidth="100px">
                        {item.category}
                      </TooltipTableCell>
                    </td>
                    <td>
                      <TooltipTableCell maxWidth="100px">
                        {item.brand}
                      </TooltipTableCell>
                    </td>
                    <td>{item.status}</td>
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
                          sx={{ fontSize: "13px" }}
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => {
                            setOpenEdit(true);
                            setSelectedRow(item);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          sx={{ fontSize: "13px" }}
                          size="sm"
                          variant="soft"
                          color="danger"
                          className="bg-delete-red"
                          onClick={() => {
                            setOpenDelete(true);
                            setSelectedRow(item);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </Table>
        </Sheet>

        {/* Infinite Scroll Status */}
        {items.items.length > 0 && (
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
                Showing {items.items.length} of {items.total} items • Scroll for
                more
              </Typography>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                Showing all {items.total} items
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <ItemsModal
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Stocks"
        onSave={handleCreateItem}
        currencies={currencies}
      />
      <ItemsModal
        open={openEdit}
        setOpen={setOpenEdit}
        title="Edit Stock"
        row={selectedRow}
        onSave={handleSaveItem}
        currencies={currencies}
      />
      <DeleteConfirmModal
        open={openDelete}
        setOpen={setOpenDelete}
        title="Delete Stock"
        entityLabel="Stock"
        onDelete={handleDeleteItem}
      />
      <CurrencyModal
        open={openCurrencyModal}
        setOpen={setOpenCurrencyModal}
        onChange={() => {
          void axiosInstance
            .get<Currency[]>("/api/currencies")
            .then((res) => setCurrencies(res.data));
        }}
      />
      <PrintStocksModal
        open={openPrintStocksModal}
        setOpen={setOpenPrintStocksModal}
        categories={categories}
        brands={brands}
        warehouses={warehouses}
      />
      <PrintTotalCostDetailModal
        open={openPrintTotalCostModal}
        setOpen={setOpenPrintTotalCostModal}
        categories={categories}
        brands={brands}
      />
    </>
  );
};

export default ItemForm;
