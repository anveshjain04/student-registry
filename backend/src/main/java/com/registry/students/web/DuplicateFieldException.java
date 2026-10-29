package com.registry.students.web;

/** Thrown when a unique field (student ID or email) is already taken. Mapped to HTTP 409. */
public class DuplicateFieldException extends RuntimeException {

    private final String field;

    public DuplicateFieldException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
