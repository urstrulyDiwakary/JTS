package com.app.admin.controller;

import com.app.entity.Billing;
import com.app.service.BillingService;
import com.app.service.InvoicePdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/billing")
public class AdminBillingApiController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @GetMapping
    public ResponseEntity<List<Billing>> getAllBillings() {
        return ResponseEntity.ok(billingService.getAllBillings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Billing> getBillingById(@PathVariable Long id) {
        return billingService.getBillingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<Billing> createBilling(@RequestBody Billing billing) {
        try {
            Billing created = billingService.createBilling(billing);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Billing> updateBilling(@PathVariable Long id, @RequestBody Billing billingUpdate) {
        try {
            return billingService.getBillingById(id)
                    .map(existingBilling -> {
                        if (billingUpdate.getAmount() != null) existingBilling.setAmount(billingUpdate.getAmount());
                        if (billingUpdate.getStatus() != null) existingBilling.setStatus(billingUpdate.getStatus());
                        if (billingUpdate.getInvoiceNumber() != null) existingBilling.setInvoiceNumber(billingUpdate.getInvoiceNumber());
                        if (billingUpdate.getClientName() != null) existingBilling.setClientName(billingUpdate.getClientName());
                        if (billingUpdate.getDueDate() != null) existingBilling.setDueDate(billingUpdate.getDueDate());
                        if (billingUpdate.getPaidDate() != null) existingBilling.setPaidDate(billingUpdate.getPaidDate());
                        if (billingUpdate.getNotes() != null) existingBilling.setNotes(billingUpdate.getNotes());
                        Billing updated = billingService.updateBilling(existingBilling);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        billingService.deleteBilling(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        try {
            Billing billing = billingService.getBillingById(id)
                    .orElseThrow(() -> new RuntimeException("Billing not found"));

            byte[] pdfBytes = invoicePdfService.generateInvoicePdf(billing);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = (billing.getInvoiceNumber() != null ? billing.getInvoiceNumber() : "invoice-" + id) + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

