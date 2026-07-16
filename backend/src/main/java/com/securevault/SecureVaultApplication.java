package com.securevault;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;

@SpringBootApplication
@EnableAsync
public class SecureVaultApplication implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(SecureVaultApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SecureVaultApplication.class, args);
    }

    @Override
    public Executor getAsyncExecutor() {
        return null;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (Throwable ex, Method method, Object... params) -> {
            log.error("Async method {} threw uncaught exception", method.getName(), ex);
        };
    }
}
