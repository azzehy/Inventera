package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByEnterpriseId(Long enterpriseId);
    boolean existsByNameAndEnterpriseId(String name, Long enterpriseId);
}
