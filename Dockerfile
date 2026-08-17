# Usa a imagem base do JDK 21 LTS (Eclipse Temurin)
FROM eclipse-temurin:21-jdk-jammy

# Evita seleções interativas durante a instalação de pacotes
ENV DEBIAN_FRONTEND=noninteractive

# Instala utilitários essenciais
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instala o Node.js v24 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs=24.19.0-1nodesource1 || apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Instala o Angular CLI v21 e o pnpm
RUN npm install -g @angular/cli@21 pnpm

# Instala o OpenCode CLI
RUN curl -fsSL https://opencode.ai/install | bash -s -- --yes

# Adiciona o OpenCode ao PATH do container
ENV PATH="/root/.local/bin:$PATH"

# Diretório de trabalho padrão
WORKDIR /workspace

# Expõe as portas do Angular (4200) e do Spring Boot (8080)
EXPOSE 4200 8080

# Mantém o container ativo em segundo plano
CMD ["sleep", "infinity"]
