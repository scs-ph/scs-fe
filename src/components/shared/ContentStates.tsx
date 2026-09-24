import type { ReactNode } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Skeleton from "@mui/joy/Skeleton";
import Typography from "@mui/joy/Typography";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

type TableLoadingCellKind = "text" | "number" | "status" | "actions";

export interface TableLoadingColumn {
  width?: number | string;
  kind?: TableLoadingCellKind;
  align?: "left" | "center" | "right";
  contentWidth?: number | string;
  actionCount?: number;
}

interface TableLoadingRowsProps {
  columns: number | readonly TableLoadingColumn[];
  rows?: number;
  numericColumns?: readonly number[];
  statusColumns?: readonly number[];
  actionColumn?: number;
  actionCount?: number;
}

export function TableLoadingRows({
  columns,
  rows = 7,
  numericColumns = [],
  statusColumns = [],
  actionColumn,
  actionCount = 2,
}: TableLoadingRowsProps): JSX.Element {
  const columnDefinitions: readonly TableLoadingColumn[] =
    typeof columns === "number"
      ? Array.from({ length: columns }, (_, index) => {
          if (index === actionColumn) {
            return {
              kind: "actions",
              align: "center",
              actionCount,
            };
          }
          if (statusColumns.includes(index)) {
            return { kind: "status", align: "center" };
          }
          if (numericColumns.includes(index)) {
            return { kind: "number", align: "right" };
          }
          return { kind: "text" };
        })
      : columns;

  return (
    <tbody aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex}>
          {columnDefinitions.map((column, columnIndex) => (
            <td
              key={columnIndex}
              style={{
                width: column.width,
                textAlign: column.align,
              }}
            >
              <TableLoadingCell
                column={column}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function TableLoadingCell({
  column,
  rowIndex,
  columnIndex,
}: {
  column: TableLoadingColumn;
  rowIndex: number;
  columnIndex: number;
}): JSX.Element {
  if (column.kind === "actions") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
        {Array.from({ length: column.actionCount ?? 2 }, (_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={index === 0 ? 42 : 50}
            height={28}
            sx={{ borderRadius: "sm" }}
          />
        ))}
      </Box>
    );
  }

  if (column.kind === "status") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            column.align === "right"
              ? "flex-end"
              : column.align === "center"
                ? "center"
                : "flex-start",
        }}
      >
        <Skeleton
          variant="rectangular"
          width={column.contentWidth ?? 88}
          height={22}
          sx={{ borderRadius: "xl" }}
        />
      </Box>
    );
  }

  const defaultWidth =
    column.kind === "number"
      ? 58
      : `${58 + ((rowIndex + columnIndex) % 4) * 8}%`;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          column.align === "right"
            ? "flex-end"
            : column.align === "center"
              ? "center"
              : "flex-start",
      }}
    >
      <Skeleton
        variant="text"
        level="body-sm"
        width={column.contentWidth ?? defaultWidth}
      />
    </Box>
  );
}

interface TableEmptyRowProps {
  colSpan: number;
  title: string;
  description: string;
  action?: ReactNode;
}

export function TableEmptyRow({
  colSpan,
  title,
  description,
  action,
}: TableEmptyRowProps): JSX.Element {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Box className="content-state" role="status">
          <InboxRoundedIcon color="disabled" />
          <Typography level="title-md">{title}</Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            {description}
          </Typography>
          {action}
        </Box>
      </td>
    </tr>
  );
}

interface TableErrorRowProps {
  colSpan: number;
  message: string;
  onRetry: () => void;
}

export function TableErrorRow({
  colSpan,
  message,
  onRetry,
}: TableErrorRowProps): JSX.Element {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Box className="content-state" role="alert">
          <Typography level="title-md">
            We couldn&apos;t load this list
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            {message}
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            startDecorator={<RefreshRoundedIcon />}
            onClick={onRetry}
          >
            Try again
          </Button>
        </Box>
      </td>
    </tr>
  );
}

export function FormLoadingSkeleton(): JSX.Element {
  return (
    <Box
      className="form-loading-skeleton"
      aria-busy="true"
      aria-label="Loading form"
    >
      <Box className="form-loading-skeleton__details">
        <Card variant="soft" color="neutral">
          <Skeleton variant="text" level="title-lg" width="32%" />
          <Box className="form-loading-skeleton__fields">
            {Array.from({ length: 8 }, (_, index) => (
              <Box key={index}>
                <Skeleton variant="text" level="body-xs" width="45%" />
                <Skeleton variant="rectangular" height={34} />
              </Box>
            ))}
          </Box>
        </Card>
        <Card variant="soft" color="neutral">
          <Skeleton variant="text" level="title-lg" width="58%" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="text" level="body-md" width="90%" />
          ))}
        </Card>
      </Box>
      <Card variant="outlined">
        <Skeleton variant="rectangular" height={220} />
      </Card>
    </Box>
  );
}

export function TablePageLoadingSkeleton(): JSX.Element {
  return (
    <Box
      className="page-loading-skeleton"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Box className="page-loading-skeleton__heading">
        <Skeleton variant="text" level="h2" width="min(18rem, 60%)" />
        <Skeleton variant="rectangular" width={130} height={36} />
      </Box>
      <Skeleton variant="rectangular" height={66} />
      <Skeleton variant="rectangular" height="min(28rem, 55dvh)" />
    </Box>
  );
}
