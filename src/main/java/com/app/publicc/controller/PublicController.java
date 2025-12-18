package com.app.publicc.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class PublicController {

    @GetMapping
    public String home(Model model) {
        System.out.println("🏠 [PublicController] Home page requested - Serving public/index");
        model.addAttribute("pageTitle", "Home");
        return "public/index";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("pageTitle", "About Us");
        return "public/about";
    }

    @GetMapping("/services")
    public String services(Model model) {
        model.addAttribute("pageTitle", "Services");
        return "public/services";
    }

    @GetMapping("/portfolio")
    public String portfolio(Model model) {
        model.addAttribute("pageTitle", "Portfolio");
        return "public/portfolio";
    }

    @GetMapping("/contact")
    public String contact(Model model) {
        model.addAttribute("pageTitle", "Contact");
        return "public/contact";
    }

    @GetMapping("/privacy")
    public String privacy(Model model) {
        model.addAttribute("pageTitle", "Privacy Policy");
        return "public/privacy";
    }

    @GetMapping("/terms")
    public String terms(Model model) {
        model.addAttribute("pageTitle", "Terms & Conditions");
        return "public/terms";
    }
}

