package br.ufpr.tads.webequipamentos.services;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;

@Service
public class EmailService {

    private static final String CARACTERES = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$*";
    private static final int TAMANHO_SENHA = 8;
    private final SecureRandom random = new SecureRandom();

    /**
     * Gera uma senha temporária aleatória e segura.
     */
    public String gerarSenhaAleatoria() {
        StringBuilder senha = new StringBuilder(TAMANHO_SENHA);
        for (int i = 0; i < TAMANHO_SENHA; i++) {
            int index = random.nextInt(CARACTERES.length());
            senha.append(CARACTERES.charAt(index));
        }
        return senha.toString();
    }

    // public String gerarSenhaAleatoria() {
    //     StringBuilder senha = new StringBuilder(TAMANHO_SENHA);
    //     for (int i = 0; i < TAMANHO_SENHA; i++) {
    //         int index = random.nextInt(CARACTERES.length());
    //         senha.append(CARACTERES.charAt(index));
    //     }
    //     return senha.toString();
    // }

    /**
     * Simula o envio de e-mail de cadastro exibindo os dados no console.
     */
    public void enviarEmailCadastro(String destinatario, String senhaTemporaria) {
        System.out.println("\n==================================================");
        System.out.println("[SIMULAÇÃO DE ENVIO DE E-MAIL]");
        System.out.println("Para: " + destinatario);
        System.out.println("Assunto: Conclusão do seu Cadastro - Sistema Web");
        System.out.println("--------------------------------------------------");
        System.out.println("Olá! Seu cadastro foi realizado com sucesso.");
        System.out.println("Sua senha temporária de acesso é: " + senhaTemporaria);
        System.out.println("Recomendamos alterá-la após o primeiro acesso.");
        System.out.println("==================================================\n");
        // System.out.println("\n==================================================");
        // System.out.println("[SIMULAÇÃO DE ENVIO DE E-MAIL]");
        // System.out.println("Para: " + destinatario);
        // System.out.println("Assunto: Conclusão do seu Cadastro - Sistema Web");
        // System.out.println("--------------------------------------------------");
        // System.out.println("Olá! Seu cadastro foi realizado com sucesso.");
        // System.out.println("Sua senha temporária de acesso é: " + senhaTemporaria);
        // System.out.println("Recomendamos alterá-la após o primeiro acesso.");
        // System.out.println("==================================================\n");
    }
}