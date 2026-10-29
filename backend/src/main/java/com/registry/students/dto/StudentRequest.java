package com.registry.students.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Payload accepted by the create and update endpoints. */
public record StudentRequest(

        @NotBlank(message = "Student ID is required")
        @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9-]{2,39}$",
                message = "Use 3-40 letters, digits or dashes (e.g. STU-2024-001)")
        String studentId,

        @NotBlank(message = "Roll number is required")
        @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9/-]{0,39}$",
                message = "Use letters, digits, dashes or slashes (e.g. CS-21/047)")
        String rollNo,

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Name must be 2-120 characters")
        @Pattern(regexp = "^[\\p{L}][\\p{L} .'\\-]{1,119}$",
                message = "Letters, spaces, apostrophes and hyphens only")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 160, message = "Email is too long")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[+]?[0-9][0-9\\s-]{7,18}$",
                message = "Enter 8-15 digits, optionally starting with +")
        String phone
) {
}
