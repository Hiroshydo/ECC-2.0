"use client";

import { useState, useTransition } from "react";
import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { loadOfficialLogo } from "@/lib/branding";
import type { ReportData } from "@/lib/reports/data";

type CongregationOption = { congregationId: string; name: string; city: string };
const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString("pt-BR") : "Não informado";
const dateTime = (value: unknown) => value ? new Date(String(value)).toLocaleString("pt-BR") : "Não informado";
const periodLabel = (period: string) => new Date(`${period}-01T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const status = (value: unknown) => ({ open: "Aberto", closed: "Fechado", pending: "Pendente", requested: "Pendente", approved: "Aprovado", confirmed: "Confirmado", sent: "Enviado", questioned: "Questionado", cancelled: "Cancelado", posted: "Registrado" }[String(value)] ?? "Sem informação");
const entity = (value: unknown) => ({ entries: "Entrada", expenses: "Despesa", headquarters_transfers: "Repasse", financial_adjustments: "Ajuste", financial_reversals: "Estorno", physical_cash_movements: "Movimentação de caixa", monthly_closings: "Fechamento" }[String(value)] ?? "Registro");
const action = (value: unknown) => ({ created: "Registro criado", approved: "Registro aprovado", requested: "Repasse solicitado", confirmed: "Repasse confirmado", opened: "Caixa aberto", closed: "Período financeiro fechado", posted: "Ajuste financeiro registrado" }[String(value)] ?? "Ação registrada");
const payment = (value: unknown) => ({ cash: "Dinheiro", pix: "Pix", transfer: "Transferência", card: "Cartão", check: "Cheque", other: "Outro" }[String(value)] ?? "Não informado");
const movement = (value: unknown) => ({ cash_in: "Entrada de dinheiro", cash_expense: "Saída de dinheiro", deposit: "Depósito" }[String(value)] ?? "Movimentação");
const filePart = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function rows(data: ReportData) {
  return {
    Resumo: [{ Item: "Saldo inicial", Valor: money(data.summary.openingBalance) }, { Item: "Entradas", Valor: money(data.summary.entries) }, { Item: "Despesas", Valor: money(data.summary.expenses) }, { Item: "Repasses", Valor: money(data.summary.transfers) }, { Item: "Ajustes", Valor: money(data.summary.adjustments) }, { Item: "Estornos", Valor: money(data.summary.reversals) }, { Item: "Saldo final", Valor: money(data.summary.closingBalance) }],
    Entradas: data.entries.map((item) => ({ Data: date(item.occurred_on), Categoria: item.category, Origem: item.origin, "Forma de recebimento": payment(item.payment_method), Finalidade: item.purpose ?? "", Valor: money(Number(item.amount_cents)) })),
    Despesas: data.expenses.map((item) => ({ Data: date(item.occurred_on), Categoria: item.category, Descrição: item.description, Fornecedor: item.vendor ?? "", "Forma de pagamento": payment(item.payment_method), Finalidade: item.purpose ?? "", "Centro de custo": item.cost_center ?? "", Valor: money(Number(item.amount_cents)), Status: status(item.status) })),
    Repasses: data.transfers.map((item) => ({ Data: date(item.occurred_on), Destino: item.destination_name, Período: periodLabel(String(item.reference_period).slice(0, 7)), Motivo: item.reason, "Valor enviado": money(Number(item.amount_sent_cents ?? 0)), "Valor recebido": money(Number(item.amount_received_cents ?? 0)), Status: status(item.status) })),
    Ajustes: data.adjustments.map((item) => ({ Data: dateTime(item.created_at), Motivo: item.reason, Tipo: entity(item.entity_type), Valor: money(Number(item.amount_cents)), Responsável: data.responsible ?? "Não informado", Status: status(item.status) })),
    Estornos: data.reversals.map((item) => ({ Data: dateTime(item.created_at), "Registro relacionado": entity(item.entity_type), Motivo: item.reason, Valor: money(Number(item.amount_cents)), Responsável: data.responsible ?? "Não informado", Status: status(item.status) })),
    Caixa: data.cashMovements.map((item) => ({ Data: dateTime(item.created_at), Tipo: movement(item.movement_type), Motivo: item.reason, Entrada: item.movement_type === "cash_in" ? money(Number(item.amount_cents)) : money(0), Saída: item.movement_type === "cash_in" ? money(0) : money(Number(item.amount_cents)), Saldo: "" })),
    Fechamento: data.closing ? [{ Período: periodLabel(data.period), Status: status(data.closing.status), "Saldo final": money(data.summary.closingBalance), "Data do fechamento": dateTime(data.closing.closing_at), Responsável: data.responsible ?? "Não informado" }] : [],
    Auditoria: data.audit.map((item) => ({ Data: date(item.occurred_at), Hora: new Date(String(item.occurred_at)).toLocaleTimeString("pt-BR"), Responsável: data.responsible ?? "Não informado", Ação: action(item.action), "Registro relacionado": entity(item.entity), Resultado: item.reason ?? "Concluído" })),
  };
}

async function downloadPdf(data: ReportData) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const logo = await loadOfficialLogo();
  const margin = 42;
  const pageWidth = 595;
  const contentWidth = pageWidth - margin * 2;
  const pageBottom = 782;
  let y = 52;
  const footer = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(113, 129, 125);
    pdf.text(`Ecclesia Finance · Prestação de Contas Financeira · ${data.congregation.name} · ${periodLabel(data.period)}`, margin, 814);
    pdf.text(`Página ${pdf.getNumberOfPages()}`, pageWidth - margin - 44, 814, { align: "right" });
  };
  const addPageHeader = () => {
    pdf.setFillColor(40, 123, 101);
    pdf.rect(0, 0, pageWidth, 7, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(40, 123, 101);
    pdf.text("ECCLESIA FINANCE", margin, 28);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(113, 129, 125);
    pdf.text(`Prestação de Contas Financeira · ${data.congregation.name} · ${data.congregation.city} · ${periodLabel(data.period)}`, margin, 40);
    y = 60;
  };
  const page = () => { footer(); pdf.addPage(); addPageHeader(); };
  const section = (title: string) => {
    if (y + 92 > pageBottom) page();
    y += 12;
    pdf.setFillColor(40, 123, 101);
    pdf.rect(margin, y, 4, 18, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(23, 48, 43);
    pdf.text(title.toUpperCase(), margin + 12, y + 13);
    y += 30;
  };
  type Column = { key: string; label: string; min: number; weight: number; align?: "left" | "right" };
  const table = (title: string, columns: Column[], items: Array<Record<string, unknown>>) => {
    section(title);
    const minimumTotal = columns.reduce((sum, column) => sum + column.min, 0);
    const availableExtra = Math.max(0, contentWidth - minimumTotal);
    const totalWeight = columns.reduce((sum, column) => sum + column.weight, 0);
    const columnWidths = columns.map((column) => column.min + availableExtra * column.weight / totalWeight);
    const drawRow = (values: string[], header = false) => {
      const fontSize = header ? 7.7 : 7.6;
      const lineHeight = fontSize + 2;
      const wrapped = values.map((value, index) => pdf.splitTextToSize(value, columnWidths[index] - 8));
      const rowHeight = header ? 25 : Math.max(28, Math.min(64, Math.max(...wrapped.map((lines) => lines.length)) * lineHeight + 11));
      if (y + rowHeight > pageBottom) { page(); section(title); drawRow(columns.map((column) => column.label), true); }
      let x = margin;
      values.forEach((value, index) => {
        pdf.setFillColor(header ? 40 : 250, header ? 123 : 253, header ? 101 : 252);
        pdf.setDrawColor(223, 233, 228);
        pdf.rect(x, y, columnWidths[index], rowHeight, "FD");
        pdf.setFont("helvetica", header ? "bold" : "normal");
        pdf.setFontSize(fontSize);
        pdf.setTextColor(header ? 255 : 49, header ? 255 : 83, header ? 255 : 75);
        const lines = pdf.splitTextToSize(value, columnWidths[index] - 8);
        const align = columns[index].align ?? "left";
        pdf.text(lines.slice(0, 4), align === "right" ? x + columnWidths[index] - 4 : x + 4, y + (header ? 15 : 12), { align, maxWidth: columnWidths[index] - 8 });
        x += columnWidths[index];
      });
      y += rowHeight;
    };
    drawRow(columns.map((column) => column.label), true);
    if (items.length) items.forEach((item) => drawRow(columns.map((column) => String(item[column.key] ?? ""))));
    else { pdf.setFont("helvetica", "italic"); pdf.setFontSize(8); pdf.setTextColor(113, 129, 125); pdf.text("Nenhum registro disponível para este período.", margin + 8, y + 17); y += 30; }
    y += 16;
  };
  const reportTables = {
    Entradas: data.entries.map((item) => ({ Data: date(item.occurred_on), Categoria: String(item.category ?? ""), Origem: String(item.origin ?? ""), Recebimento: payment(item.payment_method), Finalidade: String(item.purpose ?? ""), Valor: money(Number(item.amount_cents)) })),
    Despesas: data.expenses.map((item) => ({ Data: date(item.occurred_on), Categoria: String(item.category ?? ""), Descrição: String(item.description ?? ""), Fornecedor: String(item.vendor ?? ""), Pagamento: payment(item.payment_method), Finalidade: String(item.purpose ?? ""), "Centro de custo": String(item.cost_center ?? ""), Valor: money(Number(item.amount_cents)), Situação: status(item.status) })),
    Repasses: data.transfers.map((item) => ({ Data: date(item.occurred_on), Destino: String(item.destination_name ?? ""), Período: periodLabel(String(item.reference_period ?? "").slice(0, 7)), Motivo: String(item.reason ?? ""), Enviado: money(Number(item.amount_sent_cents ?? 0)), Recebido: money(Number(item.amount_received_cents ?? 0)), Situação: status(item.status) })),
    Ajustes: data.adjustments.map((item) => ({ Data: dateTime(item.created_at), Tipo: entity(item.entity_type), Motivo: String(item.reason ?? ""), Valor: money(Number(item.amount_cents)), Responsável: data.responsible ?? "Não informado" })),
    Estornos: data.reversals.map((item) => ({ Data: dateTime(item.created_at), Relacionado: entity(item.entity_type), Motivo: String(item.reason ?? ""), Valor: money(Number(item.amount_cents)), Responsável: data.responsible ?? "Não informado" })),
    Caixa: data.cashMovements.map((item) => ({ Data: dateTime(item.created_at), Tipo: movement(item.movement_type), Motivo: String(item.reason ?? ""), Entrada: item.movement_type === "cash_in" ? money(Number(item.amount_cents)) : "R$ 0,00", Saída: item.movement_type === "cash_in" ? "R$ 0,00" : money(Number(item.amount_cents)), Saldo: "Não informado" })),
    Auditoria: data.audit.map((item) => ({ Data: date(item.occurred_at), Hora: new Date(String(item.occurred_at)).toLocaleTimeString("pt-BR"), Responsável: data.responsible ?? "Não informado", Ação: action(item.action), Relacionado: entity(item.entity) })),
  };
  pdf.setFillColor(40, 123, 101); pdf.rect(0, 0, pageWidth, 9, "F");
  if (logo) { const logoWidth = 150; pdf.addImage(logo.dataUri, "PNG", margin, y, logoWidth, logoWidth / 3, undefined, "FAST"); y += logoWidth / 3 + 28; }
  pdf.setFont("helvetica", "bold"); pdf.setTextColor(23, 48, 43); pdf.setFontSize(23); pdf.text("PRESTAÇÃO DE CONTAS FINANCEIRA", margin, y); y += 28;
  pdf.setFontSize(14); pdf.text(data.congregation.name, margin, y); y += 18;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.text(data.congregation.city, margin, y); y += 16; pdf.text(`Período: ${periodLabel(data.period)}`, margin, y); y += 16; pdf.text(`Gerado em: ${dateTime(data.generatedAt)}`, margin, y); y += 16; pdf.text(`Responsável: ${data.responsible ?? "Não informado"}`, margin, y); y += 24;
  const summaryRows = Object.entries({ "Saldo inicial": data.summary.openingBalance, Entradas: data.summary.entries, Despesas: data.summary.expenses, Repasses: data.summary.transfers, Ajustes: data.summary.adjustments, Estornos: data.summary.reversals, "Saldo final": data.summary.closingBalance }).map(([label, value]) => ({ Descrição: label, Valor: money(value) }));
  table("Visão geral financeira", [{ key: "Descrição", label: "Descrição", min: 270, weight: 2 }, { key: "Valor", label: "Valor", min: 125, weight: 1, align: "right" }], summaryRows);
  table("Entradas", [{ key: "Data", label: "Data", min: 54, weight: 1 }, { key: "Categoria", label: "Categoria", min: 62, weight: 1 }, { key: "Origem", label: "Origem", min: 82, weight: 2 }, { key: "Recebimento", label: "Recebimento", min: 72, weight: 1.4 }, { key: "Finalidade", label: "Finalidade", min: 82, weight: 2 }, { key: "Valor", label: "Valor", min: 72, weight: 1, align: "right" }], reportTables.Entradas);
  table("Despesas", [{ key: "Data", label: "Data", min: 48, weight: 1 }, { key: "Categoria", label: "Categoria", min: 56, weight: 1 }, { key: "Descrição", label: "Descrição", min: 70, weight: 1.5 }, { key: "Fornecedor", label: "Fornecedor", min: 62, weight: 1.2 }, { key: "Pagamento", label: "Pagamento", min: 65, weight: 1.2 }, { key: "Finalidade", label: "Finalidade", min: 62, weight: 1.2 }, { key: "Centro de custo", label: "Centro de custo", min: 62, weight: 1.2 }, { key: "Valor", label: "Valor", min: 68, weight: 1, align: "right" }, { key: "Situação", label: "Situação", min: 62, weight: 1 }], reportTables.Despesas);
  table("Repasses", [{ key: "Data", label: "Data", min: 52, weight: 1 }, { key: "Destino", label: "Destino", min: 75, weight: 1.4 }, { key: "Período", label: "Período", min: 68, weight: 1.2 }, { key: "Motivo", label: "Motivo", min: 90, weight: 2 }, { key: "Enviado", label: "Valor enviado", min: 73, weight: 1, align: "right" }, { key: "Recebido", label: "Valor recebido", min: 73, weight: 1, align: "right" }, { key: "Situação", label: "Situação", min: 62, weight: 1 }], reportTables.Repasses);
  table("Ajustes", [{ key: "Data", label: "Data", min: 75, weight: 1 }, { key: "Tipo", label: "Tipo", min: 62, weight: 1 }, { key: "Motivo", label: "Motivo", min: 150, weight: 2 }, { key: "Valor", label: "Valor", min: 72, weight: 1, align: "right" }, { key: "Responsável", label: "Responsável", min: 110, weight: 1.5 }], reportTables.Ajustes);
  table("Estornos", [{ key: "Data", label: "Data", min: 75, weight: 1 }, { key: "Relacionado", label: "Registro relacionado", min: 105, weight: 1.4 }, { key: "Motivo", label: "Motivo", min: 150, weight: 2 }, { key: "Valor", label: "Valor", min: 72, weight: 1, align: "right" }, { key: "Responsável", label: "Responsável", min: 110, weight: 1.5 }], reportTables.Estornos);
  table("Caixa", [{ key: "Data", label: "Data", min: 75, weight: 1 }, { key: "Tipo", label: "Tipo", min: 88, weight: 1.2 }, { key: "Motivo", label: "Motivo", min: 145, weight: 2 }, { key: "Entrada", label: "Entrada", min: 72, weight: 1, align: "right" }, { key: "Saída", label: "Saída", min: 72, weight: 1, align: "right" }, { key: "Saldo", label: "Saldo", min: 72, weight: 1, align: "right" }], reportTables.Caixa);
  table("Fechamento", [{ key: "Período", label: "Período", min: 150, weight: 1.5 }, { key: "Situação", label: "Situação", min: 100, weight: 1 }, { key: "Saldo final", label: "Saldo final", min: 110, weight: 1, align: "right" }], data.closing ? [{ Período: periodLabel(data.period), Situação: status(data.closing.status), "Saldo final": money(data.summary.closingBalance) }] : []);
  if (data.closing) { section("Informações do fechamento"); table("Detalhes", [{ key: "Informação", label: "Informação", min: 170, weight: 1 }, { key: "Valor", label: "Valor", min: 220, weight: 2 }], [{ Informação: "Data do fechamento", Valor: dateTime(data.closing.closing_at) }, { Informação: "Responsável", Valor: data.responsible ?? "Não informado" }]); }
  table("Auditoria resumida", [{ key: "Data", label: "Data", min: 58, weight: 1 }, { key: "Hora", label: "Hora", min: 48, weight: 1 }, { key: "Responsável", label: "Responsável", min: 125, weight: 2 }, { key: "Ação", label: "Ação", min: 135, weight: 2 }, { key: "Relacionado", label: "Registro relacionado", min: 120, weight: 1.5 }], reportTables.Auditoria);
  pdf.addPage(); addPageHeader();
  section("Declaração");
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.setTextColor(23, 48, 43); pdf.text(pdf.splitTextToSize("Este documento apresenta os registros financeiros disponíveis para a congregação e o período informados.", contentWidth), margin, y); y += 58;
  section("Responsáveis pela prestação de contas");
  pdf.setFontSize(10); pdf.setTextColor(113, 129, 125); pdf.text(pdf.splitTextToSize("Declaro, para os devidos fins, que as informações apresentadas neste documento correspondem aos registros financeiros disponíveis para o período informado.", contentWidth), margin, y); y += 62;
  const signatureWidth = (contentWidth - 22) / 2;
  const signatureBlock = (x: number, title: string, name: string) => { pdf.setDrawColor(223, 233, 228); pdf.setFillColor(250, 253, 252); pdf.roundedRect(x, y, signatureWidth, 170, 6, 6, "FD"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(40, 123, 101); pdf.text(title, x + 14, y + 20); pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(23, 48, 43); pdf.text("Assinatura:", x + 14, y + 58); pdf.line(x + 14, y + 78, x + signatureWidth - 14, y + 78); pdf.text(`Nome: ${name}`, x + 14, y + 108); pdf.text("Cargo: __________________________________", x + 14, y + 130); pdf.text("Data: ____/____/________", x + 14, y + 152); };
  signatureBlock(margin, "RESPONSÁVEL PELA GESTÃO FINANCEIRA", data.responsible ? "" : "________________________________"); signatureBlock(margin + signatureWidth + 22, "RESPONSÁVEL PASTORAL", "________________________________");
  for (let pageNumber = 1; pageNumber <= pdf.getNumberOfPages(); pageNumber += 1) { pdf.setPage(pageNumber); footer(); }
  pdf.save(`ecclesia-finance-prestacao-de-contas-${filePart(data.congregation.name)}-${filePart(periodLabel(data.period))}.pdf`);
}

async function downloadExcel(data: ReportData) {
  const workbook = new ExcelJS.Workbook();
  const logo = await loadOfficialLogo();
  const sheetRows = rows(data);
  const summary = workbook.addWorksheet("Resumo"); summary.columns = [{ width: 38 }, { width: 30 }]; if (logo) { const imageId = workbook.addImage({ base64: logo.base64, extension: "png" } as never); summary.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 150, height: 50 } }); } summary.mergeCells("A3:B3"); summary.getCell("A3").value = "ECCLESIA FINANCE"; summary.getCell("A4").value = "PRESTAÇÃO DE CONTAS FINANCEIRA"; summary.getCell("A5").value = "Congregação"; summary.getCell("B5").value = data.congregation.name; summary.getCell("A6").value = "Cidade"; summary.getCell("B6").value = data.congregation.city; summary.getCell("A7").value = "Período"; summary.getCell("B7").value = periodLabel(data.period); summary.getCell("A8").value = "Gerado em"; summary.getCell("B8").value = dateTime(data.generatedAt); summary.getCell("A9").value = "Responsável"; summary.getCell("B9").value = data.responsible ?? "Não informado"; summary.getCell("A11").value = "RESUMO FINANCEIRO"; sheetRows.Resumo.forEach((item, index) => { summary.getCell(`A${12 + index}`).value = item.Item; summary.getCell(`B${12 + index}`).value = item.Valor; }); summary.getCell("A21").value = "SITUAÇÃO DO PERÍODO"; summary.getCell("A22").value = "Período"; summary.getCell("B22").value = periodLabel(data.period); summary.getCell("A23").value = "Status"; summary.getCell("B23").value = status(data.summary.status); summary.getCell("A24").value = "Data do fechamento"; summary.getCell("B24").value = dateTime(data.closing?.closing_at); summary.getCell("A25").value = "Saldo final"; summary.getCell("B25").value = money(data.summary.closingBalance); summary.getCell("A27").value = "Responsável pela Administração Financeira"; summary.getCell("B27").value = data.responsible ?? "Nome não disponível"; summary.getCell("A28").value = "Responsável Pastoral"; summary.getCell("B28").value = "Nome não disponível para configuração"; summary.views = [{ state: "frozen", ySplit: 3 }];
  summary.eachRow((row, rowNumber) => { row.eachCell((cell) => { cell.font = { name: "Arial", size: rowNumber <= 4 || rowNumber === 11 || rowNumber === 21 ? 12 : 10, bold: rowNumber <= 4 || rowNumber === 11 || rowNumber === 21 || rowNumber === 25 }; cell.alignment = { vertical: "middle" }; }); });
  Object.entries(sheetRows).slice(1).forEach(([name, items]) => {
    const headers = Object.keys(items[0] ?? {});
    const sheet = workbook.addWorksheet(name); sheet.columns = headers.map((key) => ({ header: key, key, width: Math.min(34, Math.max(14, key.length + 4)) })); sheet.insertRow(1, [name.toUpperCase()]); sheet.insertRow(2, [data.congregation.name]); sheet.insertRow(3, [`Período: ${periodLabel(data.period)}`]); sheet.spliceRows(5, 0, headers); items.forEach((item) => sheet.addRow(item)); sheet.mergeCells(1, 1, 1, Math.max(headers.length, 1)); sheet.getRow(1).font = { bold: true, size: 14, color: { argb: "287B65" } }; sheet.getRow(5).font = { bold: true, color: { argb: "FFFFFF" } }; sheet.getRow(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "287B65" } }; sheet.autoFilter = { from: { row: 5, column: 1 }, to: { row: Math.max(sheet.rowCount, 5), column: Math.max(headers.length, 1) } }; sheet.views = [{ state: "frozen", ySplit: 5 }]; sheet.pageSetup = { orientation: headers.length > 6 ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "5:5", margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
  });
  const buffer = await workbook.xlsx.writeBuffer(); const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `prestacao-de-contas-${data.period}.xlsx`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function ReportSummary({ initialData, congregations }: { initialData: ReportData; congregations: CongregationOption[] }) {
  const [data, setData] = useState(initialData);
  const [congregationId, setCongregationId] = useState(initialData.congregation.name);
  const [period, setPeriod] = useState(initialData.period);
  const [type, setType] = useState("financeiro");
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [pending, startTransition] = useTransition();
  const selectedId = congregations.find((item) => item.name === congregationId)?.congregationId;

  function load() { if (!selectedId) return; startTransition(async () => { try { const response = await fetch(`/api/reports?congregationId=${encodeURIComponent(selectedId)}&period=${encodeURIComponent(period)}`); const result = await response.json() as { data?: ReportData; error?: string }; if (!response.ok) throw new Error(result.error); setData(result.data as ReportData); setMessage("Prestação atualizada."); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível carregar a prestação."); } }); }
  async function exportPdf() { setMessage(null); setExporting("pdf"); try { await downloadPdf(data); setMessage("PDF gerado com sucesso."); } catch { setMessage("Não foi possível gerar o PDF. Tente novamente."); } finally { setExporting(null); } }
  async function exportExcel() { setMessage(null); setExporting("excel"); try { await downloadExcel(data); setMessage("Excel gerado com sucesso."); } catch { setMessage("Não foi possível gerar o Excel. Tente novamente."); } finally { setExporting(null); } }
  return <section className="reports-page"><div className="module-actions"><div style={{ display: "flex", alignItems: "center", gap: 16 }}><ModuleIcon module="sefer" size={56} decorative={false} /><div><p className="eyebrow">PRESTAÇÃO DE CONTAS</p><h1>Relatórios</h1><p>Gere uma visão clara e rastreável da vida financeira da congregação.</p></div></div><div className="report-actions"><button className="secondary-button" disabled={pending || exporting !== null} onClick={exportPdf}>{exporting === "pdf" ? "Gerando PDF..." : "Baixar PDF"}</button><button className="primary-button" disabled={pending || exporting !== null} onClick={exportExcel}>{exporting === "excel" ? "Gerando Excel..." : "Baixar Excel"}</button></div></div>
    <div className="report-filters"><label>Congregação<select value={congregationId} onChange={(event) => setCongregationId(event.target.value)}>{congregations.map((item) => <option key={item.congregationId}>{item.name}</option>)}</select></label><label>Período<input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} /></label><label>Tipo de relatório<select value={type} onChange={(event) => setType(event.target.value)}><option value="financeiro">Prestação financeira</option></select></label><button className="primary-button" disabled={pending} onClick={load}>{pending ? "Carregando..." : "Visualizar prestação"}</button></div>
    {message && <div className="notice success">{message}</div>}
    <div className="report-heading"><div><span className="report-brand">{data.organization}</span><h2>Prestação de Contas Financeira</h2><p>{data.congregation.name} · {data.congregation.city} · {periodLabel(data.period)}</p></div><span className="pill">{status(data.summary.status)}</span></div>
    <div className="report-metrics">{[["Saldo inicial", data.summary.openingBalance, "blue"], ["Entradas", data.summary.entries, "green"], ["Despesas", data.summary.expenses, "coral"], ["Repasses", data.summary.transfers, "gold"], ["Ajustes", data.summary.adjustments, "green"], ["Estornos", data.summary.reversals, "coral"], ["Saldo final", data.summary.closingBalance, "blue"]].map(([label, value, tone]) => <article className={`metric ${tone}`} key={String(label)}><small>{label}</small><strong>{money(Number(value))}</strong><span>Valor oficial do período</span></article>)}</div>
    <div className="report-preview panel"><div className="panel-title"><div><h2>Resumo financeiro</h2><p>Esta prévia e os arquivos exportados usam o mesmo conjunto de dados.</p></div><span className="report-generated">Gerado em {dateTime(data.generatedAt)}</span></div><div className="report-summary-lines">{rows(data).Resumo.map((item) => <div key={item.Item}><span>{item.Item}</span><strong>{item.Valor}</strong></div>)}</div></div>
  </section>;
}
