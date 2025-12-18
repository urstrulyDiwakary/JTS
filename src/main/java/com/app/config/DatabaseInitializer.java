package com.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements ApplicationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("🚀 Starting Database Initialization...");
        try {
            // Check if users table exists and has required columns
            ensureUserTableStructure();
            System.out.println("✅ Database initialization completed successfully");
        } catch (Exception e) {
            System.err.println("❌ Database initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void ensureUserTableStructure() {
        System.out.println("📋 Checking and updating users table structure...");
        try {
            // Add phone column if it doesn't exist
            addColumnIfNotExists("phone", "VARCHAR(20)");

            // Add department column if it doesn't exist
            addColumnIfNotExists("department", "VARCHAR(100)");

            // Add status column if it doesn't exist
            addColumnIfNotExists("status", "VARCHAR(20) DEFAULT 'Active'");

            // Remove deprecated columns if they exist
            System.out.println("🔄 Removing deprecated columns...");
            removeColumnIfExists("must_change_password");
            removeColumnIfExists("location");

            System.out.println("✅ All required columns exist in users table");
        } catch (Exception e) {
            System.err.println("⚠️ Could not verify/add columns: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void addColumnIfNotExists(String columnName, String columnDefinition) {
        try {
            // Check if column exists
            String checkColumnSql = "SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name=?";
            try {
                Integer result = jdbcTemplate.queryForObject(checkColumnSql, Integer.class, columnName);
                if (result != null) {
                    System.out.println("✅ Column '" + columnName + "' already exists");
                    return;
                }
            } catch (Exception e) {
                // Column doesn't exist, so add it
            }

            // Add the column
            String addColumnSql = "ALTER TABLE users ADD COLUMN " + columnName + " " + columnDefinition;
            jdbcTemplate.execute(addColumnSql);
            System.out.println("✅ Added column: " + columnName);
        } catch (Exception e) {
            System.err.println("⚠️ Could not add column '" + columnName + "': " + e.getMessage());
        }
    }

    private void removeColumnIfExists(String columnName) {
        try {
            // Check if column exists
            String checkColumnSql = "SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name=?";
            try {
                Integer result = jdbcTemplate.queryForObject(checkColumnSql, Integer.class, columnName);
                if (result != null) {
                    // Column exists, so remove it
                    String dropColumnSql = "ALTER TABLE users DROP COLUMN " + columnName;
                    jdbcTemplate.execute(dropColumnSql);
                    System.out.println("✅ Removed deprecated column: " + columnName);
                } else {
                    System.out.println("✅ Column '" + columnName + "' does not exist (already removed)");
                }
            } catch (Exception e) {
                // Column doesn't exist
                System.out.println("✅ Column '" + columnName + "' does not exist (already removed)");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Could not remove column '" + columnName + "': " + e.getMessage());
        }
    }
}
