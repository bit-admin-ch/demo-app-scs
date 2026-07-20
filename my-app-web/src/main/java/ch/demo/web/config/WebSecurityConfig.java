package ch.demo.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;


@Configuration
public class WebSecurityConfig  {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 11)
    public SecurityFilterChain uiSecurityFilterChain(HttpSecurity http) {

        // protect the API
        // allow public access to frontend resources (i.e. non-/api-routes)
        // permit open access to open API docs & swagger ui as they are only enabled on test environments
        RequestMatcher apiPathMatcher = request -> request.getServletPath().startsWith("/api/");
        RequestMatcher uiApiPathMatcher = request -> request.getServletPath().startsWith("/ui-api/persons");
        OrRequestMatcher orRequestMatcher = new OrRequestMatcher(apiPathMatcher, uiApiPathMatcher);
        RequestMatcher matcher = new NegatedRequestMatcher(orRequestMatcher);
        http.securityMatcher(matcher)
                .authorizeHttpRequests(authorizeHttpRequests ->
                        authorizeHttpRequests.anyRequest().permitAll());

        // this is used for the auth - silent-renew.html
        http.headers(headers ->
                headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));

        return http.build();
    }

}
