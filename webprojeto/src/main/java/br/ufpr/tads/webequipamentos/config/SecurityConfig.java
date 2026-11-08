package br.ufpr.tads.webequipamentos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desativa CSRF para requisições POST externas (Angular)
            .cors(cors -> {})             // Habilita as regras de CORS
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/clientes/**", "/api/auth/**").permitAll() // Libera publicamente o cadastro e login
                .anyRequest().authenticated()
            );
            
        return http.build();
    }
}