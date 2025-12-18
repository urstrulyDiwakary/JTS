package com.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-path:uploads}")
    private String uploadBasePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadBasePath);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Created upload directory: " + uploadPath.toAbsolutePath());
            }

            // Create projects subdirectory if it doesn't exist
            Path projectsPath = uploadPath.resolve("projects");
            if (!Files.exists(projectsPath)) {
                Files.createDirectories(projectsPath);
                System.out.println("✅ Created projects directory: " + projectsPath.toAbsolutePath());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to create upload directory: " + e.getMessage());
        }

        // Add resource handler for uploaded files with no caching
        String resourceLocation = "file:" + uploadPath.toAbsolutePath().toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0) // No caching for immediate access
                .resourceChain(false); // Disable resource chain for better performance

        System.out.println("📁 Configured file upload handler:");
        System.out.println("- URL pattern: /uploads/**");
        System.out.println("- Resource location: " + resourceLocation);
        System.out.println("- File system path: " + uploadPath.toAbsolutePath());
        System.out.println("- Cache period: 0 (no caching)");
    }
}
