package com.bedtracker.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);     // Minimum threads running
        executor.setMaxPoolSize(5);      // Max threads if queue is full
        executor.setQueueCapacity(500);  // Queue size for waiting tasks
        executor.setThreadNamePrefix("EmailThread-");
        executor.initialize();
        return executor;
    }
}