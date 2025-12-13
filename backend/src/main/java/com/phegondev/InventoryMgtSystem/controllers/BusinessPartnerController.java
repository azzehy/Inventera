package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.BusinessPartnerDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import com.phegondev.InventoryMgtSystem.services.BusinessPartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-partners")
@RequiredArgsConstructor
public class BusinessPartnerController {
    
    private final BusinessPartnerService businessPartnerService;

    @PostMapping("/addBusnissPartner")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> addBusinessPartner(@Valid @RequestBody BusinessPartnerDTO businessPartnerDTO) {
        return ResponseEntity.ok(businessPartnerService.addBusinessPartner(businessPartnerDTO));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateBusinessPartner(@PathVariable Long id, @Valid @RequestBody BusinessPartnerDTO businessPartnerDTO) {
        return ResponseEntity.ok(businessPartnerService.updateBusinessPartner(id, businessPartnerDTO));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> getAllBusinessPartners() {
        return ResponseEntity.ok(businessPartnerService.getAllBusinessPartners());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getBusinessPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnerById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Response> deleteBusinessPartner(@PathVariable Long id) {
        return ResponseEntity.ok(businessPartnerService.deleteBusinessPartner(id));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getBusinessPartnersByType(@PathVariable BusinessPartnerType type) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnersByType(type));
    }

    @GetMapping("/enterprise/{enterpriseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getBusinessPartnersByEnterprise(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnersByEnterprise(enterpriseId));
    }

    @GetMapping("/enterprise/{enterpriseId}/type/{type}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getBusinessPartnersByEnterpriseAndType(
            @PathVariable Long enterpriseId, 
            @PathVariable BusinessPartnerType type) {
        return ResponseEntity.ok(businessPartnerService.getBusinessPartnersByEnterpriseAndType(enterpriseId, type));
    }

    //🙂🐧
    @GetMapping("/my-partners")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterprisePartners() {
        return ResponseEntity.ok(businessPartnerService.getMyEnterprisePartners());
    }
    //🙂🐧
    @GetMapping("/my-partners/type/{type}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterprisePartnersByType(@PathVariable BusinessPartnerType type) {
        return ResponseEntity.ok(businessPartnerService.getMyEnterprisePartnersByType(type));
    }
    //🙂🐧
    @GetMapping("/my-suppliers")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterpriseSuppliers() {
        return ResponseEntity.ok(businessPartnerService.getMyEnterpriseSuppliers());
    }
    //🙂🐧
    @GetMapping("/my-clients")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterpriseClients() {
        return ResponseEntity.ok(businessPartnerService.getMyEnterpriseClients());
    }
}