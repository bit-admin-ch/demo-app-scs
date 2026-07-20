package ch.demo.web.ui;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;


@Configuration
public class FrontendConfigurationControllerSecurityConfig {

    /**
     * Creates a RequestMatcher that matches GET requests to URLs that start with "/ui-api/configuration/**".
     *
     * @return a {@link RequestMatcher} for the configuration service API requests.
     */
    private static RequestMatcher configurationServiceMatcher() {
        return PathPatternRequestMatcher.withDefaults().matcher("/ui-api/configuration/**");
    }

    /**
     * Defines a security filter chain for the configuration service.
     * This method creates a security filter chain that matches requests to the "/ui-api/configuration/**"
     * endpoint for GET HTTP method. All such requests are permitted without any authentication.
     * The filter chain is assigned a high priority using {@link Order}, with precedence set to
     * {@link Ordered#HIGHEST_PRECEDENCE} + 12.
     *
     * @param http the {@link HttpSecurity} object used to configure the security settings.
     * @return a {@link SecurityFilterChain} configured to allow access to the configuration service API.
     * @throws Exception if an error occurs while configuring security.
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 12)
    SecurityFilterChain configSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(configurationServiceMatcher());
        http.authorizeHttpRequests( authorizeHttpRequests ->
                authorizeHttpRequests.anyRequest().permitAll());
        return http.build();
    }
}
