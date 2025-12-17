package com.phegondev.InventoryMgtSystem.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            if (!file.getContentType().startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("Image size must be less than 10MB");
            }

            String publicId = "products/" + UUID.randomUUID().toString();

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "inventory-products",
                            "resource_type", "image"
                    ));

            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully to Cloudinary: {}", imageUrl);
            
            return imageUrl;

        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary", e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isEmpty()) {
                return;
            }

            String publicId = extractPublicIdFromUrl(imageUrl);
            
            if (publicId != null) {
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted from Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary", e);
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            if (imageUrl.contains("/inventory-products/")) {
                String[] parts = imageUrl.split("/upload/");
                if (parts.length > 1) {
                    String afterUpload = parts[1];

                    afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
                    int lastDot = afterUpload.lastIndexOf('.');
                    if (lastDot > 0) {
                        afterUpload = afterUpload.substring(0, lastDot);
                    }
                    return afterUpload;
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract public_id from URL: {}", imageUrl);
        }
        return null;
    }
}