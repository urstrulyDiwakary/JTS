package com.app.service;

import com.app.entity.Billing;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateInvoicePdf(Billing billing) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Colors
        DeviceRgb primaryColor = new DeviceRgb(37, 99, 235);
        DeviceRgb grayColor = new DeviceRgb(107, 114, 128);
        DeviceRgb lightGray = new DeviceRgb(243, 244, 246);

        // Header - Company Info
        Paragraph companyName = new Paragraph("Jesta Tech Solutions")
                .setFontSize(24)
                .setBold()
                .setFontColor(primaryColor);
        document.add(companyName);

        Paragraph companyAddress = new Paragraph("Anantapur, Andhra Pradesh 515001\nPhone: +91 8520999351\nEmail: jestatechsolutions@gmail.com")
                .setFontSize(10)
                .setFontColor(grayColor);
        document.add(companyAddress);

        // Invoice Title
        Paragraph invoiceTitle = new Paragraph("INVOICE")
                .setFontSize(26)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(20);
        document.add(invoiceTitle);

        // Invoice Details Table
        Table invoiceDetailsTable = new Table(UnitValue.createPercentArray(new float[]{2, 3}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginTop(20);

        invoiceDetailsTable.addCell(createCell("Invoice Number:", true, false));
        invoiceDetailsTable.addCell(createCell(billing.getInvoiceNumber() != null ? billing.getInvoiceNumber() : "N/A", false, false));

        invoiceDetailsTable.addCell(createCell("Invoice Date:", true, false));
        invoiceDetailsTable.addCell(createCell(billing.getCreatedAt() != null ? billing.getCreatedAt().format(DATE_FORMATTER) : "N/A", false, false));

        invoiceDetailsTable.addCell(createCell("Due Date:", true, false));
        invoiceDetailsTable.addCell(createCell(billing.getDueDate() != null ? billing.getDueDate().format(DATE_FORMATTER) : "N/A", false, false));

        invoiceDetailsTable.addCell(createCell("Status:", true, false));
        invoiceDetailsTable.addCell(createCell(billing.getStatus() != null ? billing.getStatus() : "PENDING", false, false));

        document.add(invoiceDetailsTable);

        // Bill To Section
        Paragraph billToTitle = new Paragraph("Bill To:")
                .setFontSize(14)
                .setBold()
                .setMarginTop(30);
        document.add(billToTitle);

        Paragraph clientInfo = new Paragraph(billing.getClientName() != null ? billing.getClientName() : "N/A")
                .setFontSize(12)
                .setMarginBottom(20);
        document.add(clientInfo);

        // Items Table
        Table itemsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginTop(20);

        // Header Row
        itemsTable.addCell(createCell("Description", true, true).setBackgroundColor(primaryColor).setFontColor(ColorConstants.WHITE));
        itemsTable.addCell(createCell("Quantity", true, true).setBackgroundColor(primaryColor).setFontColor(ColorConstants.WHITE));
        itemsTable.addCell(createCell("Rate", true, true).setBackgroundColor(primaryColor).setFontColor(ColorConstants.WHITE));
        itemsTable.addCell(createCell("Amount", true, true).setBackgroundColor(primaryColor).setFontColor(ColorConstants.WHITE));

        // Item Row
        String notes = billing.getNotes() != null && !billing.getNotes().isEmpty() ? billing.getNotes() : "Professional Services";
        itemsTable.addCell(createCell(notes, false, false));
        itemsTable.addCell(createCell("1", false, false).setTextAlignment(TextAlignment.CENTER));
        itemsTable.addCell(createCell(formatCurrency(billing.getAmount()), false, false).setTextAlignment(TextAlignment.RIGHT));
        itemsTable.addCell(createCell(formatCurrency(billing.getAmount()), false, false).setTextAlignment(TextAlignment.RIGHT));

        // Subtotal Row
        itemsTable.addCell(createCell("", false, false).setBorder(null));
        itemsTable.addCell(createCell("", false, false).setBorder(null));
        itemsTable.addCell(createCell("Subtotal:", true, false).setTextAlignment(TextAlignment.RIGHT).setBorder(null));
        itemsTable.addCell(createCell(formatCurrency(billing.getAmount()), false, false).setTextAlignment(TextAlignment.RIGHT));

        // Tax Row (if applicable)
        BigDecimal tax = BigDecimal.ZERO;
        itemsTable.addCell(createCell("", false, false).setBorder(null));
        itemsTable.addCell(createCell("", false, false).setBorder(null));
        itemsTable.addCell(createCell("Tax (0%):", true, false).setTextAlignment(TextAlignment.RIGHT).setBorder(null));
        itemsTable.addCell(createCell(formatCurrency(tax), false, false).setTextAlignment(TextAlignment.RIGHT));

        // Total Row
        itemsTable.addCell(createCell("", false, false).setBorder(null));
        itemsTable.addCell(createCell("", false, false).setBorder(null));
        itemsTable.addCell(createCell("Total:", true, false).setTextAlignment(TextAlignment.RIGHT).setBorder(null).setFontSize(14));
        itemsTable.addCell(createCell(formatCurrency(billing.getAmount()), true, false)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(lightGray)
                .setFontSize(14));

        document.add(itemsTable);

        // Payment Info
        if (billing.getPaidDate() != null) {
            Paragraph paidInfo = new Paragraph("Payment Received: " + billing.getPaidDate().format(DATE_FORMATTER))
                    .setFontSize(12)
                    .setFontColor(new DeviceRgb(16, 185, 129))
                    .setBold()
                    .setMarginTop(20);
            document.add(paidInfo);
        }

        // Footer
        Paragraph footer = new Paragraph("\nThank you for your business!\n\nTerms & Conditions:\nPayment must be completed within the timeline mentioned in this invoice.\nJesta Tech Solutions is not responsible for delays caused by client inputs or third-party services.")
                .setFontSize(10)
                .setFontColor(grayColor)
                .setMarginTop(30)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private Cell createCell(String content, boolean bold, boolean isHeader) {
        Paragraph p = new Paragraph(content);
        if (bold) {
            p.setBold();
        }
        Cell cell = new Cell().add(p);
        if (isHeader) {
            cell.setPadding(10);
        } else {
            cell.setPadding(8);
        }
        return cell;
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "₹0.00";
        }
        return String.format("₹%,.2f", amount);
    }
}

