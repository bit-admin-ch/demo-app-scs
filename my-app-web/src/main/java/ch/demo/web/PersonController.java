package ch.demo.web;

import ch.demo.domain.Person;
import ch.demo.domain.PersonRepository;
import com.fasterxml.uuid.Generators;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/ui-api/persons")
@Slf4j
public class PersonController {

    private final PersonRepository personRepository;

    @PreAuthorize("hasRole('person','write')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Person create(String firstname, String lastname){
        // Use a time-based (Unix Epoch time + random based) v7 UUID generator. This improves index-based database querying.
        UUID id = Generators.timeBasedEpochGenerator().generate();
        final Person person = personRepository.save(new Person(id, firstname, lastname));
        log.info("Person with id '{}' created", person);
        return person;
    }

    @PreAuthorize("hasRole('person','write')")
    @PutMapping("{id}")
    public void update(@PathVariable UUID id, String firstname, String lastname){
        final Person person = personRepository.save(new Person(id, firstname, lastname));
        log.info("Person with id '{}' updated", person);
    }

    @PreAuthorize("hasRole('person','read')")
    @GetMapping
    public List<Person> findAll() {
        return personRepository.findAll();
    }

    @PreAuthorize("hasRole('person','read')")
    @GetMapping("{id}")
    public Optional<Person> findById(@PathVariable UUID id) {
        return personRepository.findById(id);
    }

    @PreAuthorize("hasRole('person','write')")
    @DeleteMapping("{id}")
    public void deleteById(@PathVariable UUID id){
        personRepository.deleteById(id);
        log.info("Person with id '{}' deleted", id);
    }

}
