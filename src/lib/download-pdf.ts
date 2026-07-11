"use client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadPdf(
  element: HTMLElement,
  filename: string,
  pageSize?: string
): Promise<void> {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    format: pageSize === "Letter" ? "letter" : "a4",
    unit: "px",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const scaledW = canvas.width * ratio;
  const scaledH = canvas.height * ratio;
  const offsetX = (pageWidth - scaledW) / 2;
  const offsetY = (pageHeight - scaledH) / 2;
  pdf.addImage(imgData, "PNG", offsetX, offsetY, scaledW, scaledH);
  pdf.save(filename);
}
