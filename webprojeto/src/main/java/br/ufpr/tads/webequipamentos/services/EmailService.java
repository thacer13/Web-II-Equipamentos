package br.ufpr.tads.webequipamentos.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailCadastro(String destinatario, String senha) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(destinatario);
        mensagem.setSubject("Conclusão do seu Cadastro - Sistema de Manutenção de Equipamentos");
        mensagem.setText(
            "Olá!\n\n" +
            "Seu cadastro no sistema de manutenção de equipamentos foi realizado com sucesso.\n" +
            "Sua senha de acesso é: " + senha + "\n\n" +
            "Atenciosamente,\nEquipe de Suporte"
        );

        mailSender.send(mensagem);
    }
}