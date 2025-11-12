# Jesta Tech Solutions - Complete Website

## 🎯 Project Overview
A modern, fully responsive website for Jesta Tech Solutions - a comprehensive technology solutions company offering Website Development, Mobile App Development, Hosting Services, Server Maintenance, Social Media Management, and Digital Marketing & SEO.

## 📁 Project Structure
```
jesta-tech-website/
│
├── index.html              # Home page with hero, services, testimonials
├── about.html              # About page with mission, vision, timeline, team
├── services.html           # Detailed services page
├── portfolio.html          # Portfolio showcase with filters
├── contact.html            # Contact form and map
├── terms.html              # Terms & Conditions
├── privacy.html            # Privacy Policy
│
├── style.css               # Complete responsive stylesheet
├── script.js               # All interactive JavaScript features
│
├── assets/                 # Images and assets folder
│   └── favicon.png         # Company favicon (add your logo here)
│
└── README.md               # This file
```

## 🚀 Features

### Responsive Design
- ✅ Desktop View (>1024px): Fixed top navigation with logo and menu
- ✅ Tablet View (768px-1024px): Bottom navigation bar
- ✅ Mobile View (<768px): Bottom navigation + slide-in side menu

### Navigation
- **Desktop**: Fixed header with horizontal menu
- **Mobile/Tablet**: 
  - Bottom navigation bar (Home, Services, Portfolio, Contact, Menu)
  - Slide-in side drawer for additional links (About, Terms, Privacy, Feedback)

### Interactive Features
1. **Hero Section** - Animated banner with smooth fade-in effects
2. **Service Cards** - Hover effects with smooth transitions
3. **Testimonials Carousel** - Auto-rotating with manual navigation dots
4. **Counter Animation** - Numbers count up when scrolled into view
5. **Portfolio Filters** - Dynamic filtering by category (Web, App, SEO, Design)
6. **FAQ Accordion** - Expandable Q&A section
7. **Contact Form** - Validated form with success/error messages
8. **Scroll Animations** - Elements fade in as you scroll
9. **Timeline** - Animated company growth journey
10. **Team Section** - Hover overlay with social links

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, Animations, Media Queries
- **Vanilla JavaScript** - No frameworks, pure JS
- **Font Awesome 6.4.0** - Icons
- **Google Fonts (Poppins)** - Typography

## 🎨 Color Scheme
- Primary Blue: `#0D6EFD`
- Dark: `#1E1E1E`
- White: `#FFFFFF`
- Light Gray: `#F8F9FA`
- Text: `#212529`

## 📱 Responsive Breakpoints
- Desktop: `>1024px`
- Tablet: `768px - 1024px`
- Mobile: `481px - 767px`
- Small Mobile: `320px - 480px`

## 🛠️ Setup Instructions

### 1. Add Your Assets
Place your company logo/favicon in the `assets/` folder:
```
assets/
└── favicon.png    # Your company logo (recommended size: 512x512px)
```

### 2. Update Contact Information
Edit these files and replace placeholder contact details:
- All HTML files: Update phone (+91 12345 67890), email (info@jestatech.com), and WhatsApp link
- Search for "12345 67890" and replace with your actual number
- Search for "info@jestatech.com" and replace with your email

### 3. Customize Google Maps
In `contact.html`, update the Google Maps embed with your actual location coordinates.

### 4. Deploy
Upload all files to your web hosting:
- Option 1: Use FTP client (FileZilla)
- Option 2: Use cPanel File Manager
- Option 3: Deploy to Netlify/Vercel (drag & drop)

## 📋 Page-by-Page Guide

### Home Page (index.html)
- Hero banner with company tagline
- Company intro with key statistics
- 6 service cards with hover effects
- Auto-rotating testimonials carousel
- Technology partners showcase

### About Page (about.html)
- Mission, Vision, Values cards
- Company story section
- Interactive timeline (2019-2024)
- Team member cards with social links

### Services Page (services.html)
- 6 detailed service cards with features list
- "Why Choose Us" section with animated counters
- 4-step work process visualization
- Call-to-action section

### Portfolio Page (portfolio.html)
- Category filters (All, Web, App, SEO, Design)
- 9 project showcase cards
- Hover overlay with project details
- Statistics section with counters

### Contact Page (contact.html)
- 4 contact information cards
- Validated contact form with AJAX-style submission
- Google Maps embed (Anantapur location)
- FAQ accordion section

### Terms & Privacy Pages
- Professional legal content
- Easy-to-read sections with icons
- Mobile-friendly formatting

## 🔧 Customization Tips

### Change Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #0D6EFD;    /* Your brand color */
    --primary-dark: #0a58ca;      /* Darker shade */
    --dark-color: #1E1E1E;        /* Dark backgrounds */
}
```

### Add More Portfolio Items
In `portfolio.html`, copy any `.portfolio-item` div and modify:
```html
<div class="portfolio-item fade-in-scroll" data-category="web">
    <!-- Your content -->
</div>
```

### Modify Testimonials
In `index.html`, add more testimonial cards:
```html
<div class="testimonial-card">
    <!-- Your testimonial content -->
</div>
```
Don't forget to add corresponding dots in `.carousel-dots`

### Update Team Members
In `about.html`, modify team cards with your actual team info.

## 🐛 Troubleshooting

### Icons Not Showing
- Check internet connection (Font Awesome loads from CDN)
- Verify Font Awesome link in HTML `<head>`

### Animations Not Working
- Ensure `script.js` is properly linked before `</body>`
- Check browser console for JavaScript errors

### Mobile Menu Not Working
- Verify all IDs match: `menuToggle`, `sideMenu`, `closeMenu`, `sideMenuOverlay`
- Check that `script.js` is loading properly

### Form Not Submitting
- The form currently shows a success message (demo mode)
- To connect to a real backend, modify the `initializeContactForm()` function in `script.js`

## 🌐 Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 📱 Mobile Testing
Test on actual devices or use browser DevTools:
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select different devices (iPhone, iPad, etc.)

## 🚀 Performance Optimization Tips
1. Compress images before uploading (use TinyPNG)
2. Minify CSS and JS for production
3. Enable GZIP compression on server
4. Use CDN for static assets
5. Add caching headers

## 📝 SEO Checklist
- ✅ Meta descriptions on all pages
- ✅ Proper heading hierarchy (H1, H2, H3)
- ✅ Alt text for images (add when you add actual images)
- ✅ Mobile-friendly design
- ✅ Fast loading times
- ✅ Semantic HTML5

## 🔒 Security Notes
- Update contact form to use server-side validation
- Implement CAPTCHA for form submissions
- Use HTTPS (SSL certificate)
- Keep software/plugins updated

## 📞 Support
For questions or issues:
- Create an issue in your repository
- Contact your development team
- Refer to this README for common solutions

## 📄 License
© 2024 Jesta Tech Solutions. All Rights Reserved.

---

**Made with ❤️ for Jesta Tech Solutions**

Enjoy your new professional website! 🎉
