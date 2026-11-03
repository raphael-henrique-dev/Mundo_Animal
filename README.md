# 🐾 Mundo Animal

Sistema web de gestão para petshop, com cadastro de clientes, funcionários, animais e atendimentos, painel com métricas e geração de relatórios.

🔗 **Acesse o projeto:** [Mundo Animal](https://raphael-henrique-dev.github.io/Mundo_Animal/index.html)

> ⚠️ Este é um projeto de front-end com **dados mockados (artificiais)** para fins de demonstração. Nenhuma informação é enviada a um servidor ou salva no navegador: ao recarregar a página, os dados voltam ao estado original.

---

## 📋 Funcionalidades

- **Dashboard (página inicial):** gráfico de atendimentos por mês, faturamento, total de atendimentos do mês e distribuição por status.
- **Gestão de entidades:** páginas dedicadas para **clientes**, **funcionários**, **animais** e **atendimentos**, cada uma com tabela de registros.
- **Cadastrar, alterar e remover:** operações feitas por meio de um modal com formulário.
- **Seleção de linhas:** os botões *Alterar* e *Remover* só são habilitados depois de selecionar um registro (por clique ou pelo teclado, com Enter ou Espaço).
- **Relatórios com filtros:** cada página de entidade possui uma seção de relatório com filtros específicos, prévia dos resultados e total de registros.
- **PDF (simulado):** após gerar o relatório, é possível abrir uma visualização que simula o PDF, com título, filtros aplicados, data de emissão, tabela e total.

### Filtros dos relatórios

| Página | Filtros disponíveis |
|---|---|
| Clientes | Nome, Rua, Nascimento (de/até) |
| Funcionários | Nome, Cargo, Nascimento (de/até) |
| Animais | Nome, Espécie, Sexo, Responsável, Nascimento (de/até) |
| Atendimentos | Cliente, Animal, Funcionário, Status, Data (de/até) |

O relatório lê os dados da tabela exibida na página, então registros cadastrados, alterados ou removidos pelo modal passam a fazer parte dele. As opções dos filtros de seleção também são montadas a partir dos valores existentes na tabela.

---

## 🛠️ Tecnologias

- HTML5
- CSS3
- [Bootstrap 5.2.1](https://getbootstrap.com/docs/5.2/)
- [Bootstrap Icons 1.13.2](https://icons.getbootstrap.com/)
- JavaScript (vanilla, sem frameworks)

Bootstrap e Bootstrap Icons são carregados por CDN, portanto é necessário ter conexão com a internet para a página ser exibida corretamente.


---

## 🚀 Como executar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/raphael-henrique-dev/Mundo_Animal.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd Mundo_Animal
   ```

3. Abra o arquivo `index.html` no navegador, ou sirva a pasta com uma extensão como o **Live Server** do VS Code.

Não há dependências para instalar nem etapa de build.

---

## 📌 Observações

- Os dados exibidos são fictícios, e os CPFs aparecem mascarados (`***.***.***-00`).
- As operações de cadastro, alteração e remoção atuam apenas na tabela da página aberta, sem persistência.
- A geração de PDF é uma simulação: nenhum arquivo é criado ou baixado.

---

## 👥 Autores

| Nome | RA |
|---|---|
| Pedro Henrique Martins Alcantara | 145130 |
| Raphael Henrique Teixeira e Silva | 147190 |