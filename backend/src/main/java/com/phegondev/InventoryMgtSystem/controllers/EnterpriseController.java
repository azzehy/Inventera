package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.EnterpriseDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.services.EnterpriseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @PostMapping
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> createEnterprise(@Valid @RequestBody EnterpriseDTO enterpriseDTO) {
        return ResponseEntity.ok(enterpriseService.createEnterprise(enterpriseDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Response> updateEnterprise(
            @PathVariable Long id,
            @Valid @RequestBody EnterpriseDTO enterpriseDTO) {
        return ResponseEntity.ok(enterpriseService.updateEnterprise(id, enterpriseDTO));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> getAllEnterprises() {
        return ResponseEntity.ok(enterpriseService.getAllEnterprises());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getEnterpriseById(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.getEnterpriseById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> deleteEnterprise(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.deleteEnterprise(id));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getEnterpriseStats(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.getEnterpriseStats(id));
    }

    @GetMapping("/my-enterprise")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterprise() {
        return ResponseEntity.ok(enterpriseService.getMyEnterprise());
    }

    @GetMapping("/my-enterprise/stats")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterpriseStats() {
        return ResponseEntity.ok(enterpriseService.getMyEnterpriseStats());
    }
}