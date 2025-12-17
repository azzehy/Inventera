package com.phegondev.InventoryMgtSystem.controllers;


import com.phegondev.InventoryMgtSystem.dtos.CategoryDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.services.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> createCategory(@RequestBody @Valid CategoryDTO categoryDTO) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDTO));
    }


    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateCategory(@PathVariable Long id, @RequestBody @Valid CategoryDTO categoryDTO) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Response> deleteCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.deleteCategory(id));
    }

    @GetMapping("/entreprise/{enterpriseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getCategoriesByEnterprise(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(categoryService.getCategoriesByEnterprise(enterpriseId));
    }

    @GetMapping("/my-categories")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyCategoriesEnterprise() {
        return ResponseEntity.ok(categoryService.getMyEnterpriseCategories());
    }

}
