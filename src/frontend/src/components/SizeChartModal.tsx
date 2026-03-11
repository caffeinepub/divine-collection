import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
}

export function SizeChartModal({ open, onClose }: SizeChartModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="sizechart.dialog"
        showCloseButton={false}
        className="p-0 overflow-hidden border border-border rounded-none max-w-[calc(100%-2rem)] sm:max-w-xl bg-card gap-0"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          Size Chart — Divine Collection
        </DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary">
          <p className="font-display font-semibold text-sm uppercase tracking-widest text-card-foreground">
            Size Chart
          </p>
          <button
            type="button"
            data-ocid="sizechart.close_button"
            onClick={onClose}
            aria-label="Close size chart"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border/60 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Size chart image */}
        <div className="p-4">
          <img
            src="/assets/generated/size-chart-divine-collection.dim_600x400.png"
            alt="Divine Collection size chart — Suits, Kurties and Co-ord Sets — sizes M, L, XL, XXL"
            className="w-full h-auto object-contain rounded-sm"
          />
        </div>

        {/* Footer hint */}
        <p className="px-5 pb-4 text-[11px] text-muted-foreground text-center">
          Sizes available: M · L · XL · XXL &nbsp;|&nbsp; Suits · Kurties ·
          Co-ord Sets
        </p>
      </DialogContent>
    </Dialog>
  );
}
