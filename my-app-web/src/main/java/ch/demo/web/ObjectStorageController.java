package ch.demo.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

import static org.springframework.http.HttpStatus.CREATED;
import static software.amazon.awssdk.core.sync.RequestBody.fromBytes;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/objects")
@Slf4j
public class ObjectStorageController {

    private static final String BUCKET_NAME = "bucket-name";

    private final S3Client s3Client;

    @PreAuthorize("hasRole('object','write')")
    @PutMapping(value = "/{key}", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Void> putObject(@PathVariable("key") String key, @RequestBody byte[] data) {

        log.info("Saving object with key '{}'", key);
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();
        s3Client.putObject(request, fromBytes(data));

        return ResponseEntity.status(CREATED).build();
    }

    @PreAuthorize("hasRole('object','read')")
    @GetMapping(value = "/{key}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public byte[] getObject(@PathVariable("key") String key) throws IOException {

        log.info("Get object content for object with key '{}'", key);
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();
        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);

        return response.readAllBytes();
    }

    @PreAuthorize("hasRole('object','write')")
    @DeleteMapping(value = "/{key}")
    public ResponseEntity<Void> deleteObject(@PathVariable("key") String key) {

        log.info("Deleting object with key '{}'", key);
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();
        s3Client.deleteObject(request);

        return ResponseEntity.ok().build();
    }
}
