/**
 * QR code component using a reliable QR image service.
 * Generates a QR code via API and renders as an inline image.
 */

interface QRCodeSVGProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  bgColor?: string;
  fgColor?: string;
  marginSize?: number;
}

/**
 * QR code rendered via the qrserver.com API — no additional packages required.
 */
export function QRCodeSVG({
  value,
  size = 160,
  bgColor = "#ffffff",
  fgColor = "#1a1a1a",
  marginSize = 2,
}: QRCodeSVGProps) {
  const encodedUrl = encodeURIComponent(value);
  const margin = marginSize * 4;
  const qrSize = size - margin * 2;
  const fgHex = fgColor.replace("#", "");
  const bgHex = bgColor.replace("#", "");

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        padding: margin,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
      }}
    >
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedUrl}&color=${fgHex}&bgcolor=${bgHex}&ecc=H&format=svg`}
        alt="QR Code"
        width={qrSize}
        height={qrSize}
        style={{ display: "block" }}
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div style="width:${qrSize}px;height:${qrSize}px;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#666;font-size:12px;text-align:center;padding:8px;">Scan to visit site</div>`;
          }
        }}
      />
    </div>
  );
}

export function QRCodeCanvas(props: QRCodeSVGProps) {
  return <QRCodeSVG {...props} />;
}
