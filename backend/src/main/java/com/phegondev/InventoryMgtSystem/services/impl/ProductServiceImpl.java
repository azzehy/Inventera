package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.ProductDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.InvalidCredentialsException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Category;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.models.Product;
import com.phegondev.InventoryMgtSystem.models.User;
import com.phegondev.InventoryMgtSystem.repositories.CategoryRepository;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.repositories.ProductRepository;
import com.phegondev.InventoryMgtSystem.services.CloudinaryService;
import com.phegondev.InventoryMgtSystem.services.ProductService;
import com.phegondev.InventoryMgtSystem.services.SubscriptionChecker;
import com.phegondev.InventoryMgtSystem.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final SubscriptionChecker subscriptionChecker;

    @Override
    public Response saveProduct(ProductDTO productDTO, MultipartFile imageFile) {
        User currentUser = userService.getCurrentLoggedInUser();

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        Enterprise enterprise = enterpriseRepository.findById(productDTO.getEnterpriseId())
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(productDTO.getEnterpriseId())) {
                throw new InvalidCredentialsException(
                        "You can only create products for your own enterprise");
            }
        }

        if (!category.getEnterprise().getId().equals(enterprise.getId())) {
            throw new InvalidCredentialsException(
                    "Category does not belong to this enterprise");
        }

        if (productRepository.existsBySkuAndEnterpriseId(productDTO.getSku(), enterprise.getId())) {
            throw new IllegalArgumentException(
                    "A product with SKU '" + productDTO.getSku() + "' already exists in this enterprise");
        }

        if (!subscriptionChecker.canAddProduct(enterprise)) {
            int remaining = subscriptionChecker.getRemainingProducts(enterprise);
            
            return Response.builder()
                    .status(403)
                    .message("Product limit reached! You have " + remaining + 
                             " products remaining. Please upgrade your plan.")
                    .build();
        }

        Product productToSave = Product.builder()
                .name(productDTO.getName())
                .sku(productDTO.getSku())
                .price(productDTO.getPrice())
                .quantity(productDTO.getQuantity())
                .stockMinimum(productDTO.getStockMinimum())
                .description(productDTO.getDescription())
                .category(category)
                .enterprise(enterprise)
                .build();

        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("Uploading image to Cloudinary");
            String imageUrl = cloudinaryService.uploadImage(imageFile);
            log.info("Image URL from Cloudinary: {}", imageUrl);
            productToSave.setImageUrl(imageUrl);
        }

        productRepository.save(productToSave);

        return Response.builder()
                .status(200)
                .message("Product successfully saved")
                .build();
    }

    @Override
    public Response updateProduct(ProductDTO productDTO, MultipartFile imageFile) {
        User currentUser = userService.getCurrentLoggedInUser();

        Product existingProduct = productRepository.findById(productDTO.getId())
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        validateProductAccess(currentUser, existingProduct);

        if (imageFile != null && !imageFile.isEmpty()) {
            if (existingProduct.getImageUrl() != null && !existingProduct.getImageUrl().isEmpty()) {
                cloudinaryService.deleteImage(existingProduct.getImageUrl());
            }

            String imageUrl = cloudinaryService.uploadImage(imageFile);
            existingProduct.setImageUrl(imageUrl);
            log.info("New image URL from Cloudinary: {}", imageUrl);

        }

        if (productDTO.getCategoryId() != null && productDTO.getCategoryId() > 0) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category Not Found"));

            if (!category.getEnterprise().getId().equals(existingProduct.getEnterprise().getId())) {
                throw new InvalidCredentialsException(
                        "Category does not belong to this product's enterprise");
            }
            existingProduct.setCategory(category);
        }

        if (productDTO.getEnterpriseId() != null && productDTO.getEnterpriseId() > 0) {
            if (!productDTO.getEnterpriseId().equals(existingProduct.getEnterprise().getId())) {
                if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                    throw new InvalidCredentialsException(
                            "Only SUPER_ADMIN can change a product's enterprise");
                }
                Enterprise enterprise = enterpriseRepository.findById(productDTO.getEnterpriseId())
                        .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
                existingProduct.setEnterprise(enterprise);
            }
        }

        if (productDTO.getName() != null && !productDTO.getName().isBlank()) {
            existingProduct.setName(productDTO.getName());
        }

        if (productDTO.getSku() != null && !productDTO.getSku().isBlank()
                && !productDTO.getSku().equals(existingProduct.getSku())) {
            if (productRepository.existsBySkuAndEnterpriseId(
                    productDTO.getSku(), existingProduct.getEnterprise().getId())) {
                throw new IllegalArgumentException(
                        "A product with SKU '" + productDTO.getSku() + "' already exists in this enterprise");
            }
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

        productRepository.save(existingProduct);

        return Response.builder()
                .status(200)
                .message("Product Updated successfully")
                .build();

    }

    @Override
    public Response getAllProducts() {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException("Only SUPER_ADMIN can view all products");
        }

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
        User currentUser = userService.getCurrentLoggedInUser();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        validateProductAccess(currentUser, product);

        ProductDTO productDTO = mapToDTO(product);

        return Response.builder()
                .status(200)
                .message("success")
                .product(productDTO)
                .build();
    }

    @Override
    public Response deleteProduct(Long id) {
        User currentUser = userService.getCurrentLoggedInUser();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        validateProductAccess(currentUser, product);

        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            cloudinaryService.deleteImage(product.getImageUrl());
        }

        productRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Product Deleted successfully")
                .build();
    }

    @Override
    public Response searchProduct(String input) {
        User currentUser = userService.getCurrentLoggedInUser();

        List<Product> products;

        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            products = productRepository.findByNameContainingOrDescriptionContaining(input, input);
        } else {
            products = productRepository.findByNameContainingOrDescriptionContainingAndEnterpriseId(
                    input, input, currentUser.getEnterprise().getId());
        }

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

    @Override
    public Response getProductsByEnterprise(Long enterpriseId) {
        User currentUser = userService.getCurrentLoggedInUser();

        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(enterpriseId)) {
                throw new InvalidCredentialsException(
                        "You can only view products from your own enterprise");
            }
        }

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
        User currentUser = userService.getCurrentLoggedInUser();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!category.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
                throw new InvalidCredentialsException(
                        "This category does not belong to your enterprise");
            }
        }

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

    @Override
    public Response getLowStockProducts(Long enterpriseId) {
        User currentUser = userService.getCurrentLoggedInUser();

        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(enterpriseId)) {
                throw new InvalidCredentialsException(
                        "You can only view low stock products from your own enterprise");
            }
        }

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

    // 🙂🐧
    @Override
    public Response getMyEnterpriseProducts() {
        User currentUser = userService.getCurrentLoggedInUser();
        return getProductsByEnterprise(currentUser.getEnterprise().getId());
    }

    // 🙂🐧
    @Override
    public Response getMyEnterpriseLowStockProducts() {
        User currentUser = userService.getCurrentLoggedInUser();
        return getLowStockProducts(currentUser.getEnterprise().getId());
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
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setEnterpriseId(product.getEnterprise().getId());
        dto.setEnterpriseName(product.getEnterprise().getName());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        return dto;
    }

    private void validateProductAccess(User currentUser, Product product) {
        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }
        if (!product.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
            throw new InvalidCredentialsException(
                    "You can only access products from your own enterprise");
        }
    }
}