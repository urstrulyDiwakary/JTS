# PowerShell script to replace footer and WhatsApp links in all public HTML files

$publicPagesPath = "src\main\resources\templates\public"
$htmlFiles = @("about.html", "services.html", "portfolio.html", "privacy.html", "terms.html")

$oldFooterPattern = @'
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3><i class="fas fa-code"></i> Jesta Tech</h3>
                    <p>Empowering Digital Innovation</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
'@

$newFooter = @'
    <!-- Global Footer Component -->
    <footer class="global-footer">
        <div class="footer-content">
            <!-- Company Info Section -->
            <div class="footer-section">
                <h3>Jesta Tech Solutions</h3>
                <p>Empowering Digital Innovation</p>
                <p style="margin-top: 15px;">Leading provider of comprehensive tech solutions including web development, mobile apps, SEO, digital marketing, and AI tools.</p>
            </div>

            <!-- Contact Info Section -->
            <div class="footer-section">
                <h3>Contact Us</h3>
                <div class="footer-contact-info">
                    <p><i class="fas fa-envelope"></i> <a href="mailto:jestatechsolutions@gmail.com">jestatechsolutions@gmail.com</a></p>
                    <p><i class="fas fa-phone"></i> <a href="tel:+918520999351">+91 8520999351</a></p>
                    <p><i class="fab fa-whatsapp"></i> <a href="https://wa.me/918520999351" target="_blank" rel="noopener noreferrer">WhatsApp: +91 8520999351</a></p>
                    <p><i class="fas fa-map-marker-alt"></i> Anantapur, Andhra Pradesh, 515001</p>
                </div>
            </div>

            <!-- Quick Links Section -->
            <div class="footer-section">
                <h3>Quick Links</h3>
                <p><a href="/">Home</a></p>
                <p><a href="/services">Services</a></p>
                <p><a href="/portfolio">Portfolio</a></p>
                <p><a href="/about">About Us</a></p>
                <p><a href="/contact">Contact</a></p>
                <p><a href="/privacy">Privacy Policy</a></p>
                <p><a href="/terms">Terms of Service</a></p>
            </div>

            <!-- Social Media Section -->
            <div class="footer-section">
                <h3>Follow Us</h3>
                <p>Stay connected with us on social media</p>
                <div class="footer-social-links">
                    <a href="https://www.facebook.com/share/1Bo8k8gFUf/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://x.com/JTS_solutions?t=eod0dW7xJ3yaJVEMr5PoZg&s=08" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                        <i class="fab fa-x-twitter"></i>
                    </a>
                    <a href="https://www.linkedin.com/company/109288157/admin/dashboard/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <i class="fab fa-linkedin-in"></i>
                    </a>
                    <a href="https://www.instagram.com/jestatechsolutions?igsh=ajhldzM3d3ZqanVl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <i class="fab fa-instagram"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
            <p>&copy; 2025 Jesta Tech Solutions (JTS). All Rights Reserved.</p>
            <p>Designed & Developed with <i class="fas fa-heart" style="color: #ef4444;"></i> by JTS Team</p>
        </div>
    </footer>
'@

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "    JTS Project Footer Update Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $publicPagesPath $file
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow

        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Replace WhatsApp number
        $content = $content -replace 'https://wa\.me/911234567890', 'https://wa.me/918520999351'

        # Replace script tags
        $content = $content -replace '<script src="/js/script\.js"></script>', '<script src="/js/script.js" defer></script><script src="/js/common-seo.js" defer></script>'

        # Update favicon
        $content = $content -replace 'href="/assets/favicon\.png"', 'href="/jts.png"'

        # Add common-footer.css if not present
        if ($content -notmatch 'common-footer\.css') {
            $content = $content -replace '(<link rel="stylesheet" href="/css/style\.css">)', '$1`n    <link rel="stylesheet" href="/css/common-footer.css">'
        }

        Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  [√] Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "  [X] Not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Update completed!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Manually replace footer sections in each file"
Write-Host "2. Build project: .\mvnw clean package"
Write-Host "3. Test all pages"
Write-Host ""

