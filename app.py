import csv, json, os, threading, time
from datetime import datetime
from flask import Flask, jsonify, render_template, request, send_file

app = Flask(__name__)
BASE = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(BASE, "dados", "log_decisoes.csv")
os.makedirs(os.path.dirname(LOG), exist_ok=True)
lock = threading.Lock()
participantes = {}
MAU = {"perdeu_evidencia", "apagou_evidencia", "ignorou", "tempo_esgotado"}


def cenario():
    with open(os.path.join(BASE, "cenario.json"), encoding="utf-8") as f:
        return json.load(f)


def log(p, r):
    novo = not os.path.exists(LOG)
    with open(LOG, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        if novo:
            w.writerow(["data_hora", "participante", "fase", "acao",
                        "pontos_acao", "bonus_tempo", "tempo_s", "total"])
        w.writerow([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), p["nome"], r["fase"],
                    r["acao"], r["pontos"], r["bonus"], r["tempo_s"], p["pontos"]])


def registrar(p, fase, acao, e, bonus, tempo):
    p["pontos"] += e["pontos"] + bonus
    for f in e.get("flags", []):
        if f not in p["flags"]:
            p["flags"].append(f)
    r = {"fase": fase, "acao": acao, "pontos": e["pontos"], "bonus": bonus,
         "tempo_s": round(tempo, 1), "feedback": e.get("feedback", "")}
    p["historico"].append(r)
    log(p, r)


def calcular_final(p, c):
    for f in c["finais"]:
        k = f.get("condicao", {})
        if (all(x in p["flags"] for x in k.get("requer", []))
                and not any(x in p["flags"] for x in k.get("proibe", []))
                and p["pontos"] >= k.get("min_pontos", -9999)):
            return {"titulo": f["titulo"], "texto": f["texto"], "tipo": f.get("tipo", "")}
    return c["finais"][-1]


def finalizar(p, c):
    p["finalizado"] = True
    p["final"] = calcular_final(p, c)


def verificar_tempo(p, c):
    """Aplica esgotamento de tempo total e demora na fase atual."""
    if p["finalizado"] or p["inicio_total"] is None:
        return
    agora = time.time()
    if agora - p["inicio_total"] > c["tempo_total"]:
        registrar(p, p["fase"], "Tempo total esgotado",
                  {"pontos": -5, "flags": ["tempo_esgotado"],
                   "feedback": "O tempo acabou antes da conclusão do incidente."},
                  0, agora - p["inicio_total"])
        finalizar(p, c)
        return
    fase = c["fases"][p["fase"]]
    sd = fase.get("se_demorar")
    if sd and agora - p["inicio_fase"] > fase["limite"]:
        registrar(p, p["fase"], "Sem ação a tempo", sd, 0, agora - p["inicio_fase"])
        if sd["proxima"] == "FIM":
            finalizar(p, c)
        else:
            p["fase"] = sd["proxima"]
            p["inicio_fase"] = agora


def risco(p, c):
    t = (time.time() - p["inicio_total"]) / c["tempo_total"] * 50
    r = 10 + t * (0.4 if "isolou" in p["flags"] else 1) + 15 * len(MAU & set(p["flags"]))
    return min(100, int(r))


@app.get("/")
def pagina_participante():
    return render_template("participante.html")


@app.get("/facilitador")
def pagina_facilitador():
    return render_template("facilitador.html")


@app.post("/api/entrar")
def api_entrar():
    nome = (request.get_json() or {}).get("nome", "").strip()[:40]
    if not nome:
        return jsonify({"erro": "nome vazio"}), 400
    with lock:
        if nome not in participantes:
            participantes[nome] = {
                "nome": nome, "fase": cenario()["inicio"], "pontos": 0, "flags": [],
                "usadas": [], "historico": [], "inicio_total": None,
                "inicio_fase": None, "finalizado": False, "final": None}
    return jsonify({"pid": nome})


@app.post("/api/iniciar")
def api_iniciar():
    with lock:
        p = participantes.get((request.get_json() or {}).get("pid"))
        if not p:
            return jsonify({"erro": "desconhecido"}), 404
        if p["inicio_total"] is None:
            p["inicio_total"] = p["inicio_fase"] = time.time()
    return jsonify({"ok": True})


@app.get("/api/estado/<pid>")
def api_estado(pid):
    with lock:
        p = participantes.get(pid)
        if not p:
            return jsonify({"status": "desconhecido"}), 404
        if p["inicio_total"] is None:
            return jsonify({"status": "nao_iniciado"})
        c = cenario()
        verificar_tempo(p, c)
        if p["finalizado"]:
            return jsonify({"status": "finalizado", "pontos": p["pontos"],
                            "final": p["final"], "historico": p["historico"]})
        fase = c["fases"][p["fase"]]
        return jsonify({
            "status": "jogando", "pontos": p["pontos"], "fase": p["fase"],
            "evento": fase["evento"], "efeito_fase": fase.get("efeito", ""),
            "flags": p["flags"], "usadas": p["usadas"], "risco": risco(p, c),
            "restante_total": max(0, int(c["tempo_total"] - (time.time() - p["inicio_total"]))),
            "acoes": [{"id": k, "nome": a["nome"], "icone": a["icone"],
                       "descricao": a["descricao"]} for k, a in c["acoes"].items()]})


@app.post("/api/executar")
def api_executar():
    d = request.get_json() or {}
    with lock:
        p = participantes.get(d.get("pid"))
        c = cenario()
        if not p or p["inicio_total"] is None:
            return jsonify({"erro": "estado invalido"}), 400
        verificar_tempo(p, c)
        a = c["acoes"].get(d.get("acao"))
        if p["finalizado"] or not a or d["acao"] in p["usadas"]:
            return jsonify({"erro": "acao invalida"}), 400
        agora = time.time()
        fase = c["fases"][p["fase"]]
        e = a["fases"].get(p["fase"], a["padrao"])
        tempo = agora - p["inicio_fase"]
        bonus = 3 if (tempo <= fase["limite"] * 0.5 and e["pontos"] > 0) else 0
        registrar(p, p["fase"], a["nome"], e, bonus, tempo)
        p["usadas"].append(d["acao"])
        prox = e.get("proxima", p["fase"])
        if prox == "FIM":
            finalizar(p, c)
        elif prox != p["fase"]:
            p["fase"] = prox
            p["inicio_fase"] = agora
        return jsonify({"ok": True, "consequencia": e.get("consequencia", ""),
                        "efeito": e.get("efeito", "")})


@app.get("/api/painel")
def api_painel():
    with lock:
        return jsonify({"participantes": [
            {"nome": p["nome"], "fase": p["fase"] if p["inicio_total"] else "não iniciou",
             "acoes": len(p["usadas"]), "pontos": p["pontos"], "flags": p["flags"],
             "finalizado": p["finalizado"], "final": p["final"]["titulo"] if p["final"] else ""}
            for p in participantes.values()]})


@app.post("/api/encerrar")
def api_encerrar():
    with lock:
        c = cenario()
        for p in participantes.values():
            if p["inicio_total"] and not p["finalizado"]:
                finalizar(p, c)
    return jsonify({"ok": True})


@app.post("/api/resetar")
def api_resetar():
    with lock:
        participantes.clear()
    return jsonify({"ok": True})


@app.get("/api/csv")
def api_csv():
    if not os.path.exists(LOG):
        return "Sem dados ainda.", 404
    return send_file(LOG, as_attachment=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)