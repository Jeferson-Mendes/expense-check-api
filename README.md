# expense-check-api

API para análise de imagens utilizando integração com o Google Gemini e desenvolvida em Node.js utilizando o Nest.js, com TypeOrm e banco de dados PostgreSQL. O projeto está conteinerizado usando Docker, permitindo fácil configuração e execução.

## Pré-requisitos

### Sem Docker

- Node.js
- NPM
- PostgreSQL
- Git (Opcional)
- GitHub (Opcional)

### Com Docker

- Docker
- Docker Compose
- Git (Opcional)
- GitHub (Opcional)

## Configuração

### Sem Docker

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/Jeferson-Mendes/expense-check-api.git
    cd expense-check-api
    ```

2. **Configure o banco de dados PostgreSQL:**

    Crie um banco de dados PostgreSQL e um usuário. Anote as credenciais para serem usadas no `.env` do seu projeto.

3. **Configure o `.env`:**

    Abra o arquivo `.env` e configure as propriedades do banco de dados conforme necessário (Para rodar localmente, basta configurar o `GEMINI_API_KEY`).:

    ```properties
    GEMINI_API_KEY={API-KEY}
    ```

4. **Instale as dependências:**

    ```bash
    npm run install
    ```

5. **Execute a aplicação em ambiente de desenvolvimento:**

    ```bash
    npm run start:dev
    ```

A aplicação estará disponível em `http://localhost:3000`.

### Com o Docker instalado

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/Jeferson-Mendes/expense-check-api.git
    cd expense-check-api

3. **Crie e execute seu aplicativo com o Compose:**

    ```bash
    docker compose up
    ```

    Isso irá construir as imagens Docker e iniciar os contêineres do PostgreSQL e da aplicação Nest.js.

A aplicação estará disponível em `http://localhost:3000`.

## Endpoints da API

A API possui os seguintes endpoints:

- `POST /measures/upload`: Recebe uma imagem em um conteúdo multipart/form-data, além de outras informações sobre a medição
- `PATCH /measures/confirm`: Serve para confirmar ou corrigir um valor lido pela LLM
- `PATCH /measures/{consumer_code}/list?measure_type=WATER`: Serve para retornar uma lista com todas as leituras do consumidor, com a opção de filtragem (WATER ou GAS)