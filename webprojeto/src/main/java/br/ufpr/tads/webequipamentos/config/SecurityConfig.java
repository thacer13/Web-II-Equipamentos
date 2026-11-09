package br.ufpr.tads.webequipamentos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf
                .csrfTokenRepository(new CookieCsrfTokenRepository())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .securityContext(context -> context
                .securityContextRepository(securityContextRepository)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/usuarios/login",
                    "/api/clientes", "/api/usuarios").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/solicitacoes/funcionario")
                    .hasRole("FUNCIONARIO")
                .requestMatchers(HttpMethod.GET, "/api/solicitacoes/cliente")
                    .hasRole("CLIENTE")
                .requestMatchers(HttpMethod.POST, "/api/solicitacoes")
                    .hasRole("CLIENTE")
                .requestMatchers("/api/usuarios/**").hasRole("FUNCIONARIO")
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                .anyRequest().authenticated()
            );
            
        return http.build();
    }
}