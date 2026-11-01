(function () {
    const entityData = {
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

    const operationLabels = {
        cadastro: "Cadastrar",
        consulta: "Consultar",
        alteração: "Alterar",
        remocao: "Remover",
        remoção: "Remover"
    };

    function openOperation(entityKey, operationKey) {
        const entity = entityData[entityKey];
        const operationLabel = operationLabels[operationKey];
        if (!entity || !operationLabel) return;

        const isRemoval = operationKey === "remoção" || operationKey === "remocao";
        const app = document.getElementById("operacaoApp") || document.body.appendChild(document.createElement("div"));
        app.id = "operacaoApp";
        app.innerHTML = `
            <div class="modal fade" id="operationModal" tabindex="-1" aria-labelledby="operationModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content modal-operacoes">
                        <div class="modal-header">
                            <div>
                                <span class="operacao-kicker">${operationLabel}</span>
                                <h2 class="modal-title" id="operationModalLabel">${operationLabel} ${entity.label}</h2>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="operationForm">
                            <div class="modal-body">
                                ${isRemoval ? '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Esta ação não poderá ser desfeita.</div>' : ""}
                                <div class="row g-3">
                                    ${entity.fields.map(([id, label, type, required]) => type === "textarea"
                                        ? `<div class="col-12"><label class="form-label" for="${id}">${label}</label><textarea class="form-control" id="${id}" name="${id}" rows="3"></textarea></div>`
                                        : `<div class="col-12 col-md-6"><label class="form-label" for="${id}">${label}${required ? " *" : ""}</label><input class="form-control" id="${id}" name="${id}" type="${type}" ${required ? "required" : ""}></div>`
                                    ).join("")}
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-danger rounded-pill px-4">${operationLabel}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;

        const modalElement = document.getElementById("operationModal");
        const modal = new bootstrap.Modal(modalElement);
        app.querySelector("#operationForm").addEventListener("submit", (event) => {
            event.preventDefault();
            modal.hide();
        });
        modal.show();
    }

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-operation]");
        if (trigger) openOperation(trigger.dataset.entity, trigger.dataset.operation);
    });
})();
