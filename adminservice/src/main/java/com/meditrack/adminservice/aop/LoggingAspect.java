package com.meditrack.adminservice.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Before("execution(* com.meditrack.adminservice.controller..*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info("Admin action start: {}", joinPoint.getSignature());
    }

    @AfterReturning(pointcut = "execution(* com.meditrack.adminservice.controller..*(..))", returning = "result")
    public void logAfter(JoinPoint joinPoint, Object result) {
        log.info("Admin action end: {} -> {}", joinPoint.getSignature(), result != null ? result.getClass().getSimpleName() : "void");
    }
}


