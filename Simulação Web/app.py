import csv
import json
import os
import threading
import time
from datetime import datetime

from flask import Flask, jsonify, render_template, request, send_file


app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))

LOG = os.path.join(
    BASE,
    "dados",
    "log_decisoes.csv"
)

os.makedirs(
    os.path.dirname(LOG),
    exist_ok=True
)

lock = threading.Lock()

participantes = {}

MAU = {
    "perdeu_evidencia",
    "apagou_evidencia",
    "ignorou",
    "tempo_esgotado"
}


def cenario():

    with open(
        os.path.join(
            BASE,
            "cenario.json"
        ),
        encoding="utf-8"
    ) as f:

        return json.load(f)


def log(p, r):

    novo = not os.path.exists(LOG)

    with open(
        LOG,
        "a",
        newline="",
        encoding="utf-8-sig"
    ) as f:

        w = csv.writer(
            f,
            delimiter=";"
        )

        if novo:

            w.writerow([
                "data_hora",
                "participante",
                "fase",
                "acao",
                "pontos_acao",
                "bonus_tempo",
                "tempo_s",
                "total"
            ])

        w.writerow([
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            p["nome"],
            r["fase"],
            r["acao"],
            r["pontos"],
            r["bonus"],
            r["tempo_s"],
            p["pontos"]
        ])


def registrar(
    p,
    fase,
    acao,
    efeito,
    bonus,
    tempo
):

    p["pontos"] += (
        efeito.get("pontos", 0)
        +
        bonus
    )

    novas_flags = []

    for flag in efeito.get(
        "flags",
        []
    ):

        if flag not in p["flags"]:

            p["flags"].append(flag)

            novas_flags.append(flag)

    registro = {

        "fase": fase,

        "acao": acao,

        "pontos":
            efeito.get(
                "pontos",
                0
            ),

        "bonus": bonus,

        "tempo_s":
            round(
                tempo,
                1
            ),

        "feedback":
            efeito.get(
                "feedback",
                ""
            )
    }

    p["historico"].append(
        registro
    )

    log(
        p,
        registro
    )

    return novas_flags


def objetivos_status(
    p,
    c
):

    itens = []

    for objetivo in c.get(
        "objetivos",
        []
    ):

        flag = objetivo["flag"]

        itens.append({

            "id":
                objetivo.get(
                    "id",
                    flag
                ),

            "nome":
                objetivo.get(
                    "nome",
                    flag
                ),

            "flag":
                flag,

            "concluido":
                flag in p["flags"]
        })

    return {

        "total":
            len(itens),

        "concluidos":
            sum(
                1
                for item in itens
                if item["concluido"]
            ),

        "itens":
            itens
    }


def objetivos_completos(
    p,
    c
):

    obj = objetivos_status(
        p,
        c
    )

    return (
        obj["total"] > 0
        and
        obj["concluidos"]
        ==
        obj["total"]
    )


def calcular_final(
    p,
    c
):

    for final in c["finais"]:

        cond = final.get(
            "condicao",
            {}
        )

        if (

            all(
                flag in p["flags"]
                for flag
                in cond.get(
                    "requer",
                    []
                )
            )

            and

            not any(
                flag in p["flags"]
                for flag
                in cond.get(
                    "proibe",
                    []
                )
            )

            and

            p["pontos"]
            >=
            cond.get(
                "min_pontos",
                -9999
            )
        ):

            return {

                "titulo":
                    final["titulo"],

                "texto":
                    final["texto"],

                "tipo":
                    final.get(
                        "tipo",
                        ""
                    )
            }

    return c["finais"][-1]


def finalizar(
    p,
    c
):

    p["finalizado"] = True

    p["final"] = calcular_final(
        p,
        c
    )


def verificar_tempo(
    p,
    c
):

    if (
        p["finalizado"]
        or
        p["inicio_total"]
        is None
    ):

        return

    agora = time.time()

    if (
        agora
        -
        p["inicio_total"]
        >
        c["tempo_total"]
    ):

        registrar(
            p,
            p["fase"],
            "Tempo total esgotado",
            {
                "pontos": -5,

                "flags": [
                    "tempo_esgotado"
                ],

                "feedback":
                    "O tempo acabou antes da conclusão do incidente."
            },
            0,
            agora
            -
            p["inicio_total"]
        )

        finalizar(
            p,
            c
        )

        return

    fase = c["fases"][
        p["fase"]
    ]

    demora = fase.get(
        "se_demorar"
    )

    if (

        demora

        and

        agora
        -
        p["inicio_fase"]
        >
        fase["limite"]
    ):

        registrar(
            p,
            p["fase"],
            "Sem ação a tempo",
            demora,
            0,
            agora
            -
            p["inicio_fase"]
        )

        if (
            demora["proxima"]
            ==
            "FIM"
        ):

            finalizar(
                p,
                c
            )

        else:

            p["fase"] = (
                demora["proxima"]
            )

            p["inicio_fase"] = (
                agora
            )


def risco(
    p,
    c
):

    t = (

        time.time()
        -
        p["inicio_total"]

    ) / c["tempo_total"] * 50

    valor = (

        10

        +

        t
        *
        (
            0.4
            if
            "isolou"
            in p["flags"]
            else
            1
        )
    )

    valor += (

        15

        *

        len(
            MAU
            &
            set(
                p["flags"]
            )
        )
    )

    return min(
        100,
        int(valor)
    )


@app.get("/")
def pagina_participante():

    return render_template(
        "participante.html"
    )


@app.get("/facilitador")
def pagina_facilitador():

    return render_template(
        "facilitador.html"
    )


@app.post("/api/entrar")
def api_entrar():

    nome = (

        request.get_json()
        or
        {}

    ).get(
        "nome",
        ""
    ).strip()[:40]

    if not nome:

        return jsonify({
            "erro":
                "nome vazio"
        }), 400

    with lock:

        if nome not in participantes:

            participantes[nome] = {

                "nome":
                    nome,

                "fase":
                    cenario()["inicio"],

                "pontos":
                    0,

                "flags":
                    [],

                "usadas":
                    [],

                "historico":
                    [],

                "inicio_total":
                    None,

                "inicio_fase":
                    None,

                "finalizado":
                    False,

                "final":
                    None
            }

    return jsonify({
        "pid":
            nome
    })


@app.post("/api/iniciar")
def api_iniciar():

    with lock:

        p = participantes.get(

            (
                request.get_json()
                or
                {}
            ).get(
                "pid"
            )
        )

        if not p:

            return jsonify({
                "erro":
                    "desconhecido"
            }), 404

        if (
            p["inicio_total"]
            is None
        ):

            agora = time.time()

            p["inicio_total"] = (
                agora
            )

            p["inicio_fase"] = (
                agora
            )

    return jsonify({
        "ok":
            True
    })


@app.get("/api/estado/<pid>")
def api_estado(pid):

    with lock:

        p = participantes.get(
            pid
        )

        if not p:

            return jsonify({
                "status":
                    "desconhecido"
            }), 404

        if (
            p["inicio_total"]
            is None
        ):

            return jsonify({
                "status":
                    "nao_iniciado"
            })

        c = cenario()

        verificar_tempo(
            p,
            c
        )

        obj = objetivos_status(
            p,
            c
        )

        if p["finalizado"]:

            return jsonify({

                "status":
                    "finalizado",

                "pontos":
                    p["pontos"],

                "final":
                    p["final"],

                "historico":
                    p["historico"],

                "objetivos":
                    obj
            })

        fase = c["fases"][
            p["fase"]
        ]

        return jsonify({

            "status":
                "jogando",

            "pontos":
                p["pontos"],

            "fase":
                p["fase"],

            "evento":
                fase["evento"],

            "efeito_fase":
                fase.get(
                    "efeito",
                    ""
                ),

            "flags":
                p["flags"],

            "usadas":
                p["usadas"],

            "risco":
                risco(
                    p,
                    c
                ),

            "objetivos":
                obj,

            "restante_total":
                max(
                    0,
                    int(
                        c["tempo_total"]
                        -
                        (
                            time.time()
                            -
                            p["inicio_total"]
                        )
                    )
                ),

            "acoes": [

                {
                    "id":
                        aid,

                    "nome":
                        acao["nome"],

                    "icone":
                        acao["icone"],

                    "descricao":
                        acao["descricao"]
                }

                for aid, acao
                in c["acoes"].items()
            ]
        })


@app.post("/api/executar")
def api_executar():

    dados = (
        request.get_json()
        or
        {}
    )

    with lock:

        p = participantes.get(
            dados.get("pid")
        )

        c = cenario()

        if (
            not p
            or
            p["inicio_total"]
            is None
        ):

            return jsonify({
                "erro":
                    "estado invalido"
            }), 400

        verificar_tempo(
            p,
            c
        )

        if p["finalizado"]:

            return jsonify({
                "erro":
                    "acao invalida"
            }), 400

        acao_id = dados.get(
            "acao"
        )

        acao = c["acoes"].get(
            acao_id
        )

        if (
            not acao
            or
            acao_id in p["usadas"]
        ):

            return jsonify({
                "erro":
                    "acao invalida"
            }), 400

        antes = objetivos_status(
            p,
            c
        )["concluidos"]

        agora = time.time()

        fase_atual = p["fase"]

        fase = c["fases"][
            fase_atual
        ]

        efeito = (

            acao.get(
                "fases",
                {}
            ).get(
                fase_atual,
                acao["padrao"]
            )
        )

        tempo = (
            agora
            -
            p["inicio_fase"]
        )

        bonus = (

            3

            if

            tempo
            <=
            fase["limite"] * 0.5

            and

            efeito.get(
                "pontos",
                0
            )
            >
            0

            else

            0
        )

        novas_flags = registrar(

            p,

            fase_atual,

            acao["nome"],

            efeito,

            bonus,

            tempo
        )

        p["usadas"].append(
            acao_id
        )

        proxima = efeito.get(
            "proxima",
            fase_atual
        )

        if (
            proxima
            ==
            "FIM"
        ):

            finalizar(
                p,
                c
            )

        elif (
            proxima
            !=
            fase_atual
        ):

            p["fase"] = (
                proxima
            )

            p["inicio_fase"] = (
                agora
            )

        depois = objetivos_status(
            p,
            c
        )

        objetivo_novo = (

            depois["concluidos"]
            >
            antes
        )

        # Ao completar os 3 objetivos,
        # encerra o exercício,
        # independentemente da ordem.
        if (

            not p["finalizado"]

            and

            objetivos_completos(
                p,
                c
            )
        ):

            finalizar(
                p,
                c
            )

        return jsonify({

            "ok":
                True,

            "consequencia":
                efeito.get(
                    "consequencia",
                    ""
                ),

            "efeito":
                efeito.get(
                    "efeito",
                    ""
                ),

            "pontos_acao":
                efeito.get(
                    "pontos",
                    0
                ),

            "bonus":
                bonus,

            "novas_flags":
                novas_flags,

            "objetivo_novo":
                objetivo_novo,

            "objetivos":
                depois,

            "finalizado":
                p["finalizado"]
        })


@app.get("/api/painel")
def api_painel():

    with lock:

        c = cenario()

        return jsonify({

            "participantes": [

                {
                    "nome":
                        p["nome"],

                    "fase":
                        (
                            p["fase"]
                            if
                            p["inicio_total"]
                            else
                            "não iniciou"
                        ),

                    "acoes":
                        len(
                            p["usadas"]
                        ),

                    "pontos":
                        p["pontos"],

                    "flags":
                        p["flags"],

                    "objetivos":
                        objetivos_status(
                            p,
                            c
                        ),

                    "finalizado":
                        p["finalizado"],

                    "final":
                        (
                            p["final"]["titulo"]
                            if
                            p["final"]
                            else
                            ""
                        )
                }

                for p
                in participantes.values()
            ]
        })


@app.post("/api/encerrar")
def api_encerrar():

    with lock:

        c = cenario()

        for p in participantes.values():

            if (
                p["inicio_total"]
                and
                not p["finalizado"]
            ):

                finalizar(
                    p,
                    c
                )

    return jsonify({
        "ok":
            True
    })


@app.post("/api/resetar")
def api_resetar():

    with lock:

        participantes.clear()

    return jsonify({
        "ok":
            True
    })


@app.get("/api/csv")
def api_csv():

    if not os.path.exists(
        LOG
    ):

        return (
            "Sem dados ainda.",
            404
        )

    return send_file(
        LOG,
        as_attachment=True
    )



from fase2 import instalar_fase2

instalar_fase2(app, participantes, lock, log)

@app.get("/api/orientacao/fase1")
def orientacao_fase1():
    c = cenario()

    return jsonify({
        "acoes": [
            {
                "id": aid,
                "nome": acao["nome"],
                "icone": acao["icone"],
                "descricao": acao["descricao"],
            }
            for aid, acao in c["acoes"].items()
        ]
    })

# ---------------------------------------------------------------
# Configuração de rede (HTTPS + nome local)
# ---------------------------------------------------------------
IP_SERVIDOR = "192.168.0.16"
NOME_HOST = "tabletop-ctic"
PORTA_HTTPS = 443
CERT_FILE = os.path.join(BASE, "certs", "cert.pem")
KEY_FILE = os.path.join(BASE, "certs", "key.pem")


def anunciar_mdns(porta):
    """Anuncia tabletop-ctic.local na rede (mDNS), sem renomear o PC."""
    try:
        import socket
        from zeroconf import Zeroconf, ServiceInfo
    except ImportError:
        print("[aviso] zeroconf nao instalado; nome .local desativado.")
        return None, None

    info = ServiceInfo(
        "_https._tcp.local.",
        f"{NOME_HOST}._https._tcp.local.",
        addresses=[socket.inet_aton(IP_SERVIDOR)],
        port=porta,
        server=f"{NOME_HOST}.local.",
    )
    zc = Zeroconf()
    zc.register_service(info)
    return zc, info


if __name__ == "__main__":

    tem_cert = os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE)

    if tem_cert:
        porta = PORTA_HTTPS
        ssl_ctx = (CERT_FILE, KEY_FILE)
        zc, info = anunciar_mdns(porta)
        print(f"\n  Acesse: https://{NOME_HOST}.local")
        print(f"          https://{NOME_HOST}  (se o hosts/DNS estiver configurado)")
        print(f"          https://{IP_SERVIDOR}\n")
    else:
        porta = 5000
        ssl_ctx = None
        zc, info = None, None
        print("\n[aviso] Certificado nao encontrado em /certs.")
        print("        Rode gerar_certificado.bat para ativar o HTTPS.")
        print(f"        Rodando em HTTP: http://{IP_SERVIDOR}:5000\n")

    try:
        app.run(
            host="0.0.0.0",
            port=porta,
            ssl_context=ssl_ctx,
            debug=False
        )
    finally:
        if zc:
            zc.unregister_service(info)
            zc.close()
