import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import { Button, Box } from "@mui/joy";
import type { ArchiveModalProps } from "../../interface";
import { useState } from "react";

const ArchiveConfirmModal = ({
  open,
  setOpen,
  transactionType,
  onArchive,
}: ArchiveModalProps): JSX.Element => {
  const [isArchiving, setIsArchiving] = useState(false);
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        setOpen(false);
      }}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <div>
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: 500,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Box>
            <h4 className="mb-6">Hide {transactionType}</h4>
            <div className="mb-7">
              <p className="text-sm">
                Are you sure you want to hide this {transactionType}?
              </p>
            </div>
            <div className="flex justify-end mt-5">
              <Button
                size="sm"
                variant="outlined"
                sx={{ ml: 2, width: 130 }}
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                sx={{ ml: 2, width: 130 }}
                className="bg-button-warning"
                color="warning"
                size="sm"
                loading={isArchiving}
                onClick={async () => {
                  setIsArchiving(true);
                  await onArchive();
                  setIsArchiving(false);
                  setOpen(false);
                }}
              >
                Hide
              </Button>
            </div>
          </Box>
        </Sheet>
      </div>
    </Modal>
  );
};

export default ArchiveConfirmModal;
