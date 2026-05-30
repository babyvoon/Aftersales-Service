package com.aftersales.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a spare part does not have enough stock to fulfill a request.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String partName, int requested, int available) {
        super(String.format("Insufficient stock for '%s': requested %d, available %d",
                partName, requested, available));
    }
}
