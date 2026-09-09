import { Usuario } from "./usuario.model";

export interface Funcionario extends Usuario { // Usuário que forem funcionário armazenam também data de nascimento.
    dataNascimento: string; // No Spring Boot, trafegar datas no formato ISO de string (ex: "1995-10-25") costuma ser bem mais simples
}
