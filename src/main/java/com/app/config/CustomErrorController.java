package com.app.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());

            switch(statusCode) {
                case 404:
                    model.addAttribute("errorTitle", "Page Not Found");
                    model.addAttribute("errorMessage", "The requested page could not be found.");
                    break;
                case 500:
                    model.addAttribute("errorTitle", "Internal Server Error");
                    model.addAttribute("errorMessage", "An internal server error occurred. Please try again or contact support.");
                    break;
                default:
                    model.addAttribute("errorTitle", "Error " + statusCode);
                    model.addAttribute("errorMessage", "An error occurred while processing your request.");
                    break;
            }

            model.addAttribute("statusCode", statusCode);
        } else {
            model.addAttribute("errorTitle", "Unknown Error");
            model.addAttribute("errorMessage", "An unknown error occurred.");
            model.addAttribute("statusCode", "Unknown");
        }

        // Log the error for debugging
        System.err.println("❌ Error occurred - Status: " + status + ", URI: " + request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));

        // Return a proper error page instead of redirecting to admin login
        return "error"; // This will look for error.html template
    }
}
