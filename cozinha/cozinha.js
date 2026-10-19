/* =========================================
   BANCO DE DADOS LOCAL
========================================= */

let pedidos =
    JSON.parse(
        localStorage.getItem("pedidos")
    ) || [];


/* =========================================
   SALVAR
========================================= */

function salvar() {

    localStorage.setItem(
        "pedidos",
        JSON.stringify(pedidos)
    );
}


/* =========================================
   PEDIDOS DE EXEMPLO
========================================= */

if (pedidos.length === 0) {

    pedidos = [

        {
            id: 1,

            numero: "36",

            itens: [
                "2 Hambúrgueres",
                "1 Lasanha",
                "1 Donut",
                "1 Iogurte"
            ],

            status: "novo",

            entrada: Date.now() - 46000,

            inicio: null,

            saida: null
        },


        {
            id: 2,

            numero: "33",

            itens: [
                "1 Pão",
                "1 Bacon",
                "1 Salsicha",
                "1 Pepperoni"
            ],

            status: "preparando",

            entrada: Date.now() - 118000,

            inicio: Date.now() - 118000,

            saida: null
        },


        {
            id: 3,

            numero: "35",

            itens: [
                "2 Só o Básico",
                "1 Donut",
                "1 Muffin",
                "1 Macarrão",
                "1 Arroz"
            ],

            status: "preparando",

            entrada: Date.now() - 64000,

            inicio: Date.now() - 64000,

            saida: null
        },


        {
            id: 4,

            numero: "38",

            itens: [
                "2 Arroz",
                "1 Salsicha"
            ],

            status: "novo",

            entrada: Date.now() - 16000,

            inicio: null,

            saida: null
        }

    ];

    salvar();
}


/* =========================================
   FORMATAR TEMPO
========================================= */

function formatarTempo(segundos) {

    const minutos =
        Math.floor(segundos / 60);

    const segundosRestantes =
        segundos % 60;


    return (
        String(minutos).padStart(2, "0")
        +
        ":"
        +
        String(segundosRestantes).padStart(2, "0")
    );
}


/* =========================================
   TEMPO DO PEDIDO
========================================= */

function calcularTempo(pedido) {

    let tempoFinal;


    if (pedido.status === "novo") {

        tempoFinal = Date.now();

    }

    else if (pedido.status === "preparando") {

        tempoFinal = Date.now();

    }

    else {

        tempoFinal = pedido.saida;
    }


    const inicio =
        pedido.inicio || pedido.entrada;


    return Math.floor(
        (tempoFinal - inicio) / 1000
    );
}


/* =========================================
   CRIAR CARD
========================================= */

function criarCard(pedido) {

    const tempo =
        calcularTempo(pedido);


    const minutos =
        Math.floor(tempo / 60);


    let classe =
        pedido.status;


    if (
        pedido.status !== "pronto"
        &&
        minutos >= 20
    ) {

        classe += " atrasado";
    }


    const card =
        document.createElement("div");


    card.className =
        `pedido ${classe}`;


    /* CABEÇALHO */

    const cabecalho =
        document.createElement("div");


    cabecalho.className =
        "pedido-cabecalho";


    cabecalho.innerHTML = `

        <span class="numero">
            CHK ${pedido.numero}
        </span>

        <span class="tempo">
            ${formatarTempo(tempo)}
        </span>

    `;


    /* ITENS */

    const itens =
        document.createElement("div");


    itens.className =
        "itens";


    pedido.itens.forEach(item => {

        const linha =
            document.createElement("div");


        linha.className =
            "item";


        linha.textContent =
            item;


        itens.appendChild(linha);

    });


    /* RODAPÉ */

    const rodape =
        document.createElement("div");


    rodape.className =
        "pedido-rodape";


    const status =
        document.createElement("span");


    status.className =
        "status";


    const botao =
        document.createElement("button");


    botao.className =
        "btn";


    /* NOVO */

    if (pedido.status === "novo") {

        status.textContent =
            "NOVO PEDIDO";


        botao.textContent =
            "INICIAR";


        botao.classList.add(
            "btn-iniciar"
        );


        botao.onclick =
            function () {

                iniciarPedido(
                    pedido.id
                );

            };

    }


    /* PREPARANDO */

    else if (
        pedido.status === "preparando"
    ) {

        status.textContent =
            "PREPARANDO";


        botao.textContent =
            "PRONTO";


        botao.classList.add(
            "btn-pronto"
        );


        botao.onclick =
            function () {

                finalizarPedido(
                    pedido.id
                );

            };

    }


    /* PRONTO */

    else {

        status.textContent =
            "✓ PRONTO";


        botao.remove();

    }


    rodape.appendChild(status);


    if (
        pedido.status !== "pronto"
    ) {

        rodape.appendChild(botao);

    }


    card.appendChild(cabecalho);

    card.appendChild(itens);

    card.appendChild(rodape);


    return card;
}


/* =========================================
   RENDERIZAR
========================================= */

function renderizar() {

    const novos =
        document.getElementById(
            "pedidosNovos"
        );


    const preparando =
        document.getElementById(
            "pedidosPreparando"
        );


    const prontos =
        document.getElementById(
            "pedidosProntos"
        );


    novos.innerHTML = "";

    preparando.innerHTML = "";

    prontos.innerHTML = "";


    pedidos.forEach(pedido => {

        const card =
            criarCard(pedido);


        if (
            pedido.status === "novo"
        ) {

            novos.appendChild(card);

        }


        else if (
            pedido.status === "preparando"
        ) {

            preparando.appendChild(card);

        }


        else {

            prontos.appendChild(card);

        }

    });


    atualizarResumo();
}


/* =========================================
   INICIAR PEDIDO
========================================= */

function iniciarPedido(id) {

    const pedido =
        pedidos.find(
            p => p.id === id
        );


    if (!pedido) return;


    pedido.status =
        "preparando";


    pedido.inicio =
        Date.now();


    salvar();

    renderizar();
}


/* =========================================
   FINALIZAR PEDIDO
========================================= */

function finalizarPedido(id) {

    const pedido =
        pedidos.find(
            p => p.id === id
        );


    if (!pedido) return;


    pedido.status =
        "pronto";


    pedido.saida =
        Date.now();


    salvar();

    renderizar();
}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo() {

    const total =
        pedidos.length;


    const novos =
        pedidos.filter(
            p => p.status === "novo"
        ).length;


    const preparando =
        pedidos.filter(
            p => p.status === "preparando"
        ).length;


    const prontos =
        pedidos.filter(
            p => p.status === "pronto"
        ).length;


    document.getElementById(
        "totalPedidos"
    ).textContent =
        total;


    document.getElementById(
        "totalPreparando"
    ).textContent =
        preparando;


    document.getElementById(
        "totalProntos"
    ).textContent =
        prontos;


    document.getElementById(
        "contadorNovos"
    ).textContent =
        novos;


    document.getElementById(
        "contadorPreparando"
    ).textContent =
        preparando;


    document.getElementById(
        "contadorProntos"
    ).textContent =
        prontos;


    calcularTempoMedio();
}


/* =========================================
   TEMPO MÉDIO
========================================= */

function calcularTempoMedio() {

    const finalizados =
        pedidos.filter(
            p =>
                p.status === "pronto"
                &&
                p.saida
        );


    if (finalizados.length === 0) {

        document.getElementById(
            "tempoMedio"
        ).textContent =
            "00:00";

        return;
    }


    let soma = 0;


    finalizados.forEach(pedido => {

        soma +=
            (
                pedido.saida
                -
                pedido.inicio
            ) / 1000;

    });


    const media =
        Math.floor(
            soma / finalizados.length
        );


    document.getElementById(
        "tempoMedio"
    ).textContent =
        formatarTempo(media);
}


/* =========================================
   RELÓGIO
========================================= */

function atualizarRelogio() {

    const agora =
        new Date();


    const horas =
        String(
            agora.getHours()
        ).padStart(2, "0");


    const minutos =
        String(
            agora.getMinutes()
        ).padStart(2, "0");


    const segundos =
        String(
            agora.getSeconds()
        ).padStart(2, "0");


    document.getElementById(
        "horaAtual"
    ).textContent =
        `${horas}:${minutos}:${segundos}`;
}


/* =========================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================= */

setInterval(
    function () {

        renderizar();

        atualizarRelogio();

    },
    1000
);


/* =========================================
   INICIAR
========================================= */

renderizar();

atualizarRelogio();