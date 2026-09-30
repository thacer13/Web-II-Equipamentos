import { Endereco } from "./endereco.model";
import { Usuario } from "./usuario.model";

export interface Cliente extends Usuario { // Usuário que forem cliente armazenam também cpf, telefone e endereço.
    cpf: string;
    telefone: string;
    endereco: Endereco;
}
