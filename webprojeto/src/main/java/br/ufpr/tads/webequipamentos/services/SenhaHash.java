package br.ufpr.tads.webequipamentos.services;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;


@Component
public class SenhaHash {

    private final SecureRandom random = new SecureRandom();

    public String gerarSalt() {
        byte[] bytes = new byte[8];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

  
    public String gerarSenhaNumerica() {
        return String.format("%04d", random.nextInt(10000));
    }

    public String hash(String salt, String senha) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] resultado = sha256.digest((salt + senha).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resultado);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível.", e);
        }
    }

    public boolean confere(String senha, String salt, String hashSalvo) {
        if (senha == null || salt == null || hashSalvo == null) {
            return false;
        }
        return MessageDigest.isEqual(
            hash(salt, senha).getBytes(StandardCharsets.UTF_8),
            hashSalvo.getBytes(StandardCharsets.UTF_8)
        );
    }
}