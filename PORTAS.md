# 🚨 PORTAS - Server Hub v2.0

**Última atualização:** 2025-11-13

---

## RESUMO

| Serviço | Porta Host | Porta Container | Exposta? | URL |
|---------|------------|-----------------|----------|-----|
| **Frontend** | **30001** | 5173 | ✅ SIM | http://192.168.15.15:30001 |
| **Backend** | ❌ Nenhuma | 3000 | ❌ NÃO | http://backend:3000/api (interno) |
| **MongoDB** | 27017 | 27017 | ✅ SIM | mongodb://192.168.15.15:27017 |

---

## ACESSO RÁPIDO

**Interface Web:** http://192.168.15.15:30001

---

## DOCKER-COMPOSE.YML

```yaml
# Frontend - EXPOSTO na 30001
frontend:
  ports:
    - "30001:5173"

# Backend - NÃO EXPOSTO (só interno)
backend:
  # sem "ports:"
```

---

## COMUNICAÇÃO

```
Navegador → 30001 → Frontend Container → http://backend:3000/api → Backend Container → MongoDB
```

---

## HISTÓRICO

| Data | Mudança |
|------|---------|
| 2025-11-13 | Frontend movido para 30001, Backend interno |
