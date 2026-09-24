import type { Expense } from "./components/ReceivingReport/interface";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role?: string | null;
  is_admin?: boolean;
  disabled?: boolean;
}

export interface Currency {
  id: number;
  code: string;
}

export interface Item {
  id: number;
  stock_code: string;
  name: string;
  supplier_id?: number;
  suppliers?: Array<Supplier | null>;
  status: string;
  category: string;
  brand: string;
  acquisition_cost?: number | string;
  net_cost_before_tax?: number | string;
  currency: Currency;
  currency_id: number;
  last_sale_price?: number | string;
  srp?: number | string;
  rate?: number;
  total_on_stock: number;
  total_allocated: number;
  total_purchased: number;
  total_sold: number;
  total_gross_sold: number;
  total_returned: number;
  total_net_sold: number;
  created_by: number;
  modified_by: number;
  date_created: string;
  date_modified: string;
  creator?: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  modifier?: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };

  // Fields for PO Functionality only
  volume?: any;
  price?: any;
  on_stock?: number;
  in_transit?: number;
  allocated?: number;
  p_type?: string;
}

export interface Category {
  normalized_name: string;
  count: number;
}

export interface Brand {
  normalized_name: string;
  count: number;
}

export interface ViewStockHistory {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  row?: Item;
  refetchTrigger?: number;
}

export interface IStockHistory {
  transaction_type: string;
  reference_number: string;
  stock_code: string;
  stock_description: string;
  transaction_date: string;
  transaction_number: number;
  quantity_in: number;
  quantity_out: number;
  price: number;
  net_cost: number;
  net_price: number;
  discount_amount: number;
  supplier_discount_1?: string;
  supplier_discount_2?: string;
  supplier_discount_3?: string;
  transaction_discount_1?: string;
  transaction_discount_2?: string;
  transaction_discount_3?: string;
  supplier_name: string | null;
  customer_name: string | null;
  last_purchase_price?: number;
  gross_amount?: number;
}

export interface DeleteModalProps {
  open: boolean;
  title: string;
  entityLabel: string;
  setOpen: (isOpen: boolean) => void;
  onDelete: () => Promise<void>;
}

export interface ArchiveModalProps {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  transactionType: string;
  onArchive: () => Promise<void>;
}

export interface ItemsModalProps {
  open: boolean;
  title: string;
  setOpen: (isOpen: boolean) => void;
  row?: Item;
  onSave: (newItem: Item) => Promise<void>;
  currencies?: Currency[];
}

export interface Supplier {
  supplier_id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email?: string; // Optional
  currency: string;
  supplier_balance?: number;
  notes: string;
  created_by?: number;
  modified_by?: number;
  creator?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    disabled: boolean;
    supabase_uid?: string;
    is_admin?: boolean;
  };
  modifier?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    disabled: boolean;
    supabase_uid?: string;
    is_admin?: boolean;
  } | null;
  date_created: string;
  date_modified: string | null;
}

export interface Customer {
  customer_id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email?: string; // Optional
  customer_balance?: number;
  notes: string;
  created_by?: number;
  modified_by?: number;
  creator?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    disabled: boolean;
    supabase_uid?: string;
    is_admin?: boolean;
  };
  modifier?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    disabled: boolean;
    supabase_uid?: string;
    is_admin?: boolean;
  } | null;
  date_created: string;
  date_modified: string | null;
}

export interface SuppliersModalProps {
  open: boolean;
  title: string;
  setOpen: (isOpen: boolean) => void;
  row?: Supplier;
  onSave: (newSupplier: Supplier) => Promise<void>;
}

export interface CustomersModalProps {
  open: boolean;
  title: string;
  setOpen: (isOpen: boolean) => void;
  row?: Customer;
  onSave: (newCustomer: Customer) => Promise<void>;
}

export interface PaginatedSuppliers {
  total: number;
  items: Supplier[];
}

export interface PaginatedCustomers {
  total: number;
  items: Customer[];
}

export interface PaginatedItems {
  total: number;
  items: Item[];
}

export interface PaginatedWarehouse {
  total: number;
  items: Warehouse[];
}

export interface PaginatedWarehouseItems {
  total: number;
  items: WarehouseItem[];
}

export interface PaginatedAggregatedWarehouseItems {
  total: number;
  items: AggregatedWarehouseItem[];
}

export interface PaginatedPO {
  total: number;
  items: PurchaseOrder[];
}

export interface PaginatedCPO {
  total: number;
  items: CPO[];
}

export interface PaginatedSDR {
  total: number;
  items: DeliveryReceipt[];
}

export interface PaginatedRR {
  total: number;
  items: ReceivingReport[];
}

export interface PaginatedST {
  total: number;
  items: StockTransfer[];
}

export interface PaginatedAlloc {
  total: number;
  items: Alloc[];
}

export interface PaginatedDealloc {
  total: number;
  items: Dealloc[];
}

export interface PaginatedCDP {
  total: number;
  items: CDP[];
}

export interface PaginatedCDR {
  total: number;
  items: CDR[];
}

export interface PaginatedCR {
  total: number;
  items: CR[];
}

export interface PaginatedAR {
  total: number;
  items: AR[];
}

export interface PaginatedUsers {
  total: number;
  items: User[];
}

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
  search_term?: string;
  status?: string;
  unassigned_to_rr?: boolean;
  payment_status?: string;
  adjustment_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  type: string;
  creator?: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  modifier?: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  created_by: number;
  modified_by: number;
  date_created: string;
  date_modified: string;
}

export interface WarehousesModalProps {
  open: boolean;
  title: string;
  setOpen: (isOpen: boolean) => void;
  row?: Warehouse;
  onSave: (newWarehouse: Warehouse) => Promise<void>;
}

export interface ViewWHModalProps {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  row?: any;
  type: string;
  onStockAdjustmentSuccess?: () => void;
}

export interface FetchedWarehouseItems {
  total: number;
  items: WarehouseItem[];
}

export interface WarehouseItem {
  warehouse_id: number;
  item_id: number;
  on_stock: number;
  available: number;
  allocated: number;
  purchased: number;
  sold: number;
  warehouse: Warehouse;
  item: Item;
  created_by: string;
  modified_by: string;
  date_created: string;
  date_modified: string;

  firstWarehouse?: any;
  firstWarehouseAmt?: number | null;
  secondWarehouse?: any;
  secondWarehouseAmt?: number | null;
  thirdWarehouse?: any;
  thirdWarehouseAmt?: number | null;

  // Hack fix
  id?: number | null;
}

export interface AggregatedWarehouseItem {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  item_id: number;
  stock_code: string;
  item_name: string;
  total_on_stock: number;
  total_allocated: number;
  total_purchased: number;
  total_sold: number;
  total_gross_sold: number;
  total_returned: number;
  total_net_sold: number;
}

export interface StockAdjustmentRequest {
  adjustment_type: "surplus" | "deficit";
  adjustment_amount: number;
  net_cost: number;
}

export interface StockAdjustmentResponse {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  item_id: number;
  stock_code: string;
  item_name: string;
  adjustment_type: "surplus" | "deficit";
  adjustment_amount: number;
  net_cost: number;
  previous_on_stock: number;
  new_on_stock: number;
  created_by_name: string;
  date_created: string;
  company_id: number;
}

export interface PaginatedStockAdjustments {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: StockAdjustmentResponse[];
}

export interface ViewStockAdjustmentProps {
  setOpenCreate: (isOpen: boolean) => void;
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  status: string;
  transaction_date: string;
  supplier_discount_1: string;
  transaction_discount_1: string;
  supplier_discount_2: string;
  transaction_discount_2: string;
  supplier_discount_3: string;
  transaction_discount_3: string;
  currency_used: string;
  peso_rate: number;
  net_amount: number;
  fob_total: number;
  landed_total: number;
  reference_number: string;
  remarks: string;
  supplier: Supplier;
  created_by: number;
  modified_by: number;
  creator: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_created: string;
  modifier: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_modified: string;
  items: POItems[];
}

export interface PurchaseOrderFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: PurchaseOrder;
  title: string;
}

export interface CPO {
  id: number;
  customer_id: number;
  status: string;
  price_level: string;
  transaction_date: string;
  customer_discount_1: string;
  transaction_discount_1: string;
  customer_discount_2: string;
  transaction_discount_2: string;
  customer_discount_3: string;
  transaction_discount_3: string;
  net_total: number;
  gross_total: number;
  reference_number: string;
  remarks: string;
  customer: Customer;
  created_by: number;
  modified_by: number;
  creator: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_created: string;
  modifier: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_modified: string;
  items: CPOItems[];
}

export interface CPOFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: CPO;
  title: string;
}

export interface SDRFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: DeliveryReceipt;
  title: string;
}

export interface RRFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: ReceivingReport;
  title: string;
}

export interface STFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: StockTransfer;
  title: string;
}

export interface AllocFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: Alloc;
  title: string;
}

export interface DeallocFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: Dealloc;
  title: string;
}

export interface CDPFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: CDP;
  title: string;
}

export interface CDRFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: CDR;
  title: string;
}

export interface CRFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: CR;
  title: string;
}

export interface ARFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: AR;
  title: string;
  isAdmin?: boolean;
  /** Start a fresh receipt without returning to the list first. */
  onStartNew?: () => void;
}

export interface ViewPurchaseOrderProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: PurchaseOrder | undefined;
  setSelectedRow: (purchaseOrder: PurchaseOrder) => void;
  refetchTrigger?: number;
}

export interface ViewCPOProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: CPO | undefined;
  setSelectedRow: (cpo: CPO) => void;
}
export interface ViewDeliveryReceiptProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: DeliveryReceipt | undefined;
  setSelectedRow: (deliveryReceipt: DeliveryReceipt) => void;
}

export interface ViewReceivingReportProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: ReceivingReport | undefined;
  setSelectedRow: (receivingReport: ReceivingReport) => void;
}

export interface ViewStockTransferProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: StockTransfer | undefined;
  setSelectedRow: (stockTransfer: StockTransfer) => void;
}

export interface ViewAllocProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: Alloc | undefined;
  setSelectedRow: (alloc: Alloc) => void;
}

export interface ViewDeallocProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: Dealloc | undefined;
  setSelectedRow: (dealloc: Dealloc) => void;
}

export interface ViewCDPProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: CDP | undefined;
  setSelectedRow: (cdp: CDP) => void;
}

export interface ViewCDRProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: CDR | undefined;
  setSelectedRow: (cdr: CDR) => void;
}

export interface ViewCRProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: CR | undefined;
  setSelectedRow: (cr: CR) => void;
}

export interface ViewARProps {
  setOpenCreate: (isOpen: boolean) => void;
  setOpenEdit: (isOpen: boolean) => void;
  selectedRow: AR | undefined;
  setSelectedRow: (ar: AR) => void;
  isAdmin: boolean;
}

export interface CPOItems {
  // Discrepancy between item_id, id
  item_id: number;
  id: number;

  customer_purchase_order_id: number;
  volume: number;
  price: number;
  total_price: number;
  allocated: number;
  unserved_cpo: number;
  item: Item;
  p_type: string;

  temp_in_transit: number;
  temp_on_stock: number;
  temp_allocated: number;
}

export interface POItems {
  // Discrepancy between item_id, id
  item_id: number;
  id: number;

  purchase_order_id: number;
  volume: number;
  price: number;
  total_price: number;
  on_stock: number;
  in_transit: number;
  allocated: number;
  unserved_spo: number;
  item: Item;

  temp_in_transit: number;
  temp_on_stock: number;
  temp_allocated: number;
}

export interface DeliveryReceipt {
  id: number;
  supplier_id: number;
  transaction_date: string;
  status: string;
  discount_amount: number;
  net_amount: number;
  fob_total: number;
  landed_total: number;
  reference_number: string;
  remarks: string;
  supplier: Supplier;
  created_by: number;
  modified_by: number;
  creator: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_created: string;
  modifier: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_modified: string;
  purchase_orders: PurchaseOrder[];
}

export interface DeliveryReceiptFormProps {
  setOpen: (isOpen: boolean) => void;
  openCreate: boolean;
  openEdit: boolean;
  selectedRow?: PurchaseOrder;
  setSelectedRow?: (purchaseOrder: PurchaseOrder) => void;
  title: string;
}

export interface ReceivingReport {
  id: number;
  status: string;
  transaction_date: string;
  supplier_id: number;
  currency: string;
  rate: number;
  total_expense: number;
  reference_number: string;
  pct_net_cost: number;
  remarks: string;
  fob_total: number;
  net_amount: number;
  landed_total: number;
  sdrs: DeliveryReceipt[];
  expenses: Expense[];
  supplier: Supplier;
  creator: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_created: string;
  modifier: {
    full_name: string;
    username: string;
    email: string;
    id: number;
  };
  date_modified: string;
}

interface STDest {
  id: number;
  quantity: number;
  to_warehouse_id: number;
}

interface StockTransferDetail {
  id: number;
  stock_transfer_id: number;
  warehouse_id: number;
  item_id: number;
  product_name: string;
  stock_code: string;
  total_qty: number;
  to_warehouse_id: number;
  rr_balance_quantity: number;
  on_stock: number;
  available: number;
  unit_code: string;
  created_by: number;
  date_created: string;
  modified_by: number;
  date_modified: string;
  creator: User;
  modifier: User;
  destinations: STDest[];
}

export interface StockTransfer {
  id: number;
  status: string;
  transaction_date: string;
  rr_transfer: boolean;
  remarks: string;
  rr_id: number;
  supplier_id: number;
  from_warehouse_id: number;
  created_by: number;
  date_created: string;
  modified_by: number;
  date_modified: string;
  stock_transfer_details: StockTransferDetail[];
  creator: User;
  modifier: User;
}

export interface AllocItem {
  allocation_id: number;
  creator: User;
  customer_purchase_order: CPO;
  customer_purchase_order_id: number;
  cpo_existing_allocated: number;
  date_created: string;
  date_modified: string;
  id: number;
  item: {
    id: number;
    name: string;
    stock_code: string;
  };
  item_id: number;
  modifier: User;
  warehouse_allocations: Array<{
    allocated_qty: number;
    allocation_item_id: number;
    creator: User;
    date_created: string; // ISO format date string
    date_modified: string | null; // Nullable date
    id: number;
    item_id: number;
    modifier: string | null; // Nullable modifier
    warehouse_id: number;
    net_allocated?: number;
    warehouse_item: WarehouseItem;
  }>;
}

export interface DeallocItem {
  id: number;
  allocation_item_id: number;
  item_id: number;
  total_item_qty: number;
  cpo_existing_allocated: number;
  warehouse_deallocations: Array<{
    id: number;
    warehouse_id: number;
    item_id: number;
    deallocated_qty: number;
    creator: User;
    date_created: string;
    modifier: string | null;
    date_modified: string | null;
  }>;
  creator: User;
  date_created: string;
  modifier: string | null;
  date_modified: string | null;
  allocation_item: AllocItem;
}

export interface Alloc {
  id: number;
  status: string;
  transaction_date: string;
  customer: {
    customer_id: number;
    name: string;
  };
  remarks: string;
  allocation_items: AllocItem[];
  cpo_number_filter: string;
  creator: User;
  modifier: User;
  date_created: string;
  date_modified: string;
}

export interface Dealloc {
  id: number;
  status: string;
  allocation_id: number;
  allocation: Alloc;
  customer_id: number;
  customer: Customer;
  transaction_date: string;
  remarks: string;
  total_qty: number;
  deallocation_items: DeallocItem[];
  creator: User;
  modifier: User;
  date_created: string;
  date_modified: string;
}

export interface DeliveryPlanItem {
  allocation_item_id: number;
  planned_qty: number;
  id: number;
  existing_allocated_qty: number;
  allocation_item: {
    allocation_id: number;
    customer_purchase_order_id: number;
    item_id: number;
    created_by: number;
    modified_by: number;
    date_created: string;
    date_modified: string | null;
    customer_purchase_order: CPO;
  };
  created_by: number;
  modified_by: number | null;
  date_created: string;
  date_modified: string | null;
  gross: string;
  net: string;
}

export interface CDP {
  status: string;
  discount_amount: string;
  transaction_date: string;
  reference_number: string;
  remarks: string;
  customer_id: number;
  id: number;
  total_items: number;
  total_gross: string;
  total_net: string;
  delivery_plan_items: DeliveryPlanItem[];
  customer: Customer;
  created_by: number;
  modified_by: number | null;
  date_created: string;
  date_modified: string;
  creator: User;
  modifier: User | null;
}

export interface ReturnSourceFulfillment {
  deliver_event_id: string;
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  delivered_qty: number;
  returned_qty: number;
  remaining_qty: number;
}

export interface ReturnSourceAllocation {
  deliver_event_id: string;
  quantity: number;
}

interface DeliveryReceiptItem {
  delivery_plan_item_id: number;
  delivery_receipt_id: number;
  delivered_qty: number;
  id: number;
  created_by: number;
  modified_by: number | null;
  date_created: string;
  date_modified: string | null;
  source_fulfillments: ReturnSourceFulfillment[];
  delivery_plan_item: {
    id: number;
    allocation_item: {
      allocation_id: number;
      customer_purchase_order_id: number;
      item_id: number;
      item: {
        stock_code: string;
        name: string;
      };
      customer_purchase_order: {
        id: number;
        customer_discount_1: string;
        customer_discount_2: string;
        customer_discount_3: string;
        transaction_discount_1: string;
        transaction_discount_2: string;
        transaction_discount_3: string;
        items: Array<{
          id: number;
          item_id: number;
          price: number;
          volume: number;
          unserved_cpo: number;
          item: {
            stock_code: string;
            name: string;
          };
        }>;
        creator: {
          id: number;
          username: string;
          email: string;
          full_name: string;
          disabled: boolean;
        };
        date_created: string;
        modifier: string | null;
        date_modified: string | null;
      };
    };
    planned_qty: number;
  };
}

export interface CDR {
  status: string;
  transaction_date: string;
  discount_amount: string;
  reference_number: string;
  remarks: string;
  delivery_plan_id: number;
  id: number;
  total_items: number;
  total_gross: string;
  total_net: string;
  created_by: number;
  modified_by: number | null;
  date_created: string;
  date_modified: string;
  receipt_items: DeliveryReceiptItem[];
  customer: Customer;
  creator: User;
  modifier: User | null;
}

export interface CRItemDetail {
  delivery_receipt_item_id: number;
  warehouse_id: number;
  item_id: number;
  return_qty: number;
  price: string;
  id: number;
  created_by: number;
  modified_by: number | null;
  date_created: string;
  date_modified: string | null;
  delivery_receipt_item: DeliveryReceiptItem;
  warehouse: Warehouse;
  item: Item;
  source_allocations: ReturnSourceAllocation[];
}

export interface CR {
  status: string;
  transaction_date: string;
  reference_number: string;
  remarks: string;
  customer_id: number;
  id: number;
  total_qty: number;
  total_gross: string;
  discount_return_amount: number;
  created_by: number;
  modified_by: number | null;
  date_created: string;
  date_modified: string;
  items: CRItemDetail[];
  customer: Customer;
  creator: User;
  modifier: User | null;
}

export interface AR {
  reference_number: string;
  status: string;
  transaction_date: string;
  customer_id: number;
  payment_method: string;
  check_number?: string;
  check_amount?: string;
  check_date?: string;
  less_amount: string;
  add_amount: string;
  remarks?: string;
  days_to_clear: number;
  id: number;
  payment_amount: string;
  total_applied: string;
  payment_status: string;
  clearing_date?: string;
  reversal_date?: string | null;
  reversal_reason?: string | null;
  created_by: number;
  modified_by: number;
  date_created: string;
  date_modified: string;
  cdr_number_filter: string;
  customer: Customer;
  creator: User;
  modifier: User;
  receipt_items: Array<{
    source_type: string;
    source_id: number;
    source_transaction_date: string;
    original_amount: string;
    transaction_amount: string;
    payment_amount: string;
    reference: string;
    id: number;
    ar_receipt_id: number;
    created_by: number;
    modified_by: number;
    date_created: string;
    date_modified: string;
  }>;
}

export interface PrintInventoryItem {
  alloc_qty: number;
  avail_qty: number;
  brand: string;
  category: string;
  location: string;
  name: string;
  selling_price: number;
  stock_code: string;
  unit: string;
}

export interface PrintInventoryResponse {
  total: number;
  items: PrintInventoryItem[];
  next_page: string;
  previous_page: string;
}
