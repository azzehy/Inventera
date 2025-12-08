package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingOrDescriptionContaining(String name, String description);
    List<Product> findByEnterpriseId(Long enterpriseId);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByEnterpriseIdAndCategoryId(Long enterpriseId, Long categoryId);
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    
    @Query("SELECT p FROM Product p WHERE p.enterprise.id = :enterpriseId AND p.quantity <= p.stockMinimum")
    List<Product> findLowStockProducts(Long enterpriseId);
    
    @Query("SELECT p FROM Product p WHERE p.enterprise.id = :enterpriseId AND p.name LIKE %:name%") // on peut utiliser ici LIKE CONCAT('%', :name, '%')") ... je pense que c est recommande par les derniers standards JPA : a verifier
    List<Product> searchByName(Long enterpriseId, String name);
}
