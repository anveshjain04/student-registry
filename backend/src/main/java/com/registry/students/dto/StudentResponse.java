package com.registry.students.dto;

import com.registry.students.model.Student;

import java.time.Instant;

/** What the API sends back to the client. */
public record StudentResponse(
        Long id,
        String studentId,
        String rollNo,
        String fullName,
        String email,
        String phone,
        Instant createdAt,
        Instant updatedAt
) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getStudentId(),
                s.getRollNo(),
                s.getFullName(),
                s.getEmail(),
                s.getPhone(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
