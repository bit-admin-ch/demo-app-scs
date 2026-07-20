package ch.demo.web.ui;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "FrontendConfigurationController",
     description = "Serves configuration information for the frontend as specified by Quadrel-Services/QdAuth.")
@RestController
@RequestMapping("/ui-api/configuration")
@RequiredArgsConstructor
@Slf4j
public class FrontendConfigurationController {

    @Autowired
    BuildProperties buildProperties;

    @NonNull
    private final FrontendConfigProperties frontendConfigProperties;

    @GetMapping("/auth")
    public @NonNull FrontendAuthConfigurationDto getConfiguration() {
        return FrontendAuthConfigurationDto.builder()
                .applicationUrl(frontendConfigProperties.getApplicationUrl())
                .pamsAppId(frontendConfigProperties.getPamsAppId())
                .pamsEnvironment(frontendConfigProperties.getPamsEnvironment())
                .logoutRedirectUri(frontendConfigProperties.getLogoutRedirectUri())
                .mockPams(frontendConfigProperties.getMockPams())
                .tokenAwarePatterns(frontendConfigProperties.getTokenAwarePatterns())
                .authority(frontendConfigProperties.getAuthority())
                .redirectUrl(frontendConfigProperties.getRedirectUrl())
                .clientId(frontendConfigProperties.getClientId())
                .useAutoLogin(frontendConfigProperties.getAutoLogin())
                .build();
    }

    @GetMapping("/version")
    public String getVersion() {
        return buildProperties.getVersion();
    }

}
