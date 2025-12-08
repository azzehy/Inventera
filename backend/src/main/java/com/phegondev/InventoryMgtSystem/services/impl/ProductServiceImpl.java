package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.ProductDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Category;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.models.Product;
import com.phegondev.InventoryMgtSystem.repositories.CategoryRepository;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.repositories.ProductRepository;
import com.phegondev.InventoryMgtSystem.services.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final EnterpriseRepository enterpriseRepository;

    private static final String IMAGE_DIRECTORY = System.getProperty("user.dir") + "/product-images/";

    // AFTER YOUR FRONTEND IS SETUP CHANGE THE IMAGE DIRECTORY TO THE FRONTEND YOU
    // ARE USING
    private static final String IMAGE_DIRECTORY_2 = "/Users/dennismac/phegonDev/ims-react/public/products/";

    @Override
    public Response saveProduct(ProductDTO productDTO, MultipartFile imageFile) {

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        Enterprise enterprise = enterpriseRepository.findById(productDTO.getEnterpriseId())
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        Product productToSave = Product.builder()
                .name(productDTO.getName())
                .sku(productDTO.getSku())
                .price(productDTO.getPrice())
                .quantity(productDTO.getQuantity())
                .stockMinimum(productDTO.getStockMinimum())
                .description(productDTO.getDescription())
                .expiryDate(productDTO.getExpiryDate())
                .category(category)
                .enterprise(enterprise)
                .build();

        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("Image file exists");
            // String imagePath = saveImage(imageFile); //use this when you haven't setup
            // your frontend
            String imagePath = saveImage2(imageFile); // use this when you have set up your frontend locally

            System.out.println("IMAGE URL IS: " + imagePath);
            productToSave.setImageUrl(imagePath);
        }

        // save the product entity
        productRepository.save(productToSave);

        return Response.builder()
                .status(200)
                .message("Product successfully saved")
                .build();
    }

    @Override
    public Response updateProduct(ProductDTO productDTO, MultipartFile imageFile) {

        // check if product exisit
        Product existingProduct = productRepository.findById(productDTO.getId())
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        if (imageFile != null && !imageFile.isEmpty()) {
            // String imagePath = saveImage(imageFile);
            String imagePath = saveImage2(imageFile);

            System.out.println("IMAGE URL IS: " + imagePath);
            existingProduct.setImageUrl(imagePath);
        }

        if (productDTO.getCategoryId() != null && productDTO.getCategoryId() > 0) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category Not Found"));
            existingProduct.setCategory(category);
        }

        if (productDTO.getEnterpriseId() != null && productDTO.getEnterpriseId() > 0) {
            Enterprise enterprise = enterpriseRepository.findById(productDTO.getEnterpriseId())
                    .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
            existingProduct.setEnterprise(enterprise);
        }

        if (productDTO.getName() != null && !productDTO.getName().isBlank()) {
            existingProduct.setName(productDTO.getName());
        }

        if (productDTO.getSku() != null && !productDTO.getSku().isBlank()) {
            existingProduct.setSku(productDTO.getSku());
        }

        if (productDTO.getDescription() != null && !productDTO.getDescription().isBlank()) {
            existingProduct.setDescription(productDTO.getDescription());
        }

        if (productDTO.getPrice() != null && productDTO.getPrice().compareTo(BigDecimal.ZERO) >= 0) {
            existingProduct.setPrice(productDTO.getPrice());
        }

        if (productDTO.getQuantity() != null && productDTO.getQuantity() >= 0) {
            existingProduct.setQuantity(productDTO.getQuantity());
        }

        if (productDTO.getStockMinimum() != null && productDTO.getStockMinimum() >= 0) {
            existingProduct.setStockMinimum(productDTO.getStockMinimum());
        }

        if (productDTO.getExpiryDate() != null) {
            existingProduct.setExpiryDate(productDTO.getExpiryDate());
        }

        productRepository.save(existingProduct);

        return Response.builder()
                .status(200)
                .message("Product Updated successfully")
                .build();
    }

    @Override
    public Response getAllProducts() {

        List<Product> productList = productRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<ProductDTO> productDTOList = productList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    @Override
    public Response getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        ProductDTO productDTO = mapToDTO(product);

        return Response.builder()
                .status(200)
                .message("success")
                .product(productDTO)
                .build();
    }

    @Override
    public Response deleteProduct(Long id) {

        productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        productRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Product Deleted successfully")
                .build();
    }

    @Override
    public Response searchProduct(String input) {

        List<Product> products = productRepository.findByNameContainingOrDescriptionContaining(input, input);

        if (products.isEmpty()) {
            throw new NotFoundException("Product Not Found");
        }

        List<ProductDTO> productDTOList = products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    public Response getProductsByEnterprise(Long enterpriseId) {
        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        List<Product> products = productRepository.findByEnterpriseId(enterpriseId);

        List<ProductDTO> productDTOList = products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    public Response getProductsByCategory(Long categoryId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        List<Product> products = productRepository.findByCategoryId(categoryId);

        List<ProductDTO> productDTOList = products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    public Response getLowStockProducts(Long enterpriseId) {
        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        List<Product> products = productRepository.findLowStockProducts(enterpriseId);

        List<ProductDTO> productDTOList = products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    private ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSku(product.getSku());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setStockMinimum(product.getStockMinimum());
        dto.setDescription(product.getDescription());
        dto.setExpiryDate(product.getExpiryDate());
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setEnterpriseId(product.getEnterprise().getId());
        dto.setEnterpriseName(product.getEnterprise().getName());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        return dto;
    }

    // this save to the root of your project
    private String saveImage(MultipartFile imageFile) {

        // validate image and check if it is greater than 1GIB
        if (!imageFile.getContentType().startsWith("image/") || imageFile.getSize() > 1024 * 1024 * 1024) {
            throw new IllegalArgumentException("Only image files under 1GIG is allowed");
        }

        // create the directory if it doesn't exist
        File directory = new File(IMAGE_DIRECTORY);

        if (!directory.exists()) {
            directory.mkdir();
            log.info("Directory was created");
        }

        // generate unique file name for the image
        String uniqueFileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

        // Get the absolute path of the image
        String imagePath = IMAGE_DIRECTORY + uniqueFileName;

        try {
            File destinationFile = new File(imagePath);
            imageFile.transferTo(destinationFile); // we are writing the image to this folder
        } catch (Exception e) {
            throw new IllegalArgumentException("Error saving Image: " + e.getMessage());
        }
        return imagePath;
    }

    // This saved image to the public folder in your frontend
    // Use this if your have setup your frontend
    private String saveImage2(MultipartFile imageFile) {
        // validate image and check if it is greater than 1GIB
        if (!imageFile.getContentType().startsWith("image/") || imageFile.getSize() > 1024 * 1024 * 1024) {
            throw new IllegalArgumentException("Only image files under 1GIG is allowed");
        }

        // create the directory if it doesn't exist
        File directory = new File(IMAGE_DIRECTORY_2);

        if (!directory.exists()) {
            directory.mkdir();
            log.info("Directory was created");
        }
        // generate unique file name for the image
        String uniqueFileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

        // Get the absolute path of the image
        String imagePath = IMAGE_DIRECTORY_2 + uniqueFileName;

        try {
            File destinationFile = new File(imagePath);
            imageFile.transferTo(destinationFile); // we are writing the image to this folder
        } catch (Exception e) {
            throw new IllegalArgumentException("Error saving Image: " + e.getMessage());
        }
        return "products/" + uniqueFileName;

    }
}