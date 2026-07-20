package ch.demo.web.config;

import ch.demo.Application;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "Person API",
                description = "Simple API provided as an example"
        ),
        security = {@SecurityRequirement(name = "OIDC")}
)
@Configuration
public class OpenApiConfig {

    @Bean
    GroupedOpenApi api() {
        return GroupedOpenApi.builder()
                .group("Service API")
                .pathsToMatch("/api/**")
                .packagesToScan(Application.class.getPackageName())
                .build();
    }

    @Bean
    GroupedOpenApi uiApi() {
        return GroupedOpenApi.builder()
                .group("UI API")
                .pathsToMatch("/ui-api/**")
                .packagesToScan(Application.class.getPackageName())
                .build();
    }

}
