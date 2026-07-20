package ch.demo.web.ui;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration properties that will be forwarded to the UI
 */
@Configuration
@ConfigurationProperties(prefix = "frontend.auth")
@Validated
@Data
public class FrontendConfigProperties {
    /**
     * Authentication server to be used.
     */
    @NotEmpty
    private String authority;

    /**
     * URL of the application
     */
    @NotEmpty
    private String applicationUrl;

    /**
     * URL of the application for the redirect URI after a login.
     */
    @NotEmpty
    private String redirectUrl;

    /**
     * URL to go to after a logout.
     */
    @NotEmpty
    private String logoutRedirectUri;

    /**
     * Should PAMS mock be used.
     */
    @NotNull
    private Boolean mockPams;

    /**
     * An app ID is the unique identifier of an application in all respects.
     */
    @NotEmpty
    private String pamsAppId;

    /**
     * Pams Environment to be used.
     */
    @NotEmpty
    private String pamsEnvironment;

    /**
     * List of backend where to a token shall be send.
     */
    private List<String> tokenAwarePatterns = new ArrayList<>();

    /**
     * Oidc client id
     */
    @NotEmpty
    String clientId;

    /**
     * Should silent renew be used (currently only >= REF)
     */
    @NotNull
    private Boolean silentRenew;

    /**
     * Default system name for authorization filter
     */
    @NotEmpty
    String systemName;

    /**
     * Should automatically login, when PAMS session is not active
     */
    @NotNull
    private Boolean autoLogin;

    /**
     * Should new claim be submitted after token was renewed (e.g. silent renew)
     */
    @NotNull
    private Boolean renewUserInfoAfterTokenRenew;

}
