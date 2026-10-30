package br.ufpr.tads.webequipamentos.webprojeto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "br.ufpr.tads.webequipamentos")
public class WebprojetoApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebprojetoApplication.class, args);
    }

}
