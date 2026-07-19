import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatIDR } from '../data/products';
import { ORDER_STATUS_META } from '../data/orderStatus';
import type { Transaction } from '../types/pos';

const PAYMENT_LABELS: Record<string, string> = {
  tunai: 'Tunai',
  qris: 'QRIS',
  kartu: 'Kartu',
  ewallet: 'E-Wallet',
};

function orderTypeLabel(t: Transaction): string {
  if (t.orderType === 'takeaway') return 'Bawa Pulang';
  if (t.tableNumber) return `Dine-in · Meja ${t.tableNumber}`;
  return t.orderType === 'dine-in' ? 'Dine-in' : '-';
}

function itemsLabel(t: Transaction): string {
  return t.items
    .map((i) => `${i.name} x${i.quantity}${i.note ? ` (${i.note})` : ''}`)
    .join('; ');
}

function timestampParts(ts: number) {
  const date = new Date(ts);
  return {
    date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

function buildSummary(transactions: Transaction[]) {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);
  const byStatus: Record<string, number> = {};
  transactions.forEach((t) => (byStatus[t.status] = (byStatus[t.status] ?? 0) + 1));
  return { totalRevenue, totalItems, totalTransactions: transactions.length, byStatus };
}

function reportFilename(ext: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `Laporan-Pesanan-SaungBaraya-${stamp}.${ext}`;
}

/**
 * Exports the given transactions to an .xlsx workbook with two sheets:
 * a per-order detail sheet and a summary sheet, then triggers a browser
 * download.
 */
export function exportTransactionsToExcel(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  const detailRows = sorted.map((t, idx) => {
    const { date, time } = timestampParts(t.timestamp);
    return {
      No: idx + 1,
      'ID Pesanan': t.id,
      Tanggal: date,
      Waktu: time,
      'Pelanggan / Kasir': t.customerName ?? t.cashierName,
      'Jenis Pesanan': orderTypeLabel(t),
      Item: itemsLabel(t),
      Subtotal: t.subtotal,
      Diskon: t.discount ?? 0,
      Pajak: Math.round(t.tax),
      Total: Math.round(t.total),
      'Metode Bayar': PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod,
      Status: ORDER_STATUS_META[t.status].label,
    };
  });

  const summary = buildSummary(sorted);
  const summaryRows = [
    { Ringkasan: 'Total Pendapatan', Nilai: summary.totalRevenue },
    { Ringkasan: 'Total Item Terjual', Nilai: summary.totalItems },
    { Ringkasan: 'Jumlah Transaksi', Nilai: summary.totalTransactions },
    { Ringkasan: '', Nilai: '' },
    ...Object.entries(summary.byStatus).map(([status, count]) => ({
      Ringkasan: `Status: ${ORDER_STATUS_META[status as keyof typeof ORDER_STATUS_META]?.label ?? status}`,
      Nilai: count,
    })),
    { Ringkasan: '', Nilai: '' },
    { Ringkasan: 'Dicetak pada', Nilai: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) },
  ];

  const wb = XLSX.utils.book_new();
  const detailSheet = XLSX.utils.json_to_sheet(detailRows);
  detailSheet['!cols'] = [
    { wch: 4 },
    { wch: 16 },
    { wch: 12 },
    { wch: 8 },
    { wch: 20 },
    { wch: 18 },
    { wch: 50 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, detailSheet, 'Riwayat Pesanan');

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan');

  XLSX.writeFile(wb, reportFilename('xlsx'));
}

/**
 * Exports the given transactions to a paginated PDF report (summary block
 * plus a detail table), then triggers a browser download.
 */
export function exportTransactionsToPDF(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  const summary = buildSummary(sorted);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFontSize(16);
  doc.text('Laporan Pesanan — Saung Baraya', 40, 40);
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Dicetak pada ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 40, 56);

  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(
    `Total Pendapatan: ${formatIDR(summary.totalRevenue)}    |    Item Terjual: ${summary.totalItems}    |    Jumlah Transaksi: ${summary.totalTransactions}`,
    40,
    76
  );

  const body = sorted.map((t, idx) => {
    const { date, time } = timestampParts(t.timestamp);
    return [
      String(idx + 1),
      t.id,
      `${date} ${time}`,
      t.customerName ?? t.cashierName,
      orderTypeLabel(t),
      itemsLabel(t),
      formatIDR(t.total),
      PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod,
      ORDER_STATUS_META[t.status].label,
    ];
  });

  autoTable(doc, {
    startY: 92,
    head: [['No', 'ID', 'Tanggal', 'Pelanggan/Kasir', 'Jenis', 'Item', 'Total', 'Bayar', 'Status']],
    body,
    styles: { fontSize: 7.5, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [201, 122, 43], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 62 },
      2: { cellWidth: 60 },
      3: { cellWidth: 70 },
      4: { cellWidth: 60 },
      5: { cellWidth: 220 },
      6: { cellWidth: 55 },
      7: { cellWidth: 42 },
      8: { cellWidth: 55 },
    },
    margin: { left: 40, right: 40 },
  });

  doc.save(reportFilename('pdf'));
}

function receiptFilename(orderId: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  const safeId = orderId.replace(/[^a-zA-Z0-9-]/g, '');
  return `Struk-SaungBaraya-${safeId}-${stamp}.pdf`;
}

/** Minimal shape needed to render a customer receipt — works for both a
 *  freshly-placed order (OrderSuccessModal) and a historical Transaction
 *  pulled from order history (CustomerDashboard). */
export interface ReceiptData {
  orderId: string;
  items: { name: string; quantity: number; price: number; note?: string }[];
  subtotal: number;
  tax: number;
  discount?: number;
  promoCode?: string | null;
  total: number;
  orderType?: 'dine-in' | 'takeaway';
  tableNumber?: string;
  paymentMethod: string;
  customerName?: string;
  timestamp: number;
  status?: string;
}

/**
 * Renders a single order as a narrow, receipt-style PDF (80mm thermal-paper
 * width) and triggers a browser download. Meant for customers to keep a
 * copy of their order — mirrors what's shown in OrderSuccessModal / the
 * order history card, but as a document they can save or print.
 */
export function exportReceiptToPDF(receipt: ReceiptData) {
  const PAGE_WIDTH = 227; // ~80mm thermal receipt width, in pt
  const MARGIN = 14;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  // Estimate page height from content so nothing gets cut off — a fixed
  // short page is exactly the "kepotong" problem we're avoiding here.
  const lineCount =
    10 + // header block (brand, title, order id, date, divider, order type/table, payment, divider)
    receipt.items.reduce((sum, i) => sum + 1 + (i.note ? 1 : 0), 0) +
    1 + // divider
    3 + // subtotal, discount?, tax
    (receipt.discount && receipt.discount > 0 ? 1 : 0) +
    3 + // divider, total, divider
    4; // footer lines
  const estimatedHeight = Math.max(320, lineCount * 14 + 120);

  const doc = new jsPDF({ unit: 'pt', format: [PAGE_WIDTH, estimatedHeight] });

  let y = 24;
  const centerX = PAGE_WIDTH / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Saung Baraya', centerX, y, { align: 'center' });
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90);
  doc.text('Rasa Asli Sunda & Betawi', centerX, y, { align: 'center' });
  y += 16;

  doc.setDrawColor(200);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(`Pesanan ${receipt.orderId}`, MARGIN, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90);
  const dateLabel = new Date(receipt.timestamp).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(dateLabel, MARGIN, y);
  y += 10;

  if (receipt.customerName) {
    doc.text(`Pelanggan: ${receipt.customerName}`, MARGIN, y);
    y += 10;
  }

  const orderTypeLabel =
    receipt.orderType === 'takeaway'
      ? 'Bawa Pulang'
      : receipt.tableNumber
        ? `Dine-in · Meja ${receipt.tableNumber}`
        : receipt.orderType === 'dine-in'
          ? 'Dine-in'
          : null;
  if (orderTypeLabel) {
    doc.text(orderTypeLabel, MARGIN, y);
    y += 10;
  }

  const paymentLabelMap: Record<string, string> = {
    tunai: 'Tunai di Kasir',
    qris: 'QRIS',
    kartu: 'Kartu',
    ewallet: 'E-Wallet',
  };
  doc.text(`Pembayaran: ${paymentLabelMap[receipt.paymentMethod] ?? receipt.paymentMethod}`, MARGIN, y);
  y += 10;

  if (receipt.status) {
    const statusLabel = ORDER_STATUS_META[receipt.status as keyof typeof ORDER_STATUS_META]?.label ?? receipt.status;
    doc.text(`Status: ${statusLabel}`, MARGIN, y);
    y += 10;
  }

  y += 4;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 14;

  // Line items
  doc.setFontSize(8);
  receipt.items.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20);
    const nameLines = doc.splitTextToSize(`${item.quantity}x ${item.name}`, CONTENT_WIDTH - 55);
    doc.text(nameLines, MARGIN, y);
    doc.text(formatIDR(item.price * item.quantity), PAGE_WIDTH - MARGIN, y, { align: 'right' });
    y += 11 * nameLines.length;

    if (item.note) {
      doc.setFontSize(7);
      doc.setTextColor(120);
      const noteLines = doc.splitTextToSize(`Catatan: ${item.note}`, CONTENT_WIDTH - 10);
      doc.text(noteLines, MARGIN + 6, y);
      y += 9 * noteLines.length;
      doc.setFontSize(8);
    }
  });

  y += 4;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 14;

  // Totals block
  doc.setFontSize(8);
  doc.setTextColor(60);
  doc.text('Subtotal', MARGIN, y);
  doc.text(formatIDR(receipt.subtotal), PAGE_WIDTH - MARGIN, y, { align: 'right' });
  y += 12;

  if (receipt.discount && receipt.discount > 0) {
    doc.setTextColor(90, 150, 100);
    const discountLabel = receipt.promoCode ? `Diskon (${receipt.promoCode})` : 'Diskon Promo';
    doc.text(discountLabel, MARGIN, y);
    doc.text(`-${formatIDR(receipt.discount)}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
    y += 12;
    doc.setTextColor(60);
  }

  doc.text('Pajak (10%)', MARGIN, y);
  doc.text(formatIDR(receipt.tax), PAGE_WIDTH - MARGIN, y, { align: 'right' });
  y += 10;

  y += 4;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text('TOTAL', MARGIN, y);
  doc.text(formatIDR(receipt.total), PAGE_WIDTH - MARGIN, y, { align: 'right' });
  y += 14;

  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110);
  doc.text('Terima kasih telah memesan di Saung Baraya!', centerX, y, { align: 'center' });
  y += 11;
  doc.text('Struk ini adalah bukti pembayaran yang sah.', centerX, y, { align: 'center' });

  doc.save(receiptFilename(receipt.orderId));
}
