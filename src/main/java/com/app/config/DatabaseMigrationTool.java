package com.app.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

/**
 * Standalone database migration tool to drop deprecated columns
 */
public class DatabaseMigrationTool {

    public static void main(String[] args) {
        System.out.println("🚀 Starting database migration to remove deprecated columns...");

        try {
            // Create data source
            DataSource dataSource = createDataSource();
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

            // Run migration
            runMigration(jdbcTemplate);

            System.out.println("✅ Database migration completed successfully!");

        } catch (Exception e) {
            System.err.println("❌ Migration failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static DataSource createDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl("jdbc:postgresql://localhost:5432/JTS");
        dataSource.setUsername("postgres");
        dataSource.setPassword("Razeesh@1");
        return dataSource;
    }

    private static void runMigration(JdbcTemplate jdbcTemplate) {
        System.out.println("📋 Checking current table structure...");

        // Check if deprecated columns exist
        checkAndRemoveColumn(jdbcTemplate, "must_change_password");
        checkAndRemoveColumn(jdbcTemplate, "location");

        // Show final table structure
        System.out.println("📊 Final table structure:");
        showTableStructure(jdbcTemplate);
    }

    private static void checkAndRemoveColumn(JdbcTemplate jdbcTemplate, String columnName) {
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
                // Column doesn't exist or query failed
                System.out.println("✅ Column '" + columnName + "' does not exist (already removed)");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Could not process column '" + columnName + "': " + e.getMessage());
        }
    }

    private static void showTableStructure(JdbcTemplate jdbcTemplate) {
        try {
            String sql = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position";
            jdbcTemplate.query(sql, rs -> {
                System.out.println("  Column: " + rs.getString("column_name") +
                                 " | Type: " + rs.getString("data_type") +
                                 " | Nullable: " + rs.getString("is_nullable"));
            });
        } catch (Exception e) {
            System.err.println("⚠️ Could not show table structure: " + e.getMessage());
        }
    }
}
