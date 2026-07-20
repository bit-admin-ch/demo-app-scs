package ch.demo.web.ui;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class FrontendAuthConfigurationDto {

    String applicationUrl;
    String logoutRedirectUri;
    boolean mockPams;
    String pamsAppId;
    String pamsEnvironment;
    List<String> tokenAwarePatterns;
    String authority;
    String redirectUrl;
    String clientId;
    boolean useAutoLogin;
}
