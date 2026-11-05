package br.ufpr.tads.webequipamentos.services;

import java.util.regex.Pattern;


public final class Validacoes {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private Validacoes() {
    }

    public static String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    public static boolean textoEntre(String valor, int min, int max) {
        int tamanho = valor == null ? 0 : valor.trim().length();
        return tamanho >= min && tamanho <= max;
    }

    public static boolean emailValido(String email) {
        if (email == null) {
            return false;
        }
        String limpo = email.trim();
        return limpo.length() <= 150 && EMAIL.matcher(limpo).matches();
    }

    public static boolean cpfValido(String valor) {
        String cpf = somenteDigitos(valor);

        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            return false;
        }

        for (int tamanho = 9; tamanho < 11; tamanho++) {
            int soma = 0;
            for (int i = 0; i < tamanho; i++) {
                soma += (cpf.charAt(i) - '0') * (tamanho + 1 - i);
            }
            int digito = (soma * 10 % 11) % 10;
            if (digito != cpf.charAt(tamanho) - '0') {
                return false;
            }
        }

        return true;
    }
}