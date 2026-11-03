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
                ["descricao", "Descrição do atendimento", "textarea", false],
                ["status", "Status", "select", true, ["Agendado", "Confirmado", "Concluído", "Cancelado"]]
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

    function converterData(d) { return d.split("/").reverse().join("-"); } 
    function formatarData(d) { return d.split("-").reverse().join("/");  } 
    function mascararCpf(cpf) { return "***.***.***-" + cpf.replace(/\D/g, "").slice(-2); }

    let linhaSelecionada = []
    let elementoLinha = undefined;

    const mapeamentoLinha = { // mapeamendo da tabela para os dados na ordem do formulário
        cliente: (l) => ({ nome: l[0], cpf: l[1], nascimento: converterData(l[2]), telefone: l[3], rua: l[4], numero: l[5], complemento: l[6], cep: l[7] }),
        funcionario: (l) => ({ nome: l[0], cargo: l[1], cpf: l[2], telefone: l[3], email: l[4], nascimento: converterData(l[5]) }),
        animal: (l) => ({ nome: l[0], especie: l[1], raca: l[2], sexo: l[3], cliente: l[4], nascimento: converterData(l[5]) }),
        atendimento: (l) => {
            const [data, hora] = l[0].split(" às ");
            return { data: converterData(data), hora, cliente: l[1], animal: l[2], funcionario: l[3], descricao: l[4], status: l[5] };
        }
    };

    const paraLinha = { // mapeamento do formulário para linhas da tabela
        cliente: (v) => [v.nome, mascararCpf(v.cpf), formatarData(v.nascimento), v.telefone, v.rua, v.numero, v.complemento, v.cep],
        funcionario: (v) => [v.nome, v.cargo, mascararCpf(v.cpf), v.telefone, v.email, formatarData(v.nascimento)],
        animal: (v) => [v.nome, v.especie, v.raca, v.sexo, v.cliente, formatarData(v.nascimento)],
        atendimento: (v) => [`${formatarData(v.data)} às ${v.hora}`, v.cliente, v.animal, v.funcionario, v.descricao, v.status]
    };

    function prepararLinha(secao, linha) { 
        const botaoAlterar = secao.querySelector('[data-operation="alteração"]');
        const botaoRemover = secao.querySelector('[data-operation="remoção"]');

        linha.tabIndex = 0;
        linha.setAttribute("role", "button");
        linha.setAttribute("aria-label", `Selecionar registro de ${secao.dataset.entity}`);

        const selecionarLinha = () => {
            secao.querySelectorAll("tbody tr").forEach((item) => item.classList.remove("linhaSelecionada"));
            linha.classList.add("linhaSelecionada");
            botaoAlterar.disabled = false;
            botaoRemover.disabled = false;
            elementoLinha = linha;
            linhaSelecionada = Array.from(linha.cells).map((c) => c.textContent.trim());
        };

        linha.addEventListener("click", selecionarLinha);
        linha.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                selecionarLinha();
            }
        });
    }

    function inicializarSelecaoLinhas() {
        document.querySelectorAll(".operacoesEntidade[data-entity]").forEach((secao) => {
            secao.querySelector('[data-operation="alteração"]').disabled = true;
            secao.querySelector('[data-operation="remoção"]').disabled = true;
            secao.querySelectorAll("tbody tr").forEach((linha) => prepararLinha(secao, linha));
        });
    }

    function campoHTML([id, label, type, obrigatorio, opcoes]) { // função criação do campo textarea, select ou input
        const rotulo = `<label class="form-label" for="${id}">${label}${obrigatorio ? " *" : ""}</label>`;

        if (type === "textarea") {
            return `<div class="col-12">${rotulo}<textarea class="form-control" id="${id}" name="${id}" rows="3"></textarea></div>`;
        }
        if (type === "select") {
            const options = opcoes.map((o) => `<option value="${o}">${o}</option>`).join("");
            return `<div class="col-12 col-md-6">${rotulo}<select class="form-select" id="${id}" name="${id}" ${obrigatorio ? "required" : ""}>${options}</select></div>`;
        }
        return `<div class="col-12 col-md-6">${rotulo}<input class="form-control" id="${id}" name="${id}" type="${type}" ${obrigatorio ? "required" : ""}></div>`;
    }

    const classesStatus = {
        "Agendado": "text-bg-warning",
        "Confirmado": "text-bg-info",
        "Concluído": "text-bg-success",
        "Cancelado": "text-bg-danger"
    };

    function escreverCelula(td, texto, chaveEntidade, indice) {
        if (chaveEntidade === "atendimento" && indice === 5) {
            const badge = document.createElement("span");
            badge.className = `badge ${classesStatus[texto] ?? "text-bg-secondary"}`;
            badge.textContent = texto;
            td.replaceChildren(badge);

        } else {
            td.textContent = texto;
            
        }
    }

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
                                    ${entidade.fields.map(campoHTML).join("")}
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

        if (usaLinha && linhaSelecionada) { // adiciona os dados da linha selecionada ao modal e define os campos como disabled caso a operação seja remoção
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

            const secao = document.querySelector(`.operacoesEntidade[data-entity="${chaveEntidade}"]`);
            const tbody = secao.querySelector("tbody");

            if (chaveOperacao === "cadastro") {
                const valores = Object.fromEntries(new FormData(evento.target));
                const tr = document.createElement("tr");

                paraLinha[chaveEntidade](valores).forEach((texto, i) => {
                    const td = document.createElement("td");
                    escreverCelula(td, texto, chaveEntidade, i);
                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
                prepararLinha(secao, tr);
            }

            if (chaveOperacao === "alteração" && elementoLinha) {
                const valores = Object.fromEntries(new FormData(evento.target));
                const novos = paraLinha[chaveEntidade](valores);

                // atualiza só as colunas do formulário; o status do atendimento fica como está
                novos.forEach((texto, i) => escreverCelula(elementoLinha.cells[i], texto, chaveEntidade, i));
                linhaSelecionada = novos;
            }

            if (ehRemocao && elementoLinha) {
                elementoLinha.remove();
                elementoLinha = null;
                linhaSelecionada = null;
                secao.querySelector('[data-operation="alteração"]').disabled = true;
                secao.querySelector('[data-operation="remoção"]').disabled = true;
            }

            modal.hide();
        });
        modal.show();
    }

    document.addEventListener("click", (evento) => {
        const acionador = evento.target.closest("[data-operation]");
        if (!acionador) return;

        abrirOperacao(acionador.dataset.entity, acionador.dataset.operation);
    });


    inicializarSelecaoLinhas();
})();
