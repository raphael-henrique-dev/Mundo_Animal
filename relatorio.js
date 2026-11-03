(function () {
    const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const converterData = (t) => { const m = t.match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ""; };
    const formatarData = (iso) => iso.split("-").reverse().join("/");
    const agora = () => {
        const d = new Date(), p = (n) => String(n).padStart(2, "0");
        return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
    };

    // modal simulando PDF
    function abrirPdf(titulo, filtros, tabela, total) {
        const host = document.getElementById("aplicativoRelatorio") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "aplicativoRelatorio" }));
        host.innerHTML = `
            <div class="modal fade" tabindex="-1" aria-labelledby="tituloModalRelatorio" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                    <div class="modal-content modal-operacoes">
                        <div class="modal-header">
                            <div>
                                <span class="operacao-kicker">Relatório</span>
                                <h2 class="modal-title" id="tituloModalRelatorio">PDF gerado (simulado)</h2>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <h3 class="h5" data-pdf-titulo></h3>
                            <p class="text-muted small" data-pdf-filtros></p>
                            <div data-pdf-tabela></div>
                            <p class="fw-semibold mt-3 mb-0" data-pdf-total></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>`;

        const elemento = host.querySelector(".modal");
        elemento.querySelector("[data-pdf-titulo]").textContent = titulo;
        elemento.querySelector("[data-pdf-filtros]").textContent = `Filtros: ${filtros} - Emitido em ${agora()}`;
        elemento.querySelector("[data-pdf-tabela]").appendChild(tabela);
        elemento.querySelector("[data-pdf-total]").textContent = total;

        const modal = new bootstrap.Modal(elemento);
        elemento.addEventListener("hidden.bs.modal", () => { modal.dispose(); host.innerHTML = ""; });
        modal.show();
    }

    function iniciar(secao) {
        const tabela = document.querySelector(`.operacoesEntidade[data-entity="${secao.dataset.relatorioEntidade}"] table`);
        if (!tabela) return;

        const corpo = tabela.tBodies[0];
        const cabecalhos = Array.from(tabela.tHead.rows[0].cells).map((th) => th.textContent.trim());
        const controles = Array.from(secao.querySelectorAll("[data-filtro]"));
        const formulario = secao.querySelector("[data-relatorio-form]");
        const botaoPdf = secao.querySelector("[data-relatorio-pdf]");
        const aviso = secao.querySelector("[data-relatorio-aviso]");
        const resultado = secao.querySelector("[data-relatorio-resultado]");
        const areaTabela = secao.querySelector("[data-relatorio-tabela]");
        const areaTotal = secao.querySelector("[data-relatorio-total]");
        let filtrosGerados = null; 

        const textoCelula = (tr, coluna) => (tr.cells[coluna]?.textContent ?? "").trim();

        function atualizarOpcoes() {
            controles.filter((c) => c.tagName === "SELECT").forEach((select) => {
                const atual = select.value;
                const valores = [...new Set(Array.from(corpo.rows).map((tr) => textoCelula(tr, +select.dataset.coluna)).filter(Boolean))]
                    .sort((a, b) => a.localeCompare(b, "pt-BR"));
                select.replaceChildren(new Option(select.dataset.opcaoTodos || "Todos", ""), ...valores.map((v) => new Option(v, v)));
                select.value = valores.includes(atual) ? atual : "";
            });
        }

        const lerFiltros = () => controles.map((c) => ({
            tipo: c.dataset.filtro,
            coluna: +c.dataset.coluna,
            valor: c.value.trim(),
            rotulo: secao.querySelector(`label[for="${c.id}"]`).textContent.trim()
        }));

        const periodoInvalido = (filtros) => filtros.some((de) => de.tipo === "data-de" && de.valor
            && filtros.some((ate) => ate.tipo === "data-ate" && ate.coluna === de.coluna && ate.valor && ate.valor < de.valor));

        function filtrarLinhas(filtros) {
            return Array.from(corpo.rows).filter((tr) => filtros.every(({ tipo, coluna, valor }) => {
                if (!valor) return true;

                const texto = textoCelula(tr, coluna);
                if (tipo === "texto") return normalizar(texto).includes(normalizar(valor));
                if (tipo === "igual") return texto === valor;

                const data = converterData(texto);
                if (!data) return false;

                return tipo === "data-de" ? data >= valor : data <= valor;
            }));
        }

        const descreverFiltros = (filtros) => filtros.filter((f) => f.valor)
            .map((f) => `${f.rotulo}: ${f.tipo.startsWith("data") ? formatarData(f.valor) : f.valor}`).join("; ") || "nenhum";

        function montarTabela(linhas) {
            const wrapper = document.createElement("div");
            wrapper.className = "table-responsive";
            const t = document.createElement("table");
            t.className = "table tabelaEntidade align-middle";

            const cabecalho = t.createTHead().insertRow()

            cabecalhos.forEach((h) => {
                const th = document.createElement("th")
                th.scope = "col";
                th.textContent = h;
                cabecalho.appendChild(th);
            });

            const tbody = t.createTBody();
            if (!linhas.length) {
                const td = tbody.insertRow().insertCell();
                td.colSpan = cabecalhos.length;
                td.textContent = "Sem registros.";
            }

            linhas.forEach((tr) => {
                const nova = tbody.insertRow();
                Array.from(tr.cells).forEach((celula) => {
                    nova.insertCell().append(...Array.from(celula.childNodes, (n) => n.cloneNode(true)));
                });
            });

            wrapper.appendChild(t);
            return wrapper;
        }

        function textoTotal(linhas) {
            let texto = `${linhas.length} ${secao.dataset.rotuloTotal}`;
            const coluna = secao.dataset.distintoColuna

            if (coluna !== undefined) {
                const distintos = new Set(linhas.map((tr) => textoCelula(tr, +coluna)).filter(Boolean));
                texto += `; ${distintos.size} ${secao.dataset.distintoRotulo}`;
            }

            return texto;
        }

        function mostrarAviso(mensagem) {
            aviso.replaceChildren();

            if (!mensagem) return;

            const alerta = document.createElement("div");
            alerta.className = "alert alert-danger alert-dismissible fade show mb-0";
            alerta.setAttribute("role", "alert");
            alerta.textContent = mensagem;

            const fechar = document.createElement("button");
            fechar.type = "button";
            fechar.className = "btn-close";
            fechar.setAttribute("data-bs-dismiss", "alert");
            fechar.setAttribute("aria-label", "Fechar");
            alerta.appendChild(fechar);
            aviso.appendChild(alerta);
        }

        function renderizar() {
            const linhas = filtrarLinhas(filtrosGerados);
            areaTabela.replaceChildren(montarTabela(linhas));
            areaTotal.textContent = textoTotal(linhas);
            resultado.classList.remove("d-none");
            botaoPdf.classList.remove("d-none");
        }

        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const filtros = lerFiltros()
        
            if (periodoInvalido(filtros)) {
                mostrarAviso("Data final anterior à inicial, corrija o período.")
                return;
            }
            mostrarAviso(null);
            filtrosGerados = filtros;
            renderizar()
        });

        botaoPdf.addEventListener("click", () => {
            if (!filtrosGerados) return;
            const linhas = filtrarLinhas(filtrosGerados);
            abrirPdf(secao.dataset.relatorioTitulo, descreverFiltros(filtrosGerados), montarTabela(linhas), textoTotal(linhas));
        });

        atualizarOpcoes();
    }

    document.querySelectorAll("[data-relatorio-entidade]").forEach(iniciar);
})();
