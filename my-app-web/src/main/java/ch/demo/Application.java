package ch.demo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
@Slf4j
public class Application {

    public static void main(String[] args) {

        Environment env = SpringApplication.run(Application.class, args).getEnvironment();

        log.info("""
            ----------------------------------------------------------
            \t\
            {} is running! &#9825;\s
            \t\
            
            \tFrontend (npm): \t\thttp://localhost:4200
            \tFrontend (bundled): \thttp://localhost:8080{}
            \tSwaggerUI: \t\t\t\thttp://localhost:{}{}/swagger-ui.html?urls.primaryName=Service%20API
            \t\
            Profile(s): \t\t\t{}\
            
            ----------------------------------------------------------""",
            env.getProperty("spring.application.name"),
            env.getProperty("server.servlet.context-path"),
            env.getProperty("server.port"),
            env.getProperty("server.servlet.context-path"),
            env.getActiveProfiles());
    }
}
