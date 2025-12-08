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
@RequestMapping("/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createEnterprise(@Valid @RequestBody EnterpriseDTO enterpriseDTO) {
        return ResponseEntity.ok(enterpriseService.createEnterprise(enterpriseDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateEnterprise(
            @PathVariable Long id,
            @Valid @RequestBody EnterpriseDTO enterpriseDTO) {
        return ResponseEntity.ok(enterpriseService.updateEnterprise(id, enterpriseDTO));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllEnterprises() {
        return ResponseEntity.ok(enterpriseService.getAllEnterprises());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getEnterpriseById(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.getEnterpriseById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteEnterprise(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.deleteEnterprise(id));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getEnterpriseStats(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.getEnterpriseStats(id));
    }
}