export interface Endereco { // Model para endereço do usuário, com base na utilização do ViaCep
    cep: string;
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
}
