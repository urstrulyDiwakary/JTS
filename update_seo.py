"""
Script to update all public HTML files with SEO meta tags and company information
"""

import os
import re

# Define the SEO head template for each page
seo_templates = {
    'about.html': {
        'title': 'About Us | Jesta Tech Solutions',
        'description': 'About Jesta Tech Solutions - Leading provider of Web development, Android development, SEO services, Branding, Digital Marketing, and AI tools. Learn about our mission, vision, and expert team.',
        'canonical': 'https://jestatechsolutions.com/about',
        'og_title': 'About Us | Jesta Tech Solutions',
        'twitter_title': 'About Us | Jesta Tech Solutions'
    },
    'services.html': {
        'title': 'Our Services | Jesta Tech Solutions',
        'description': 'Explore our comprehensive tech services: Web Development, Android App Development, SEO, Digital Marketing, Branding, AI Tools, and Software Development solutions.',
        'canonical': 'https://jestatechsolutions.com/services',
        'og_title': 'Our Services | Jesta Tech Solutions',
        'twitter_title': 'Our Services | Jesta Tech Solutions'
    },
    'portfolio.html': {
        'title': 'Portfolio | Jesta Tech Solutions',
        'description': 'View our portfolio of successful projects in web development, mobile apps, SEO, and digital marketing. See how we transform businesses with innovative tech solutions.',
        'canonical': 'https://jestatechsolutions.com/portfolio',
        'og_title': 'Portfolio | Jesta Tech Solutions',
        'twitter_title': 'Portfolio | Jesta Tech Solutions'
    },
    'privacy.html': {
        'title': 'Privacy Policy | Jesta Tech Solutions',
        'description': 'Privacy Policy for Jesta Tech Solutions. Learn how we collect, use, and protect your personal information.',
        'canonical': 'https://jestatechsolutions.com/privacy',
        'og_title': 'Privacy Policy | Jesta Tech Solutions',
        'twitter_title': 'Privacy Policy | Jesta Tech Solutions'
    },
    'terms.html': {
        'title': 'Terms of Service | Jesta Tech Solutions',
        'description': 'Terms and Conditions for using Jesta Tech Solutions services. Read our terms of service, user agreements, and policies.',
        'canonical': 'https://jestatechsolutions.com/terms',
        'og_title': 'Terms of Service | Jesta Tech Solutions',
        'twitter_title': 'Terms of Service | Jesta Tech Solutions'
    }
}

def generate_seo_head(page_info):
    return f'''<!-- Basic Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- SEO Meta Tags -->
    <meta name="description" content="{page_info['description']}">
    <meta name="keywords" content="Web development, Android development, SEO services, Branding, Digital Marketing, Ads creation, AI tools, Software development, Jesta Tech Solutions">
    <meta name="author" content="Jesta Tech Solutions">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow" />
    <meta name="bingbot" content="index, follow" />
    <meta name="ai-bot" content="allow" />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/jts.png" />
    <link rel="shortcut icon" href="/jts.png" />
    <link rel="apple-touch-icon" href="/jts.png" />

    <!-- Canonical URL -->
    <link rel="canonical" href="{page_info['canonical']}" />

    <!-- Open Graph Meta Tags (Facebook, Instagram) -->
    <meta property="og:site_name" content="Jesta Tech Solutions">
    <meta property="og:title" content="{page_info['og_title']}">
    <meta property="og:description" content="{page_info['description']}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{page_info['canonical']}">
    <meta property="og:locale" content="en_US">
    <meta property="og:image" content="https://jestatechsolutions.com/jts.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@JTS_solutions">
    <meta name="twitter:creator" content="@JTS_solutions">
    <meta name="twitter:title" content="{page_info['twitter_title']}">
    <meta name="twitter:description" content="{page_info['description']}">
    <meta name="twitter:image" content="https://jestatechsolutions.com/jts.png">

    <!-- Structured Data - Organization Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Jesta Tech Solutions",
      "alternateName": "JTS",
      "url": "https://jestatechsolutions.com",
      "logo": "https://jestatechsolutions.com/jts.png",
      "description": "Leading provider of Web development, Android development, SEO services, Branding, Digital Marketing, Ads creation, AI tools, and Software development services.",
      "email": "jestatechsolutions@gmail.com",
      "telephone": "+91-8520999351",
      "address": {{
        "@type": "PostalAddress",
        "streetAddress": "Anantapur",
        "addressLocality": "Anantapur",
        "addressRegion": "Andhra Pradesh",
        "postalCode": "515001",
        "addressCountry": "IN"
      }},
      "sameAs": [
        "https://www.facebook.com/share/1Bo8k8gFUf/",
        "https://x.com/JTS_solutions?t=eod0dW7xJ3yaJVEMr5PoZg&s=08",
        "https://www.linkedin.com/company/109288157/admin/dashboard/",
        "https://www.instagram.com/jestatechsolutions?igsh=ajhldzM3d3ZqanVl"
      ]
    }}
    </script>'''

print("SEO templates generated for all pages")
for page, info in seo_templates.items():
    print(f"\\n{page}:")
    print(f"  Title: {info['title']}")
    print(f"  Canonical: {info['canonical']}")

