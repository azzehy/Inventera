package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.ProductDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> saveProduct(
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam("name") String name,
            @RequestParam("sku") String sku,
            @RequestParam("price") BigDecimal price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("enterpriseId") Long enterpriseId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "stockMinimum", required = false, defaultValue = "0") Integer stockMinimum,
            @RequestParam(value = "expiryDate", required = false) LocalDateTime expiryDate
    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName(name);
        productDTO.setSku(sku);
        productDTO.setPrice(price);
        productDTO.setQuantity(quantity);
        productDTO.setCategoryId(categoryId);
        productDTO.setEnterpriseId(enterpriseId);
        productDTO.setDescription(description);
        productDTO.setStockMinimum(stockMinimum);
        productDTO.setExpiryDate(expiryDate);

        return ResponseEntity.ok(productService.saveProduct(productDTO, imageFile));
    }

    @PutMapping("/update/{productId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateProduct(
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "enterpriseId", required = false) Long enterpriseId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "stockMinimum", required = false) Integer stockMinimum,
            @RequestParam(value = "expiryDate", required = false) LocalDateTime expiryDate,
            @PathVariable Long productId
    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(productId);
        productDTO.setName(name);
        productDTO.setSku(sku);
        productDTO.setPrice(price);
        productDTO.setQuantity(quantity);
        productDTO.setCategoryId(categoryId);
        productDTO.setEnterpriseId(enterpriseId);
        productDTO.setDescription(description);
        productDTO.setStockMinimum(stockMinimum);
        productDTO.setExpiryDate(expiryDate);

        return ResponseEntity.ok(productService.updateProduct(productDTO, imageFile));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Response> deleteProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> searchProduct(@RequestParam String input) {
        return ResponseEntity.ok(productService.searchProduct(input));
    }

    @GetMapping("/enterprise/{enterpriseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getProductsByEnterprise(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(productService.getProductsByEnterprise(enterpriseId));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/low-stock/{enterpriseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getLowStockProducts(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(productService.getLowStockProducts(enterpriseId));
    }

    @GetMapping("/my-products")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterpriseProducts() {
        return ResponseEntity.ok(productService.getMyEnterpriseProducts());
    }

    @GetMapping("/my-low-stock")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyEnterpriseLowStockProducts() {
        return ResponseEntity.ok(productService.getMyEnterpriseLowStockProducts());
    }
}