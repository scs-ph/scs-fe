import ARFormDetails from "./ARForm/ARFormDetails";
import ARFormTable from "./ARForm/ARFormTable";
import { Button, Typography } from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import { type OutstandingTrans } from "./interface";
import type {
  PaginatedCustomers,
  Customer,
  ARFormProps,
  AR,
} from "../../interface";
import ReverseARModal from "./ReverseARModal";
import { addTwoPlaces, getErrorMessage } from "../../helper";
import { FormLoadingSkeleton } from "../shared/ContentStates";

// Decides whether a row in the table is an amount the user actually applied,
// and so should be sent to the backend as a receipt item.
const isAppliedPayment = (payment: string | undefined): boolean => {
  if (payment === undefined || payment === "") return false;
  const amount = Number(payment);
  if (!Number.isFinite(amount)) return false;

  return amount !== 0;
};

const ARForm = ({
  setOpen,
  openCreate,
  openEdit,
  selectedRow,
  title,
  isAdmin: isAdminProp,
  onStartNew,
}: ARFormProps): JSX.Element => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [isAdmin, setIsAdmin] = useState(isAdminProp ?? false);
  const [customers, setCustomers] = useState<PaginatedCustomers>({
    total: 0,
    items: [],
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [outstandingTrans, setOutstandingTrans] = useState<OutstandingTrans[]>(
    [],
  );
  const [status, setStatus] = useState("unposted");
  const [transactionDate, setTransactionDate] = useState(currentDate);
  const [remarks, setRemarks] = useState("");

  const [paymentMode, setPaymentMode] = useState("cash");
  const [checkDate, setCheckDate] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const [addAmount1, setAddAmount1] = useState("");
  const [addAmount2, setAddAmount2] = useState("");
  const [addAmount3, setAddAmount3] = useState("");
  const [lessAmount, setLessAmount] = useState("");

  const [refNo, setRefNo] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [reversalReason, setReversalReason] = useState("");
  const [openReverse, setOpenReverse] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [selectedCDR, setSelectedCDR] = useState<string | null>(null);
  const [cdrNumbers, setCDRNumbers] = useState<string[]>([]);

  const totalApplied = outstandingTrans.reduce(
    (total, trans) => total + Number(trans.payment),
    0,
  );
  const addAmount = addAmount1 + addAmount2 + addAmount3;
  const paymentAmount = totalApplied - Number(lessAmount) + Number(addAmount);

  const isEditDisabled =
    selectedRow !== undefined &&
    (selectedRow?.status !== "unposted" || !isAdmin);

  // Fetch user info if not provided (for backward compatibility)
  useEffect(() => {
    if (isAdminProp === undefined) {
      axiosInstance
        .get<{ id: number; is_admin?: boolean }>("/api/users/me/")
        .then((response) => setIsAdmin(response.data.is_admin ?? false))
        .catch((error) => console.error("Error fetching user:", error));
    }
  }, [isAdminProp]);

  useEffect(() => {
    // Fetch customers
    axiosInstance
      .get<PaginatedCustomers>(
        "/api/customers/?with_pending_receivables=True&sort_by=name",
      )
      .then((response) => setCustomers(response.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const fetchARByCustomer = useCallback(
    (
      customerId: number | null,
      savedPayments: Record<string, string> = {},
      currentItems: OutstandingTrans[] = [], // New param to include items that might be fully paid and hidden by API
      completePayment = false,
    ) => {
      setIsLoadingItems(true);
      // Fetch ARs
      axiosInstance
        .get<OutstandingTrans[]>(
          `/api/ar-receipts/customer/${customerId}/outstanding-transactions`,
        )
        .then((response) => {
          // Identify items returned by API
          const apiIds = new Set(
            response.data.map((t) => `${t.source_type}-${t.id}`),
          );

          // Find items in currentItems that are NOT in API response (e.g. fully paid ones)
          const missingItems = currentItems.filter(
            (t) => !apiIds.has(`${t.source_type}-${t.id}`),
          );

          // Combine them
          const allTransactions = [...missingItems, ...response.data];

          setOutstandingTrans(
            allTransactions.map((trans) => {
              const key = `${trans.source_type}-${trans.id}`;
              const savedPayment = savedPayments[key];

              if (savedPayment !== undefined) {
                // This invoice was previously selected - restore payment amount
                return { ...trans, payment: savedPayment };
              } else if (completePayment) {
                // Auto-fill mode
                return {
                  ...trans,
                  payment: addTwoPlaces(Number(trans.transaction_amount)),
                };
              } else {
                // New invoice or not previously selected - empty payment
                return { ...trans, payment: "" };
              }
            }),
          );

          // Combination of transaction numbers and reference(for CR)
          setCDRNumbers([
            ...new Set(
              allTransactions
                .flatMap((trans) => [trans.transaction_number, trans.reference])
                // DR numbers only
                .filter((transNo) => transNo?.startsWith("DR")),
            ),
          ]);
          setIsLoadingItems(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoadingItems(false);
        });
    },
    [],
  );

  useEffect(() => {
    // Set fields for Edit
    const customerID = selectedRow?.customer.customer_id ?? null;

    const fetchValues = (
      selectedRow: AR,
      savedPayments: Record<string, string>,
      formattedARItems: OutstandingTrans[],
    ): void => {
      setStatus(selectedRow?.status ?? "unposted");
      setTransactionDate(selectedRow?.transaction_date ?? currentDate);
      setPaymentMode(selectedRow.payment_method);

      setAmountPaid(String(parseFloat(selectedRow?.check_amount ?? "")));
      setCheckNumber(selectedRow?.check_number ?? "");
      setCheckDate(selectedRow?.check_date ?? "");
      setRefNo(selectedRow.reference_number);

      setLessAmount(String(parseFloat(selectedRow.less_amount)));
      setAddAmount1(String(parseFloat(selectedRow.add_amount)));
      setRemarks(selectedRow?.remarks ?? "");
      setPaymentStatus(selectedRow.payment_status);
      setSelectedCDR(selectedRow?.cdr_number_filter);

      // Only fetch fresh data for unposted ARs (draft mode)
      if (selectedRow.status === "unposted") {
        // Fetch ALL outstanding transactions and merge with saved payments
        // Pass formattedARItems as 'currentItems' so fully paid ones are not lost
        fetchARByCustomer(customerID, savedPayments, formattedARItems);
      } else {
        // For posted ARs, just show the exact items that were posted (read-only)
        setOutstandingTrans(formattedARItems);
      }
    };

    if (selectedRow !== null && selectedRow !== undefined) {
      // Get Customer for Edit
      const customerPromise = axiosInstance
        .get<Customer>(`/api/customers/${customerID}`)
        .then((response) => {
          setSelectedCustomer(response.data);
        })
        .catch((error) => console.error("Error:", error));

      const arPromise = axiosInstance
        .get<AR>(`/api/ar-receipts/${selectedRow.id}`)
        .then((response) => {
          const ARItems = response.data.receipt_items;

          // Extract saved payments into a map: "source_type-source_id" -> payment_amount
          const savedPayments: Record<string, string> = {};
          const formattedARItems: OutstandingTrans[] = ARItems.map((item) => {
            const key = `${item.source_type}-${item.source_id}`;
            savedPayments[key] = String(parseFloat(item.payment_amount));

            // Format the items for display (used for posted ARs AND for restoring missing items in unposted)
            // For Unposted: We subtract payment to mimic the API's "pending balance"
            // so that our merge logic (which adds it back) works consistently.
            // For Posted: We display the values as stored in the DB item.
            const isUnposted = selectedRow?.status === "unposted";
            const rawTransactionAmount = Number(item.transaction_amount);
            const rawPaymentAmount = Number(item.payment_amount);

            // If unposted, we need to "hide" the payment from the transaction amount
            // so that the restoration logic (which adds it back) doesn't double count
            // or result in correct "Before Payment" value.
            const displayTransactionAmount = isUnposted
              ? rawTransactionAmount - rawPaymentAmount
              : rawTransactionAmount;

            return {
              id: item.source_id,
              source_type: item.source_type,
              transaction_number:
                item.source_type === "customer_dr"
                  ? `DR-${item.source_id}`
                  : `CR-${item.source_id}`,
              transaction_date: item.source_transaction_date,
              original_amount: item.original_amount,
              transaction_amount: String(displayTransactionAmount),
              payment: String(rawPaymentAmount),
              // Balance is remaining amount
              balance: String(
                displayTransactionAmount - (isUnposted ? 0 : rawPaymentAmount),
              ),
              reference: item.reference,
            };
          });

          return { savedPayments, formattedARItems };
        })
        .catch((error) => {
          console.error("Error:", error);
          return { savedPayments: {}, formattedARItems: [] };
        });

      void Promise.all([customerPromise, arPromise]).then(
        ([, { savedPayments, formattedARItems }]) => {
          fetchValues(selectedRow, savedPayments, formattedARItems);
          setIsFetching(false);
        },
      );
    } else {
      setIsFetching(false);
    }
  }, [selectedRow]);

  const resetForm = (): void => {
    setSelectedCustomer(null);
    setOutstandingTrans([]);
    setStatus("unposted");
    setTransactionDate(currentDate);
    setRemarks("");
    setPaymentMode("cash");
    setCheckDate("");
    setAmountPaid("");
    setAddAmount1("");
    setAddAmount2("");
    setAddAmount3("");
    setLessAmount("");
    setRefNo("");
  };

  // Create Receipt
  const handleCreateAR = async (): Promise<void> => {
    if (isSaving) return;

    const receiptItems = outstandingTrans
      .filter((row) => isAppliedPayment(row.payment))
      .map((row) => {
        return {
          source_type: row.source_type,
          source_id: row.id,
          original_amount: row.original_amount,
          transaction_amount: row.transaction_amount,
          payment_amount: Number(row.payment),
          reference: row.reference,
        };
      });

    const payload = {
      reference_number: refNo,
      status,
      transaction_date: transactionDate === "" ? null : transactionDate,
      customer_id: selectedCustomer?.customer_id,
      payment_method: paymentMode,
      check_amount: amountPaid === "" ? null : Number(amountPaid),
      check_date: checkDate === "" ? null : checkDate,
      less_amount: lessAmount === "" ? 0 : Number(lessAmount),
      add_amount: addAmount === "" ? 0 : Number(addAmount),
      remarks,
      days_to_clear: 1,
      receipt_items: receiptItems,
      payment_status:
        status === "posted" && paymentMode === "cash" ? "cleared" : "pending",
      payment_amount: paymentAmount,
      total_applied: totalApplied,
      cdr_number_filter: selectedCDR,
    };

    try {
      setIsSaving(true);
      const response = await axiosInstance.post<AR>(
        "/api/ar-receipts/",
        payload,
      );

      // Lock form immediately after successful response
      setHasSaved(true);

      // Update state with response data
      setStatus(response.data.status);
      setPaymentStatus(response.data.payment_status);

      setIsSaving(false);

      if (response.data.status === "posted") {
        toast.success("Post successful!");
      } else {
        toast.success("Save successful!");
      }
    } catch (error: any) {
      toast.error(
        `Error message: ${getErrorMessage(error, "Save unsuccessful")}`,
      );
      setIsSaving(false);
    }
  };

  const handleEditAR = async (): Promise<void> => {
    if (isSaving) return;

    const receiptItems = outstandingTrans
      .filter((row) => isAppliedPayment(row.payment))
      .map((row) => {
        return {
          source_type: row.source_type,
          source_id: row.id,
          original_amount: row.original_amount,
          transaction_amount: row.transaction_amount,
          payment_amount: row.payment,
          reference: row.reference,
        };
      });

    // If status in state is "posted", we send it as "posted" to trigger the atomic post in backend.
    // Otherwise we send "unposted" (or the current status, which is likely unposted if we are editing)
    const payload = {
      reference_number: refNo,
      status, // Send the actual intended status
      transaction_date: transactionDate === "" ? null : transactionDate,
      customer_id: selectedCustomer?.customer_id,
      payment_method: paymentMode,
      check_amount: amountPaid === "" ? null : Number(amountPaid),
      check_date: checkDate === "" ? null : checkDate,
      less_amount: lessAmount === "" ? 0 : Number(lessAmount),
      add_amount: addAmount === "" ? 0 : Number(addAmount),
      remarks,
      days_to_clear: 1,
      receipt_items: receiptItems,
      payment_amount: paymentAmount,
      total_applied: totalApplied,
      cdr_number_filter: selectedCDR,
    };

    try {
      setIsSaving(true);
      // Single atomic request for both update and post (if status is posted)
      const response = await axiosInstance.put<AR>(
        `/api/ar-receipts/${selectedRow?.id}`,
        payload,
      );

      // Lock form immediately after successful response
      setHasSaved(true);

      // Update state with response data
      setStatus(response.data.status);
      setPaymentStatus(response.data.payment_status);

      setIsSaving(false);

      if (response.data.status === "posted") {
        toast.success("Post successful!");
      } else {
        toast.success("Save successful!");
      }
    } catch (error: any) {
      toast.error(
        `Error message: ${getErrorMessage(error, "Save unsuccessful")}`,
      );
      setIsSaving(false);
    }
  };

  const onReverse = async (): Promise<void> => {
    try {
      await axiosInstance.put(
        `/api/ar-receipts/${selectedRow?.id}/payment-status`,
        {
          payment_status: "reversed",
          reversal_reason: reversalReason,
        },
      );
      toast.success("Reverse successful!");
      setOpenReverse(false);
      setHasSaved(true);
    } catch (error: any) {
      toast.error(`Error message: ${getErrorMessage(error)}`);
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (openCreate) await handleCreateAR();
        if (openEdit) await handleEditAR();
      }}
    >
      <div className="flex justify-between">
        <Typography level="h2" component="h1" sx={{ mb: 3 }}>
          {title}
        </Typography>
        <div className="flex">
          {(hasSaved || isEditDisabled) && onStartNew !== undefined && (
            <Button
              className="w-[130px] h-[35px] bg-button-primary"
              size="sm"
              onClick={onStartNew}
              startDecorator={<AddRoundedIcon />}
            >
              Add A/R
            </Button>
          )}
          {isEditDisabled && paymentStatus === "cleared" && isAdmin && (
            <Button
              className="w-[130px] h-[35px] bg-button-primary ml-3"
              size="sm"
              onClick={() => setOpenReverse(true)}
            >
              Bounce Check
            </Button>
          )}
          {/* <Button
            className="w-[130px] h-[35px] bg-button-neutral ml-3"
            size="sm"
            color="neutral"
          >
            <LocalPrintshopIcon className="mr-2" />
            Print
          </Button> */}
        </div>
      </div>
      {isFetching ? (
        <FormLoadingSkeleton />
      ) : (
        <>
          <ARFormDetails
            openEdit={openEdit}
            selectedRow={selectedRow}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            fetchARByCustomer={fetchARByCustomer}
            status={status}
            setStatus={setStatus}
            transactionDate={transactionDate}
            setTransactionDate={setTransactionDate}
            remarks={remarks}
            setRemarks={setRemarks}
            isEditDisabled={isEditDisabled}
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
            checkDate={checkDate}
            setCheckDate={setCheckDate}
            checkNumber={checkNumber}
            setCheckNumber={setCheckNumber}
            amountPaid={amountPaid}
            setAmountPaid={setAmountPaid}
            addAmount1={addAmount1}
            addAmount2={addAmount2}
            addAmount3={addAmount3}
            setAddAmount1={setAddAmount1}
            setAddAmount2={setAddAmount2}
            setAddAmount3={setAddAmount3}
            lessAmount={lessAmount}
            setLessAmount={setLessAmount}
            totalApplied={totalApplied}
            paymentAmount={paymentAmount}
            refNo={refNo}
            setRefNo={setRefNo}
            paymentStatus={paymentStatus}
            selectedCDR={selectedCDR}
            setSelectedCDR={setSelectedCDR}
            cdrNumbers={cdrNumbers}
            outstandingTrans={outstandingTrans}
            setOutstandingTrans={setOutstandingTrans}
          />
          <ARFormTable
            outstandingTrans={outstandingTrans}
            setOutstandingTrans={setOutstandingTrans}
            selectedRow={selectedRow}
            openEdit={openEdit}
            isLoadingItems={isLoadingItems}
            isEditDisabled={isEditDisabled}
            selectedCDR={selectedCDR}
          />
          <div className="flex justify-end mt-4">
            <Button
              sx={{
                ml: 2,
                width: "130px",
              }}
              className="w-[130px]"
              size="sm"
              variant="outlined"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              <DoDisturbIcon className="mr-2" />
              {hasSaved || isEditDisabled ? "Go Back" : "Cancel"}
            </Button>
            {!hasSaved && !isEditDisabled && (
              <Button
                type="submit"
                sx={{
                  ml: 2,
                  width: "130px",
                }}
                className="bg-button-primary"
                size="sm"
                loading={isSaving}
              >
                <SaveIcon className="mr-2" />
                Save
              </Button>
            )}
          </div>
        </>
      )}

      <ReverseARModal
        open={openReverse}
        setOpen={setOpenReverse}
        title="Bounce Check"
        onDelete={onReverse}
        reverseReason={reversalReason}
        setReverseReason={setReversalReason}
      />
    </form>
  );
};

export default ARForm;
