import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import { Card, Box, Table, IconButton, Tooltip } from "@mui/joy";
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import EditIcon from "@mui/icons-material/Edit";

import type {
  ViewWHModalProps,
  AggregatedWarehouseItem,
  PaginatedAggregatedWarehouseItems,
} from "../../interface";
import { withTooltip } from "../shared/withTooltip";
import StockAdjustmentModal from "./StockAdjustmentModal";

interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role?: string;
  is_admin?: boolean;
}

const ViewWHModal = ({
  open,
  setOpen,
  row,
  type,
  onStockAdjustmentSuccess,
}: ViewWHModalProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [warehouseItems, setWarehouseItems] = useState<
    AggregatedWarehouseItem[]
  >([]);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<AggregatedWarehouseItem | null>(null);

  const isAdmin = currentUser?.is_admin === true;

  const handleOpenAdjustment = (item: AggregatedWarehouseItem): void => {
    setSelectedItem(item);
    setAdjustmentModalOpen(true);
  };

  const handleAdjustmentSuccess = (): void => {
    // Reload warehouse items after successful adjustment
    loadWarehouseItems();
    // Notify parent to refetch stock history
    if (onStockAdjustmentSuccess !== undefined) {
      onStockAdjustmentSuccess();
    }
  };

  const loadWarehouseItems = (): void => {
    if (row === undefined) return;

    setIsLoading(true);
    if (type === "warehouse") {
      axiosInstance
        .get<PaginatedAggregatedWarehouseItems>(
          `/api/warehouse_items/aggregated?warehouse_id=${row?.id}`,
        )
        .then((response) => {
          setWarehouseItems(response.data.items);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    } else if (type === "item") {
      axiosInstance
        .get<PaginatedAggregatedWarehouseItems>(
          `/api/warehouse_items/aggregated?stock_code=${row?.stock_code}`,
        )
        .then((response) => {
          setWarehouseItems(response.data.items);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (row === undefined) return;

    // Fetch current user to check admin status
    axiosInstance
      .get<UserResponse>("/api/users/me/")
      .then((response) => {
        setCurrentUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });

    // Load warehouse items
    loadWarehouseItems();
  }, [row]);

  return (
    <>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          setOpen(false);
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: "calc(100vw - 32px)",
            maxWidth: 1000,
            maxHeight: "calc(100dvh - 32px)",
            overflowY: "auto",
            boxSizing: "border-box",
            borderRadius: "md",
            p: { xs: 2, sm: 3 },
            boxShadow: "lg",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Box sx={{ minWidth: 0 }}>
            <h3 className="mb-6">Stock Location</h3>
            <Card sx={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
              <Sheet
                sx={{
                  "--TableCell-height": "40px",
                  // the number is the amount of the header rows.
                  "--TableHeader-height": "calc(1 * var(--TableCell-height))",
                  // Must match the real first column: WH Code for an item,
                  // the name column for a warehouse. The scroll shadow is
                  // positioned from this, so a mismatch puts it mid-column.
                  "--Table-firstColumnWidth":
                    type === "item" ? "120px" : "300px",
                  "--Table-lastColumnWidth": "80px",
                  // background needs to have transparency to show the scrolling shadows
                  "--TableRow-hoverBackground": "rgba(0 0 0 / 0.04)",
                  overflow: "auto",
                  borderRadius: "sm",
                  width: "100%",
                  minWidth: 0,
                  background: (
                    theme,
                  ) => `linear-gradient(to right, ${theme.vars.palette.background.surface} 30%, rgba(255, 255, 255, 0)),
            linear-gradient(to right, rgba(255, 255, 255, 0), ${theme.vars.palette.background.surface} 70%) 0 100%,
            radial-gradient(
              farthest-side at 0 50%,
              rgba(0, 0, 0, 0.12),
              rgba(0, 0, 0, 0)
            ),`,
                  backgroundSize:
                    "40px calc(100% - var(--TableCell-height)), 40px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height))",
                  backgroundRepeat: "no-repeat",
                  backgroundAttachment: "local, local, scroll, scroll",
                  backgroundPosition:
                    "var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height), var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height)",
                  backgroundColor: "background.surface",
                  maxHeight: "min(450px, calc(100dvh - 180px))",
                }}
              >
                <Table
                  className="h-5"
                  size="sm"
                  stickyHeader
                  hoverRow
                  sx={{
                    fontSize: "13px",
                    tableLayout: "fixed",
                    minWidth: type === "item" ? 800 : 680,
                    "& tbody tr > *:first-of-type": {
                      position: "sticky",
                      zIndex: 2,
                      left: 0,
                      boxShadow: "1px 0 var(--TableCell-borderColor)",
                      bgcolor: "background.surface",
                    },
                    "& thead tr > *:first-of-type": {
                      position: "sticky",
                      left: 0,
                      top: 0,
                      zIndex: 3,
                      boxShadow: "1px 0 var(--TableCell-borderColor)",
                      bgcolor: "background.level1",
                    },
                    "& thead th": {
                      // Below the sticky first column, so columns
                      // scrolling sideways pass underneath it.
                      zIndex: 1,
                      backgroundColor: "background.level1",
                    },
                  }}
                  borderAxis="both"
                >
                  {isLoading ? (
                    <tbody>
                      <tr>
                        <td
                          colSpan={
                            type === "item"
                              ? isAdmin
                                ? 8
                                : 7
                              : isAdmin
                                ? 7
                                : 6
                          }
                          style={{ textAlign: "center" }}
                        >
                          <h5>Loading...</h5>
                        </td>
                      </tr>
                    </tbody>
                  ) : warehouseItems.filter(
                      (warehouseItem: AggregatedWarehouseItem) =>
                        warehouseItem.total_on_stock > 0 ||
                        warehouseItem.total_allocated > 0 ||
                        warehouseItem.total_gross_sold > 0 ||
                        warehouseItem.total_returned > 0,
                    ).length > 0 ? (
                    <>
                      <colgroup>
                        {/* One definition of the column widths, used by both
                            the header and the body. With a sticky first column
                            the two can otherwise disagree, which offsets the
                            whole header against the rows. */}
                        {type === "item" && <col style={{ width: 120 }} />}
                        <col style={{ width: 300 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 100 }} />
                        {isAdmin && <col style={{ width: 80 }} />}
                      </colgroup>
                      <thead>
                        <tr>
                          {type === "item" && <th>WH Code</th>}
                          <th>
                            {type === "warehouse"
                              ? "Stock Name"
                              : "Warehouse Name"}
                          </th>
                          <th style={{ textAlign: "right" }}>On Stock</th>
                          <th style={{ textAlign: "right" }}>Available</th>
                          <th style={{ textAlign: "right" }}>Allocated</th>
                          <th style={{ textAlign: "right" }}>Returned</th>
                          <th style={{ textAlign: "right" }}>Net Sold</th>
                          {isAdmin && (
                            <th style={{ textAlign: "center" }}>Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {warehouseItems
                          .filter(
                            (warehouseItem: AggregatedWarehouseItem) =>
                              warehouseItem.total_on_stock > 0 ||
                              warehouseItem.total_allocated > 0 ||
                              warehouseItem.total_gross_sold > 0 ||
                              warehouseItem.total_returned > 0,
                          )
                          .map((warehouseItem: AggregatedWarehouseItem) => (
                            <tr
                              key={`${warehouseItem.warehouse_id}-${warehouseItem.item_id}`}
                            >
                              {type === "item" && (
                                <td>
                                  {withTooltip(
                                    warehouseItem.warehouse_code,
                                    "110px",
                                  )}
                                </td>
                              )}
                              <td>
                                {type === "warehouse"
                                  ? withTooltip(
                                      warehouseItem.item_name,
                                      "200px",
                                    )
                                  : withTooltip(
                                      warehouseItem.warehouse_name,
                                      "200px",
                                    )}
                              </td>
                              {/* total_on_stock is basically now total_available quantity. Wrong variable naming */}
                              <td style={{ textAlign: "right" }}>
                                {(
                                  warehouseItem.total_on_stock +
                                  warehouseItem.total_allocated
                                ).toLocaleString()}
                              </td>
                              {/* total_on_stock is basically now total_available */}
                              <td style={{ textAlign: "right" }}>
                                {warehouseItem.total_on_stock.toLocaleString()}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {warehouseItem.total_allocated.toLocaleString()}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {warehouseItem.total_returned.toLocaleString()}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {warehouseItem.total_net_sold.toLocaleString()}
                              </td>
                              {isAdmin && (
                                <td style={{ textAlign: "center" }}>
                                  <Tooltip title="Adjust Stock">
                                    <IconButton
                                      size="sm"
                                      variant="outlined"
                                      color="primary"
                                      onClick={() =>
                                        handleOpenAdjustment(warehouseItem)
                                      }
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </>
                  ) : (
                    <tbody>
                      <tr>
                        <td
                          colSpan={
                            type === "item"
                              ? isAdmin
                                ? 8
                                : 7
                              : isAdmin
                                ? 7
                                : 6
                          }
                          style={{ textAlign: "center" }}
                        >
                          No Stock Location Available
                        </td>
                      </tr>
                    </tbody>
                  )}
                </Table>
              </Sheet>
            </Card>
          </Box>
        </Sheet>
      </Modal>

      {/* Stock Adjustment Modal - Render outside parent modal */}
      {selectedItem !== null && (
        <StockAdjustmentModal
          open={adjustmentModalOpen}
          setOpen={setAdjustmentModalOpen}
          warehouseId={selectedItem.warehouse_id}
          warehouseName={selectedItem.warehouse_name}
          itemId={selectedItem.item_id}
          itemName={selectedItem.item_name}
          stockCode={selectedItem.stock_code}
          currentStock={selectedItem.total_on_stock}
          onSuccess={handleAdjustmentSuccess}
        />
      )}
    </>
  );
};

export default ViewWHModal;
