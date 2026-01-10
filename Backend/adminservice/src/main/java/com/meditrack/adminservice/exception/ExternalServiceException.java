package com.meditrack.adminservice.exception;

public class ExternalServiceException extends RuntimeException {
    
    private final String serviceName;
    private final int statusCode;
    
    public ExternalServiceException(String serviceName, String message) {
        super("Error calling " + serviceName + ": " + message);
        this.serviceName = serviceName;
        this.statusCode = 0;
    }
    
    public ExternalServiceException(String serviceName, String message, int statusCode) {
        super("Error calling " + serviceName + " (HTTP " + statusCode + "): " + message);
        this.serviceName = serviceName;
        this.statusCode = statusCode;
    }
    
    public ExternalServiceException(String serviceName, String message, Throwable cause) {
        super("Error calling " + serviceName + ": " + message, cause);
        this.serviceName = serviceName;
        this.statusCode = 0;
    }
    
    public String getServiceName() {
        return serviceName;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
}

