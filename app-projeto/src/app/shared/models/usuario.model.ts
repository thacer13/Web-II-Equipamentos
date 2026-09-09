export type Perfil = 'CLIENTE' | 'FUNCIONARIO' // Tipo Perfil, que será atributo do usuário

export interface Usuario {
    id?: number;
    nome: string;
    email: string;
    senha?: string;
    perfil: Perfil;
}
