package com.phegondev.InventoryMgtSystem.services;

import com.phegondev.InventoryMgtSystem.dtos.ProductDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    Response saveProduct(ProductDTO productDTO, MultipartFile imageFile);

    Response updateProduct(ProductDTO productDTO, MultipartFile imageFile);

    Response getAllProducts();

    Response getProductById(Long id);

    Response deleteProduct(Long id);

    Response searchProduct(String input);

    Response getProductsByEnterprise(Long enterpriseId);

    Response getProductsByCategory(Long categoryId);

    Response getLowStockProducts(Long enterpriseId);

    Response getMyEnterpriseProducts();
    
    Response getMyEnterpriseLowStockProducts();
}
