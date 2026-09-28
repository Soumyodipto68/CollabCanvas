import { toast } from "react-hot-toast";

interface ConfirmToastOptions {
  message: string;
  confirmLabel: string;
  successMessage: string;
  errorMessage: string;
  onConfirm: () => Promise<void>;
}

export function confirmToast({
  message,
  confirmLabel,
  successMessage,
  errorMessage,
  onConfirm,
}: ConfirmToastOptions) {
  toast.custom(
    (currentToast) => {
      const handleConfirm = async () => {
        toast.dismiss(currentToast.id);

        try {
          await onConfirm();
          toast.success(successMessage);
        } catch (error) {
          console.error(error);
          toast.error(errorMessage);
        }
      };

      return (
        <div className="w-[min(92vw,440px)] rounded-lg border border-[#3b514e] bg-[#10191a] p-5 text-[#e7efec] shadow-xl" role="group" aria-label="Confirm board action">
          <p className="text-base font-semibold leading-6">{message}</p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => toast.dismiss(currentToast.id)}
              className="min-h-10 rounded border border-[#3b514e] px-4 py-2 text-sm font-semibold text-[#c2cfca] transition hover:bg-[#172120]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              className="min-h-10 rounded bg-[#fb8057] px-4 py-2 text-sm font-semibold text-[#171d1b] transition hover:bg-[#ff9976]"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      );
    },
    { duration: Infinity, position: "top-center" },
  );
}