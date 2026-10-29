package com.registry.students.web;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns exceptions into a single, predictable JSON error shape:
 * { timestamp, status, message, fieldErrors: { field: message } }
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> onValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.putIfAbsent(err.getField(), err.getDefaultMessage()));

        return body(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields", fieldErrors);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> onNotFound(NotFoundException ex) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(DuplicateFieldException.class)
    public ResponseEntity<Map<String, Object>> onDuplicate(DuplicateFieldException ex) {
        return body(HttpStatus.CONFLICT, ex.getMessage(), Map.of(ex.getField(), ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> onConstraint(DataIntegrityViolationException ex) {
        return body(HttpStatus.CONFLICT, "That record conflicts with an existing entry", null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> onUnreadable(HttpMessageNotReadableException ex) {
        return body(HttpStatus.BAD_REQUEST, "Request body is missing or malformed", null);
    }

    private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message,
                                                     Map<String, String> fieldErrors) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("timestamp", Instant.now().toString());
        payload.put("status", status.value());
        payload.put("message", message);
        payload.put("fieldErrors", fieldErrors == null ? Map.of() : fieldErrors);
        return ResponseEntity.status(status).body(payload);
    }
}
