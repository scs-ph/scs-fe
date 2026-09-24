import React from "react";
import { Chip } from "@mui/joy";

interface StatusChipProps {
  status: string;
  label?: string;
}

export const getStatusColor = (
  status: string,
): "primary" | "success" | "warning" | "danger" | "neutral" => {
  switch (status.toLowerCase()) {
    case "posted":
      return "success";
    case "unposted":
      return "warning";
    case "cancelled":
      return "danger";
    case "archived":
      // Archiving only hides a posted record - it never undoes what the record
      // did. It reads as a variant of Posted, so it shares Posted's colour.
      return "success";
    default:
      return "primary";
  }
};

/**
 * Display name for a status value.
 *
 * "archived" is shown as "Posted (Hidden)" because the record is still posted -
 * archiving only hides it from the default list, it does not unpost or reverse
 * anything. Labelling it plain "Archived" made users read it as a cancellation.
 */
export const getStatusLabel = (status: string): string => {
  return status.toLowerCase() === "archived" ? "Posted (Hidden)" : status;
};

export const getStatusVariant = (
  status: string,
): "solid" | "soft" | "outlined" => {
  return status.toLowerCase() === "cancelled" ? "outlined" : "soft";
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  return (
    <Chip
      color={getStatusColor(status)}
      variant={getStatusVariant(status)}
      size="sm"
    >
      {(label ?? getStatusLabel(status)).toUpperCase()}
    </Chip>
  );
};

export const formatStatusText = (status: string): string => {
  return getStatusLabel(status).toUpperCase();
};

/**
 * Colour for an AR receipt's payment status.
 *
 * This is the money axis, separate from the record's own posted/hidden status:
 *   pending   - posted, but the check has not cleared yet
 *   cleared   - the money is in
 *   reversed  - the check bounced after clearing
 *   cancelled - the payment was voided before clearing
 */
export const getPaymentStatusColor = (
  paymentStatus: string,
): "primary" | "success" | "warning" | "danger" | "neutral" => {
  switch (paymentStatus.toLowerCase()) {
    case "cleared":
      return "success";
    case "pending":
      return "warning";
    case "reversed":
    case "cancelled":
      return "danger";
    default:
      return "primary";
  }
};

/**
 * Colour for an AR receipt's payment method.
 *
 * Not a state - just a category. Cash settles immediately, a check has to
 * clear first, so the two are worth telling apart at a glance.
 */
export const getPaymentMethodColor = (
  paymentMethod: string,
): "primary" | "success" | "warning" | "danger" | "neutral" => {
  return paymentMethod.toLowerCase() === "cash" ? "success" : "primary";
};

interface PaymentMethodChipProps {
  paymentMethod: string;
}

export const PaymentMethodChip: React.FC<PaymentMethodChipProps> = ({
  paymentMethod,
}) => {
  return (
    <Chip color={getPaymentMethodColor(paymentMethod)} variant="soft" size="sm">
      {paymentMethod.toUpperCase()}
    </Chip>
  );
};

interface PaymentStatusChipProps {
  paymentStatus: string;
}

export const PaymentStatusChip: React.FC<PaymentStatusChipProps> = ({
  paymentStatus,
}) => {
  return (
    <Chip
      color={getPaymentStatusColor(paymentStatus)}
      variant={getStatusVariant(paymentStatus)}
      size="sm"
    >
      {paymentStatus.toUpperCase()}
    </Chip>
  );
};

export const isTransactionCancelled = (status: string): boolean => {
  return status.toLowerCase() === "cancelled";
};

export const isTransactionPosted = (status: string): boolean => {
  return status.toLowerCase() === "posted";
};

export const canCancelTransaction = (status: string): boolean => {
  return isTransactionPosted(status) && !isTransactionCancelled(status);
};

// Stock Adjustment Type Helpers
export const getAdjustmentTypeColor = (
  adjustmentType: string,
): "success" | "danger" => {
  return adjustmentType === "surplus" ? "success" : "danger";
};

export const getAdjustmentTypeVariant = (): "solid" | "soft" => {
  return "soft";
};

interface AdjustmentTypeChipProps {
  adjustmentType: string;
}

export const AdjustmentTypeChip: React.FC<AdjustmentTypeChipProps> = ({
  adjustmentType,
}) => {
  const color = getAdjustmentTypeColor(adjustmentType);
  const label = adjustmentType === "surplus" ? "Surplus" : "Deficit";

  return (
    <Chip color={color} variant="soft" size="sm">
      {label}
    </Chip>
  );
};
