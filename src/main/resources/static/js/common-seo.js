// Common SEO and company information
const COMPANY_INFO = {
    name: "Jesta Tech Solutions",
    shortName: "JTS",
    email: "jestatechsolutions@gmail.com",
    phone: "+91 8520999351",
    whatsapp: "+91 8520999351",
    address: "Anantapur, Andhra Pradesh, 515001",
    social: {
        facebook: "https://www.facebook.com/share/1Bo8k8gFUf/",
        twitter: "https://x.com/JTS_solutions?t=eod0dW7xJ3yaJVEMr5PoZg&s=08",
        linkedin: "https://www.linkedin.com/company/109288157/admin/dashboard/",
        instagram: "https://www.instagram.com/jestatechsolutions?igsh=ajhldzM3d3ZqanVl"
    },
    baseUrl: "https://jestatechsolutions.com",
    description: "Jesta Tech Solutions - Leading provider of Web development, Android development, SEO services, Branding, Digital Marketing, Ads creation, AI tools, and Software development services.",
    keywords: "Web development, Android development, SEO services, Branding, Digital Marketing, Ads creation, AI tools, Software development, Jesta Tech Solutions"
};

// Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

