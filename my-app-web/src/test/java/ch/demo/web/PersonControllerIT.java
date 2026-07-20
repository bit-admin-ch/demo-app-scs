package ch.demo.web;

import ch.admin.bit.jeap.security.resource.semanticAuthentication.SemanticApplicationRole;
import ch.admin.bit.jeap.security.resource.token.JeapAuthenticationToken;
import ch.admin.bit.jeap.security.test.resource.JeapAuthenticationTestTokenBuilder;
import ch.demo.Application;
import ch.demo.web.ui.FrontendConfigurationControllerSecurityConfig;
import io.restassured.module.mockmvc.RestAssuredMockMvc;
import io.restassured.module.mockmvc.response.MockMvcResponse;
import io.restassured.path.json.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.context.WebApplicationContext;

import static io.restassured.module.mockmvc.RestAssuredMockMvc.given;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

@SpringBootTest(classes = Application.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Import(RestApiTestContext.class)
class PersonControllerIT {

    private static final SemanticApplicationRole PERSON_READ_ROLE = SemanticApplicationRole.builder()
            .system("demo")
            .resource("person")
            .operation("read")
            .build();

    private static final SemanticApplicationRole PERSON_WRITE_ROLE = SemanticApplicationRole.builder()
            .system("demo")
            .resource("person")
            .operation("write")
            .build();

    private static final SemanticApplicationRole FOO_ROLE = SemanticApplicationRole.builder()
            .system("demo")
            .resource("foo")
            .operation("dummy")
            .build();

    private static final String BASE_PATH = "/ui-api/persons";

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private FrontendConfigurationControllerSecurityConfig frontendConfigurationControllerSecurityConfig;

    @BeforeEach
    void initializeRestAssuredMockMvcWebApplicationContext() {
        RestAssuredMockMvc.webAppContextSetup(webApplicationContext);
    }

    @Test
    void createAndDelete() {
        String createdPersonId = createAndGetPersonId();
        JeapAuthenticationToken authentication = createAuthenticationForUserRoles(PERSON_READ_ROLE);
        // Verify created person
        given()
                .auth().with(authentication(authentication))
                .when()
                .get(BASE_PATH + "/" + createdPersonId)
                .then()
                .statusCode(200)
                .body("firstname", equalTo("a"))
                .body("lastname", equalTo("b"))
                .extract()
                .response();

        deletePerson(createdPersonId);

        verifyDeletion();
    }

    @Test
    void updatePerson() {
        String createdPersonId = createAndGetPersonId();

        // Update person
        given()
                .auth().with(authentication(createAuthenticationForUserRoles(PERSON_WRITE_ROLE)))
                .queryParam("firstname", "a1")
                .queryParam("lastname", "b1")
                .when()
                .put(BASE_PATH + "/" + createdPersonId)
                .then()
                .statusCode(200);

        // Verify change
        given()
                .auth().with(authentication(createAuthenticationForUserRoles(PERSON_READ_ROLE)))
                .when()
                .get(BASE_PATH + "/" + createdPersonId)
                .then()
                .statusCode(200)
                .body("firstname", equalTo("a1"))
                .body("lastname", equalTo("b1"))
                .extract()
                .response();

        deletePerson(createdPersonId);

        verifyDeletion();
    }

    @Test
    void createPerson_forbidden() {
        given()
                .auth().with(authentication(createAuthenticationForUserRoles(FOO_ROLE)))
                .queryParam("firstname", "a")
                .queryParam("lastname", "b")
                .when()
                .post(BASE_PATH)
                .then()
                .statusCode(403);
    }

    @Test
    void getPerson_forbidden() {
        given()
                .auth().with(authentication(createAuthenticationForUserRoles(FOO_ROLE)))
                .when()
                .get(BASE_PATH)
                .then()
                .statusCode(403);
    }

    private String createAndGetPersonId() {
        MockMvcResponse createPersonResponse = given()
                .auth().with(authentication(createAuthenticationForUserRoles(PERSON_WRITE_ROLE)))
                .queryParam("firstname", "a")
                .queryParam("lastname", "b")
                .when()
                .post(BASE_PATH)
                .then()
                .statusCode(201)
                .extract()
                .response();
        JsonPath jsonPathEvaluator = createPersonResponse.jsonPath();
        return jsonPathEvaluator.get("id");
    }

    private void verifyDeletion() {
        given()
                .auth().with(authentication(createAuthenticationForUserRoles(PERSON_READ_ROLE)))
                .when()
                .get(BASE_PATH)
                .then()
                .statusCode(200)
                .body(equalTo("[]"));
    }

    private void deletePerson(String createdPersonId) {
        given()
                .auth().with(authentication(createAuthenticationForUserRoles(PERSON_WRITE_ROLE)))
                .when()
                .delete(BASE_PATH + "/" + createdPersonId)
                .then()
                .statusCode(200);
    }

    private JeapAuthenticationToken createAuthenticationForUserRoles(SemanticApplicationRole... userroles)  {
        return JeapAuthenticationTestTokenBuilder.create().withUserRoles(userroles).build();
    }

}
