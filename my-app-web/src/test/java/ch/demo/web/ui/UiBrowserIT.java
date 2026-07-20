package ch.demo.web.ui;

import ch.admin.bit.jeap.security.test.mock.OidcAuthorizationMockServer;
import ch.admin.bit.jeap.security.test.resource.configuration.DisableJeapPermitAllSecurityConfiguration;
import ch.demo.Application;
import ch.demo.domain.Person;
import ch.demo.domain.PersonRepository;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.WaitForSelectorState;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * True end-to-end Playwright tests:
 * <p>
 * A real browser drives the Angular frontend, which calls the actual
 * Spring REST controllers and persists data through H2.
 * <p>
 * Authentication is performed against the reusable OIDC mock server.
 */
@SpringBootTest(
        classes = Application.class,
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT
)
@ActiveProfiles({"test", "frontend-e2e"})
@Import(DisableJeapPermitAllSecurityConfiguration.class)
class UiBrowserIT {

    private static final int APP_PORT = 18080;
    private static final int OAUTH_MOCK_PORT = 18081;

    private static final String APP_CONTEXT_PATH =
            "/my-app";

    private static final String OAUTH_CONTEXT_PATH =
            "/oauth-context-path";

    private static final String CLIENT_ID =
            "my-app";

    private static final String SYSTEM_NAME = "demo";

    private static final String SUBJECT =
            "938A4A93-C7FB-4B89-B38B-8BC2C0748AA8";

    private static final String ISSUER =
            "http://localhost:"
                    + OAUTH_MOCK_PORT
                    + OAUTH_CONTEXT_PATH;

    private static Playwright playwright;
    private static Browser browser;
    private static OidcAuthorizationMockServer oauthMockServer;

    @Autowired
    private PersonRepository personRepository;

    private BrowserContext context;
    private Page page;

    @DynamicPropertySource
    static void oauthProperties(
            DynamicPropertyRegistry registry
    ) {
        /*
         * DynamicPropertySource runs before the Spring ApplicationContext
         * is created. The jEAP resource-server configuration can therefore
         * already reach the mock issuer and JWK endpoint during startup.
         */
        ensureOauthMockServerStarted();

        registry.add(
                "jeap.security.oauth2.resourceserver"
                        + ".authorization-server.issuer",
                () -> ISSUER
        );

        registry.add(
                "jeap.security.oauth2.resourceserver"
                        + ".authorization-server.jwk-set-uri",
                () -> ISSUER + "/.well-known/jwks.json"
        );

        /*
         * Required for semantic role expressions such as:
         * hasRole("person", "read")
         */
        registry.add(
                "jeap.security.oauth2.resourceserver.system-name",
                () -> SYSTEM_NAME
        );

        registry.add(
                "frontend.auth.authority",
                () -> ISSUER
        );

        registry.add(
                "frontend.auth.applicationUrl",
                () -> baseUrlStatic() + "/"
        );

        registry.add(
                "frontend.auth.redirect-url",
                () -> baseUrlStatic() + "/redirect"
        );

        registry.add(
                "frontend.auth.clientId",
                () -> CLIENT_ID
        );

        registry.add(
                "frontend.auth.system-name",
                () -> SYSTEM_NAME
        );

        registry.add(
                "frontend.auth.mockPams",
                () -> true
        );

        registry.add(
                "frontend.auth.auto-login",
                () -> true
        );

        registry.add(
                "frontend.auth.silent-renew",
                () -> false
        );

        registry.add(
                "frontend.auth.renew-user-info-after-token-renew",
                () -> false
        );

        /*
         * Relative REST calls used by a production frontend build.
         */
        registry.add(
                "frontend.auth.tokenAwarePatterns[0]",
                () -> "^"
                        + APP_CONTEXT_PATH
                        + "/api/.*"
        );

        /*
         * Absolute REST calls that can occur in development-style builds.
         */
        registry.add(
                "frontend.auth.tokenAwarePatterns[1]",
                () -> "^http://localhost:"
                        + APP_PORT
                        + APP_CONTEXT_PATH
                        + "/api/.*"
        );

        /*
         * Relative UI API calls.
         */
        registry.add(
                "frontend.auth.tokenAwarePatterns[2]",
                () -> "^"
                        + APP_CONTEXT_PATH
                        + "/ui-api/.*"
        );

        /*
         * Absolute UI API calls.
         */
        registry.add(
                "frontend.auth.tokenAwarePatterns[3]",
                () -> "^http://localhost:"
                        + APP_PORT
                        + APP_CONTEXT_PATH
                        + "/ui-api/.*"
        );
    }

    @BeforeAll
    static void launchBrowser() {
        /*
         * The OAuth mock is already running because it was started in
         * DynamicPropertySource before the ApplicationContext was created.
         */
        playwright = Playwright.create();

        browser = playwright.chromium().launch(
                new BrowserType.LaunchOptions()
                        .setHeadless(true)
        );
    }

    @AfterAll
    static void closeInfrastructure() {
        if (browser != null) {
            browser.close();
            browser = null;
        }

        if (playwright != null) {
            playwright.close();
            playwright = null;
        }

        if (oauthMockServer != null) {
            oauthMockServer.stop();
            oauthMockServer = null;
        }
    }

    @BeforeEach
    void setUp() {
        personRepository.deleteAll();

        if (oauthMockServer != null) {
            oauthMockServer.reset();
        }

        context = browser.newContext(
                new Browser.NewContextOptions()
                        .setLocale("de-CH")
        );

        page = context.newPage();
        page.setDefaultTimeout(30_000);

        page.onResponse(response -> {
            if ((response.url().contains("/api/")
                    || response.url().contains("/ui-api/"))
                    && response.status() >= 400) {
                System.err.printf(
                        "Browser response: %d %s %s%n",
                        response.status(),
                        response.request().method(),
                        response.url()
                );
            }
        });

        page.onPageError(error ->
                System.err.println(
                        "Browser page error: " + error
                )
        );
    }

    @AfterEach
    void closePage() {
        if (context != null) {
            context.close();
            context = null;
        }
    }

    @Test
    void personsOverview_loadsAfterFullOAuthFlow() {
        page.navigate(baseUrl());

        waitForAttached(
                "app-persons-overview"
        );

        waitForVisible(
                "header.object-header-title:has-text('Übersicht')"
        );

        assertThat(
                page.locator(
                        "header.object-header-title:has-text('Übersicht')"
                ).isVisible()
        ).isTrue();
    }

    @Test
    void authConfigEndpoint_returnsOauthMockServerAuthority() {
        var response = page.request().get(
                baseUrl() + "/ui-api/configuration/auth"
        );

        assertThat(response.status())
                .isEqualTo(200);

        assertThat(response.text())
                .contains("\"mockPams\":true")
                .contains(ISSUER);
    }

    @Test
    void versionEndpoint_isPublic() {
        var response = page.request().get(
                baseUrl() + "/ui-api/configuration/version"
        );

        assertThat(response.status())
                .isEqualTo(200);

        assertThat(response.text())
                .isNotBlank();
    }

    @Test
    void createPerson_fromOverview_persistsInTable() {
        page.navigate(baseUrl());

        /*
         * First complete the OAuth flow and load the authenticated overview.
         */
        waitForAttached(
                "app-persons-overview"
        );

        page.navigate(baseUrl() + "/create");

        waitForAttached(
                "app-person-create-stepper"
        );

        waitForVisible(
                "header.object-header-title"
                        + ":has-text('Neue Person erfassen')"
        );

        page.locator("input")
                .nth(0)
                .fill("Anna");

        page.locator("input")
                .nth(1)
                .fill("Tester");

        page.locator(
                "[data-test-id='footer-primary-button-submit']"
        ).click();

        waitForVisible(
                "header.object-header-title:has-text('Übersicht')"
        );

        waitForVisible(
                "td:has-text('Anna')"
        );

        assertThat(
                page.locator("td:has-text('Anna')")
                        .first()
                        .isVisible()
        ).isTrue();

        assertThat(
                page.locator("td:has-text('Tester')")
                        .first()
                        .isVisible()
        ).isTrue();

        assertThat(
                personExists("Anna", "Tester")
        ).isTrue();
    }

    @Test
    void deletePerson_fromOverview_removesRow() {
        personRepository.save(
                new Person(
                        UUID.randomUUID(),
                        "Max",
                        "Muster"
                )
        );

        page.navigate(baseUrl());

        waitForVisible(
                "header.object-header-title:has-text('Übersicht')"
        );

        waitForVisible(
                "td:has-text('Max')"
        );

        assertThat(
                page.locator("td:has-text('Max')")
                        .first()
                        .isVisible()
        ).isTrue();

        page.locator(
                "[data-test-id$='-secondary-actions-toggler']"
        ).first().click();

        page.locator(
                "[data-test-id$='-secondary-actions-0']"
        ).first().click();

        Locator firstNameCell =
                page.locator("td:has-text('Max')").first();

        firstNameCell.waitFor(
                new Locator.WaitForOptions()
                        .setState(WaitForSelectorState.DETACHED)
        );

        assertThat(
                page.locator("td:has-text('Max')").count()
        ).isZero();

        assertThat(
                page.locator("td:has-text('Muster')").count()
        ).isZero();

        assertThat(
                personExists("Max", "Muster")
        ).isFalse();
    }

    private static synchronized void ensureOauthMockServerStarted() {
        if (oauthMockServer != null) {
            return;
        }

        oauthMockServer = OidcAuthorizationMockServer.builder(
                        OAUTH_MOCK_PORT,
                        OAUTH_CONTEXT_PATH,
                        "http://localhost:" + APP_PORT
                )
                .withDefaultClientId(CLIENT_ID)
                .withSubject(SUBJECT)
                .withGivenName("E2E")
                .withFamilyName("Testuser")
                .withName("E2E Testuser")
                .withUserRoles(List.of(
                        "demo_@person_#read",
                        "demo_@person_#write"
                ))
                .build();

        oauthMockServer.start();
    }

    private boolean personExists(
            String firstName,
            String lastName
    ) {
        return personRepository.findAll()
                .stream()
                .anyMatch(person ->
                        firstName.equals(person.getFirstname())
                                && lastName.equals(
                                person.getLastname()
                        )
                );
    }

    private void waitForAttached(
            String selector
    ) {
        page.waitForSelector(
                selector,
                new Page.WaitForSelectorOptions()
                        .setState(WaitForSelectorState.ATTACHED)
        );
    }

    private void waitForVisible(
            String selector
    ) {
        page.waitForSelector(
                selector,
                new Page.WaitForSelectorOptions()
                        .setState(WaitForSelectorState.VISIBLE)
        );
    }

    private String baseUrl() {
        return baseUrlStatic();
    }

    private static String baseUrlStatic() {
        return "http://localhost:"
                + APP_PORT
                + APP_CONTEXT_PATH;
    }
}