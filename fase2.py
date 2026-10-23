# BLOCO 1
# ARQUIVO: fase2.py
# SUBSTITUA TODO O CONTEÚDO.

import copy
import json
import random
import secrets
import time
from pathlib import Path

from flask import Blueprint, jsonify, render_template, request


# Configurações de dificuldade e pontuação.
PERGUNTAS = 12
BASE = 1000
CUSTO = 25
ACERTO = 500

QUENTE_CORRETO = 15
QUENTE_INOCENTE = -10
FRIO_CORRETO = 5
MORNO_JUSTIFICADO = 5

SUSPEITOS = [
    {
        "id": "s1",
        "apelido": "O Porteiro",
        "hostname": "SRV-WEB-01",
        "ip": "203.0.113.11",
        "funcao": "Nó web do cluster",
    },
    {
        "id": "s2",
        "apelido": "O Contador",
        "hostname": "SRV-WEB-02",
        "ip": "203.0.113.12",
        "funcao": "Nó web do cluster",
    },
    {
        "id": "s3",
        "apelido": "O Arquivista",
        "hostname": "SRV-WEB-03",
        "ip": "203.0.113.13",
        "funcao": "Nó web do cluster",
    },
]


def instalar_fase2(app, participantes, lock, gravar_log):
    bp = Blueprint("fase2", __name__)

    # Mantido separadamente para sobreviver ao reinício individual.
    # Continua em memória, como o restante da aplicação.
    vistos = {}

    rng = random.SystemRandom()

    catalogo = json.loads(
        Path(__file__)
        .with_name("interrogatorio.json")
        .read_text(encoding="utf-8")
    )

    por_id = {q["id"]: q for q in catalogo}

    def animacoes(pid):
        return vistos.setdefault(
            pid,
            {"fase1": False, "fase2": False},
        )

    def novo():
        infectado = rng.choice(SUSPEITOS)["id"]
        fichas = {}

        # Quatro pistas distribuídas: duas para cada inocente.
        pistas = rng.sample(
            [q["id"] for q in catalogo if q["pista_falsa"]],
            4,
        )

        inocente = 0

        for s in SUSPEITOS:
            if s["id"] == infectado:
                selecionadas = set()
            else:
                selecionadas = set(
                    pistas[inocente * 2:inocente * 2 + 2]
                )
                inocente += 1

            fichas[s["id"]] = {}

            for q in catalogo:
                if s["id"] == infectado:
                    perfil = "infectado"
                elif q["id"] in selecionadas:
                    perfil = "pista"
                else:
                    perfil = "normal"

                dado = copy.deepcopy(q[perfil])

                # Pequena variação somente nas métricas numéricas
                # dos perfis saudáveis sem pista falsa.
                if (
                    perfil == "normal"
                    and isinstance(dado["valor"], (int, float))
                ):
                    dado["valor"] = round(
                        dado["valor"] * rng.uniform(.9, 1.1)
                    )

                dado["valor"] = str(dado["valor"])

                if perfil == "infectado" and q["anomalia"]:
                    dado["tipo"] = "anomalia"
                elif perfil == "pista":
                    dado["tipo"] = "justificada"
                else:
                    dado["tipo"] = "normal"

                fichas[s["id"]][q["id"]] = dado

        return {
            "tentativa": secrets.token_hex(8),
            "infectado": infectado,
            "fichas": fichas,
            "feitas": [],
            "marcas": {},
            "notas": {},
            "intro": False,
            "finalizado": False,
            "acusado": None,
            "inicio": time.time(),
            "resultado": None,
        }

    def pontuacao(f):
        base = max(
            0,
            BASE - CUSTO * len(f["feitas"]),
        )

        # Durante a investigação, mostrar somente o saldo.
        # Os bônus não podem revelar a classificação das evidências.
        if not f["finalizado"]:
            return {
                "pontos": base,
                "base": base,
                "bonus_acerto": 0,
                "bonus_marcas": 0,
            }

        bonus = 0

        for sid, qid in f["feitas"]:
            marca = f["marcas"].get(
                sid + ":" + qid,
                "",
            )

            tipo = f["fichas"][sid][qid]["tipo"]

            if marca == "quente" and tipo == "anomalia":
                bonus += QUENTE_CORRETO

            elif (
                marca == "quente"
                and sid != f["infectado"]
                and tipo == "normal"
            ):
                bonus += QUENTE_INOCENTE

            elif marca == "frio" and tipo == "normal":
                bonus += FRIO_CORRETO

            elif marca == "morno" and tipo == "justificada":
                bonus += MORNO_JUSTIFICADO

        premio = (
            ACERTO
            if f["acusado"] == f["infectado"]
            else 0
        )

        return {
            "pontos": max(0, base + premio + bonus),
            "base": base,
            "bonus_acerto": premio,
            "bonus_marcas": bonus,
        }

    def publico(p):
        f = p["fase2"]
        respostas = {}

        for sid, qid in f["feitas"]:
            respostas.setdefault(sid, {})[qid] = {
                k: v
                for k, v in f["fichas"][sid][qid].items()
                if k != "tipo"
            }

        d = {
            "tentativa": f["tentativa"],
            "intro": f["intro"],
            "pode_pular": animacoes(p["nome"])["fase2"],
            "perguntas_usadas": len(f["feitas"]),
            "combinacoes_disponiveis": (
                len(catalogo) * len(SUSPEITOS)
            ),
            "custo_pergunta": CUSTO,
            "suspeitos": SUSPEITOS,
            "perguntas": [
                {
                    k: q[k]
                    for k in (
                        "id",
                        "pergunta",
                        "exame",
                        "referencia",
                    )
                }
                for q in catalogo
            ],
            "respostas": respostas,
            "marcas": f["marcas"],
            "notas": f["notas"],
            "finalizado": f["finalizado"],
            "pontos_fase1": p["pontos"],
            "pontos": pontuacao(f)["pontos"],
        }

        if f["finalizado"]:
            d.update(
                resultado=f["resultado"],
                gabarito=f["fichas"],
                acusado=f["acusado"],
            )

            d["infectado"] = next(
                s
                for s in SUSPEITOS
                if s["id"] == f["infectado"]
            )

        return d

    @bp.get("/api/fase2/painel")
    def painel_fase2():
        with lock:
            itens = []

            for p in participantes.values():
                f = p.get("fase2")

                if not f:
                    status = "Não iniciou"
                elif f["finalizado"]:
                    status = "Finalizado"
                elif f["intro"]:
                    status = "Investigando"
                else:
                    status = "Abertura"

                resultado = "—"

                if f and f["finalizado"]:
                    resultado = (
                        "Acertou a acusação"
                        if f["resultado"]["vitoria"]
                        else "Errou a acusação"
                    )

                itens.append({
                    "nome": p["nome"],
                    "iniciou": f is not None,
                    "status": status,
                    "perguntas": (
                        len(f["feitas"])
                        if f
                        else 0
                    ),
                    "pontos": (
                        pontuacao(f)["pontos"]
                        if f
                        else None
                    ),
                    "marcacoes": (
                        sum(
                            bool(m)
                            for m in f["marcas"].values()
                        )
                        if f
                        else 0
                    ),
                    "resultado": resultado,
                })

            return jsonify(participantes=itens)

    @bp.after_app_request
    def registrar_intro1(resposta):
        if resposta.status_code < 300:
            if (
                request.path == "/api/iniciar"
                and request.method == "POST"
            ):
                dados = request.get_json(silent=True) or {}

                if (
                    isinstance(dados, dict)
                    and isinstance(dados.get("pid"), str)
                ):
                    with lock:
                        p = participantes.get(dados["pid"])

                        if (
                            p
                            and p["inicio_total"] is not None
                        ):
                            animacoes(dados["pid"])["fase1"] = True

            elif (
                request.path == "/api/resetar"
                and request.method == "POST"
            ):
                with lock:
                    vistos.clear()

        if request.path.startswith("/api/"):
            resposta.headers["Cache-Control"] = "no-store"

        return resposta

    @bp.post("/api/animacoes")
    def estado_animacoes():
        dados = request.get_json(silent=True)

        if (
            not isinstance(dados, dict)
            or not isinstance(dados.get("pid"), str)
        ):
            return jsonify(
                erro="Participante inválido."
            ), 400

        with lock:
            if dados["pid"] not in participantes:
                return jsonify(
                    erro="Participante não encontrado."
                ), 404

            return jsonify(animacoes(dados["pid"]))

    @bp.get("/fase2")
    def pagina():
        return render_template("fase2.html")

    @bp.post("/api/participante/reiniciar")
    def reiniciar_fase1():
        dados = request.get_json(silent=True)

        if (
            not isinstance(dados, dict)
            or not isinstance(dados.get("pid"), str)
        ):
            return jsonify(
                erro="Participante inválido."
            ), 400

        with lock:
            p = participantes.get(dados["pid"])

            if not p:
                return jsonify(
                    erro="Participante não encontrado."
                ), 404

            if not p["finalizado"]:
                return jsonify(
                    erro="Finalize a Fase 1 antes de reiniciar."
                ), 409

            # O histórico de animações permanece em "vistos".
            del participantes[dados["pid"]]

        return jsonify(ok=True)

    @bp.post("/api/fase2")
    def api():
        dados = request.get_json(silent=True)

        if (
            not isinstance(dados, dict)
            or not isinstance(dados.get("pid"), str)
        ):
            return jsonify(
                erro="Dados inválidos."
            ), 400

        pid = dados["pid"]
        acao = dados.get("acao", "estado")

        permitidas = {
            "estado",
            "intro",
            "reiniciar",
            "perguntar",
            "marcar",
            "anotar",
            "acusar",
        }

        if (
            not isinstance(acao, str)
            or acao not in permitidas
        ):
            return jsonify(
                erro="Ação inválida."
            ), 400

        with lock:
            p = participantes.get(pid)

            if not p:
                return jsonify(
                    erro=(
                        "Participante não encontrado. "
                        "Volte à Fase 1."
                    )
                ), 404

            if not p["finalizado"]:
                return jsonify(
                    erro="Finalize a Fase 1 antes de avançar."
                ), 409

            if "fase2" not in p:
                if acao != "estado":
                    return jsonify(
                        erro="Abra o caso primeiro."
                    ), 409

                p["fase2"] = novo()

            f = p["fase2"]

            if acao == "estado":
                return jsonify(publico(p))

            if dados.get("tentativa") != f["tentativa"]:
                return jsonify(
                    erro="A tentativa mudou. Atualize a página."
                ), 409

            if acao == "reiniciar":
                if not f["finalizado"]:
                    return jsonify(
                        erro=(
                            "Conclua a acusação antes "
                            "de reiniciar."
                        )
                    ), 409

                p["fase2"] = novo()
                return jsonify(publico(p))

            if f["finalizado"]:
                return jsonify(
                    erro="O caso já foi encerrado."
                ), 409

            if acao == "intro":
                f["intro"] = True
                animacoes(pid)["fase2"] = True
                return jsonify(publico(p))

            if not f["intro"]:
                return jsonify(
                    erro="Conclua a abertura primeiro."
                ), 409

            sid = dados.get("suspeito")
            qid = dados.get("pergunta")

            if (
                not isinstance(sid, str)
                or sid not in f["fichas"]
            ):
                return jsonify(
                    erro="Selecione um servidor."
                ), 400

            if acao in {"perguntar", "marcar"}:
                if (
                    not isinstance(qid, str)
                    or qid not in por_id
                ):
                    return jsonify(
                        erro="Pergunta inválida."
                    ), 400

            if acao == "perguntar":
                if [sid, qid] in f["feitas"]:
                    return jsonify(
                        erro=(
                            "Essa pergunta já foi feita "
                            "a este servidor."
                        )
                    ), 409

                f["feitas"].append([sid, qid])

                registro = {
                    "fase": "fase2_interrogatorio",
                    "acao": f"Pergunta: {sid}/{qid}",
                    "pontos": -CUSTO,
                    "bonus": 0,
                    "tempo_s": round(
                        time.time() - f["inicio"],
                        1,
                    ),
                    "feedback": "Evidência consultada.",
                }

                saldo = max(
                    0,
                    BASE - CUSTO * len(f["feitas"]),
                )

                gravar_log(
                    {**p, "pontos": saldo},
                    registro,
                )

            elif acao == "marcar":
                if [sid, qid] not in f["feitas"]:
                    return jsonify(
                        erro=(
                            "Consulte essa evidência "
                            "antes de marcar."
                        )
                    ), 409

                marca = dados.get("marca")

                if marca not in (
                    "",
                    "frio",
                    "morno",
                    "quente",
                ):
                    return jsonify(
                        erro="Marcação inválida."
                    ), 400

                f["marcas"][sid + ":" + qid] = marca

            elif acao == "anotar":
                texto = dados.get("texto")

                if not isinstance(texto, str):
                    return jsonify(
                        erro="Anotação inválida."
                    ), 400

                f["notas"][sid] = texto[:1000]

            elif acao == "acusar":
                f["finalizado"] = True
                f["acusado"] = sid

                pontos = pontuacao(f)

                f["resultado"] = {
                    **pontos,
                    "vitoria": sid == f["infectado"],
                    "perguntas_usadas": len(f["feitas"]),
                }

                gravar_log(
                    {**p, "pontos": pontos["pontos"]},
                    {
                        "fase": "fase2_resultado",
                        "acao": "Acusação: " + sid,
                        "pontos": (
                            pontos["bonus_acerto"]
                            + pontos["bonus_marcas"]
                        ),
                        "bonus": 0,
                        "tempo_s": round(
                            time.time() - f["inicio"],
                            1,
                        ),
                        "feedback": (
                            "Acerto"
                            if f["resultado"]["vitoria"]
                            else "Acusação incorreta"
                        ),
                    },
                )

            return jsonify(publico(p))

    app.register_blueprint(bp)