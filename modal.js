(function () {
    const dadosEntidades = {
        cliente: {
            label: "Cliente",
            fields: [
                ["nome", "Nome do cliente", "text", true],
                ["nascimento", "Data de nascimento", "date", true],
                ["rua", "Nome da rua", "text", true],
                ["numero", "Número da rua", "text", true],
                ["complemento", "Complemento (opcional)", "text", false],
                ["cep", "CEP", "text", true],
                ["cpf", "CPF", "text", true],
                ["telefone", "Telefone", "tel", true]
            ]
        },
        funcionario: {
            label: "Funcionário",
            fields: [
                ["nome", "Nome do funcionário", "text", true],
                ["nascimento", "Data de nascimento", "date", true],
                ["cpf", "CPF", "text", true],
                ["cargo", "Cargo", "text", true],
                ["telefone", "Telefone", "tel", true],
                ["email", "E-mail", "email", true]
            ]
        },
        animal: {
            label: "Animal",
            fields: [
                ["nome", "Nome do animal", "text", true],
                ["especie", "Espécie", "text", true],
                ["raca", "Raça", "text", false],
                ["nascimento", "Data de nascimento", "date", false],
                ["sexo", "Sexo", "text", false],
                ["cliente", "Cliente responsável", "text", true]
            ]
        },
        atendimento: {
            label: "Atendimento",
            fields: [
                ["cliente", "Cliente", "text", true],
                ["animal", "Animal", "text", true],
                ["data", "Data do atendimento", "date", true],
                ["hora", "Horário", "time", true],
                ["funcionario", "Funcionário responsável", "text", true],
                ["descricao", "Descrição do atendimento", "textarea", false]
            ]
        }
    };

    const rotulosOperacoes = {
        cadastro: "Cadastrar",
        consulta: "Consultar",
        alteração: "Alterar",
        remocao: "Remover",
        remoção: "Remover"
    };

    function converterData(d) { return d.split("/").reverse().join("-"); } // conversão de 12/04/1988 para 1988-04-12

    const mapeamentoLinha = {
        cliente: (l) => ({ nome: l[0], cpf: l[1], nascimento: converterData(l[2]), telefone: l[3] }),
        funcionario: (l) => ({ nome: l[0], cargo: l[1], cpf: l[2], telefone: l[3], email: l[4] }),
        animal: (l) => ({ nome: l[0], especie: l[1], raca: l[2], sexo: l[3], cliente: l[4] }),
        atendimento: (l) => {
            const [data, hora] = l[0].split(" às ");
            return { data: converterData(data), hora, cliente: l[1], animal: l[2], funcionario: l[3], descricao: l[4] };
        }
    };

    let linhaSelecionada = []

    function abrirOperacao(chaveEntidade, chaveOperacao) {
        const entidade = dadosEntidades[chaveEntidade];
        const rotuloOperacao = rotulosOperacoes[chaveOperacao];
        if (!entidade || !rotuloOperacao) return;

        const ehRemocao = chaveOperacao === "remoção" || chaveOperacao === "remocao";
        const aplicativo = document.getElementById("aplicativoOperacao") || document.body.appendChild(document.createElement("div"));
        aplicativo.id = "aplicativoOperacao";
        aplicativo.innerHTML = `
            <div class="modal fade" id="modalOperacao" tabindex="-1" aria-labelledby="rotuloModalOperacao" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content modal-operacoes">
                        <div class="modal-header">
                            <div>
                                <span class="operacao-kicker">${rotuloOperacao}</span>
                                <h2 class="modal-title" id="rotuloModalOperacao">${rotuloOperacao} ${entidade.label}</h2>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="formularioOperacao">
                            <div class="modal-body">
                                ${ehRemocao ? '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Esta ação não poderá ser desfeita.</div>' : ""}
                                <div class="row g-3">
                                    ${entidade.fields.map(([id, label, type, obrigatorio]) => type === "textarea"
                                        ? `<div class="col-12"><label class="form-label" for="${id}">${label}</label><textarea class="form-control" id="${id}" name="${id}" rows="3"></textarea></div>`
                                        : `<div class="col-12 col-md-6"><label class="form-label" for="${id}">${label}${obrigatorio ? " *" : ""}</label><input class="form-control" id="${id}" name="${id}" type="${type}" ${obrigatorio ? "required" : ""}></div>`
                                    ).join("")}
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-danger rounded-pill px-4">${rotuloOperacao}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;

        const usaLinha = chaveOperacao === "alteração" || ehRemocao;

        if (usaLinha && linhaSelecionada) {
            const valores = mapeamentoLinha[chaveEntidade](linhaSelecionada);

            entidade.fields.forEach(([id]) => {
                const campo = aplicativo.querySelector(`#${id}`);
                campo.value = valores[id] ?? "";
                if (ehRemocao) campo.disabled = true;
            });
        }

        const elementoModal = document.getElementById("modalOperacao");
        const modal = new bootstrap.Modal(elementoModal);
        aplicativo.querySelector("#formularioOperacao").addEventListener("submit", (evento) => {
            evento.preventDefault();
            modal.hide();
        });
        modal.show();
    }

    function inicializarSelecaoLinhas() {
        document.querySelectorAll(".operacoesEntidade[data-entity]").forEach((secao) => {
            const botaoAlterar = secao.querySelector('[data-operation="alteração"]');
            const botaoRemover = secao.querySelector('[data-operation="remoção"]');
            const linhas = secao.querySelectorAll("tbody tr");

            botaoAlterar.disabled = true;
            botaoRemover.disabled = true;
            linhaSelecionada = []

            linhas.forEach((linha) => {
                linha.tabIndex = 0;
                linha.setAttribute("role", "button");
                linha.setAttribute("aria-label", `Selecionar registro de ${secao.dataset.entity}`);

                const selecionarLinha = () => {
                    linhas.forEach((item) => item.classList.remove("linhaSelecionada"));
                    linha.classList.add("linhaSelecionada");
                    botaoAlterar.disabled = false;
                    botaoRemover.disabled = false;

                    linhaSelecionada = []
                    linha.querySelectorAll("td").forEach((el) => {linhaSelecionada.push(el.innerText)})
                    
                };

                linha.addEventListener("click", selecionarLinha);
                linha.addEventListener("keydown", (evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault();
                        selecionarLinha();
                    }
                });
            });
        });
    }

    document.addEventListener("click", (evento) => {
        const acionador = evento.target.closest("[data-operation]");
        if (!acionador) return;

        abrirOperacao(acionador.dataset.entity, acionador.dataset.operation);
    });


    inicializarSelecaoLinhas();
})();
