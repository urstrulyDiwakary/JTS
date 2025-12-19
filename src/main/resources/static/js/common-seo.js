// Common SEO and company information - India Focus
const COMPANY_INFO = {
    name: "Jesta Tech Solutions",
    shortName: "JTS",
    email: "jestatechsolutions@gmail.com",
    phone: "+91-8520999351",
    whatsapp: "+918520999351",
    address: "Anantapur, Andhra Pradesh, India - 515001",
    location: {
        city: "Anantapur",
        state: "Andhra Pradesh",
        country: "India",
        postalCode: "515001",
        latitude: "14.6819",
        longitude: "77.6006"
    },
    social: {
        facebook: "https://www.facebook.com/share/17hNFerPxJ/",
        twitter: "https://x.com/JTS_solutions",
        linkedin: "https://www.linkedin.com/company/jesta-tech-solutions/",
        instagram: "https://www.instagram.com/jestatechsolutions?igsh=YmI2NTV4dHBhaTVk"
    },
    baseUrl: "https://jestatechsolutions.in",
    description: "Jesta Tech Solutions - Leading IT solutions provider in India offering expert web development, Android app development, SEO services, digital marketing, hosting, and innovative technology solutions for businesses across India.",
    keywords: "Web development India, Android app development India, SEO services India, Digital marketing India, IT company Anantapur, Software development Andhra Pradesh, Website design India, Mobile app development, Hosting services India, Tech solutions India"
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

