package ch.demo.web;

import ch.admin.bit.jeap.security.test.resource.configuration.ServletJeapAuthorizationConfig;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

/**
 * Security configuration used only by REST API tests that explicitly import
 * this class.
 *
 * It is deliberately a TestConfiguration so it is not discovered by the
 * normal application component scan and therefore not loaded by UiBrowserIT.
 */
@TestConfiguration(proxyBeanMethods = false)
@EnableWebSecurity
public class RestApiTestContext
        extends ServletJeapAuthorizationConfig {

    RestApiTestContext(ApplicationContext applicationContext) {
        super("demo", applicationContext);
    }
}