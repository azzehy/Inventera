package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.BusinessPartnerDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import com.phegondev.InventoryMgtSystem.services.BusinessPartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/business-partners")
@RequiredArgsConstructor
public class BusinessPartnerController {
    
    private final BusinessPartnerService businessPartnerService;

    @PostMapping
    public ResponseEntity<Response> addBusinessPartner(@Valid @RequestBody BusinessPartnerDTO businessPartnerDTO) {
        return ResponseEntity.ok(businessPartnerService.addBusinessPartner(businessPartnerDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> updateBusinessPartner(@PathVariable Long id, @Valid @RequestBody BusinessPartnerDTO businessPartnerDTO) {
        return ResponseEntity.ok(businessPartnerService.updateBusinessPartner(id, businessPartnerDTO));
    }

    @GetMapping
    public ResponseEntity<Response> getAllBusinessPartners() {
        return ResponseEntity.ok(businessPartnerService.getAllBusinessPartners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getBusinessPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnerById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deleteBusinessPartner(@PathVariable Long id) {
        return ResponseEntity.ok(businessPartnerService.deleteBusinessPartner(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Response> getBusinessPartnersByType(@PathVariable BusinessPartnerType type) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnersByType(type));
    }

    @GetMapping("/enterprise/{enterpriseId}")
    public ResponseEntity<Response> getBusinessPartnersByEnterprise(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnersByEnterprise(enterpriseId));
    }

    @GetMapping("/enterprise/{enterpriseId}/type/{type}")
    public ResponseEntity<Response> getBusinessPartnersByEnterpriseAndType(
            @PathVariable Long enterpriseId, 
            @PathVariable BusinessPartnerType type) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnersByEnterpriseAndType(enterpriseId, type));
    }
}