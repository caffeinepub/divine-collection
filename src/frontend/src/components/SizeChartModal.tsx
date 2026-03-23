import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { sizeChartImg } from "../hooks/useQueries";

interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
}

export function SizeChartModal({ open, onClose }: SizeChartModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-4">
        <DialogTitle className="text-center font-display text-lg font-semibold mb-3">
          Size Chart
        </DialogTitle>
        <img src={sizeChartImg} alt="Size Chart" className="w-full rounded" />
      </DialogContent>
    </Dialog>
  );
}
