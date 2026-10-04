# ser_new_server_hub

## Deploy (Hostinger)

A produção roda na VPS, em https://hub.serveralosao.cloud, atrás do Traefik do repo `vps_infra`.

O deploy sai da branch `hostinger`. O dia a dia continua na `main`; para publicar, abra um PR
de `main` para `hostinger`. O merge dispara o workflow `.github/workflows/deploy-hostinger.yml`,
que faz o build das imagens (`backend/Dockerfile.prod` e `frontend/Dockerfile.prod`), envia para
o GHCR e atualiza os containers na VPS com o `docker-compose.prod.yml`.

O `docker-compose.yml` e os `Dockerfile` sem sufixo continuam sendo os de desenvolvimento.
