# **Guia de Instalação - Jogos Logísticos (IFBA Juazeiro) FRONT-END**

Este guia explica como configurar e executar o projeto **Jogos Logísticos** em diferentes ambientes (Windows/WSL2, Linux e macOS).

Recomendação: Se você usa Windowns instale o [WSL2 (ubuntu)](https://learn.microsoft.com/pt-br/windows/wsl/install)  para rodar o projeto .

---

## 📋 **Pré-requisitos**
- **Docker** instalado ([Download Docker](https://www.docker.com/get-started))
- **Git** (para clonar o repositório)
- **Porta 5173 liberada** (ou ajuste no `docker-compose.yml`)

---

## 🚀 **Passo a Passo para Executar o Projeto**

### **✔️ Windows (com WSL2 recomendado)✔️**
**1. Instale WSL2 (tutorial](https://learn.microsoft.com/pt-br/windows/wsl/install).**

**2. Comando para instalar o WL2 no PowerShell (rode como admin):**
  ```bash
   wsl --install
  ```
**3. Ja vai instalar o WSL2 mas confira usando o comando (resquisito ser WSL2): **
 ```bash
  wsl --set-version 
 ```
**4. Dentro do terminal do WSL2 navegue até  o diretorio que voce deseja clonar o repositorio.**

**5. Clone o repositorio.**
```bash
git clone https://github.com/restic36/ifba-jogos-juazeiro-front.git
cd ifba-jogos-juazeiro-front
```
**6. Agora a magica acontece:**
```bash
docker-compose up
```
**7.Acesse o Projeto**
Após iniciar, acesse:
👉 [http://localhost:5173](http://localhost:5173)

**8.Abra o VS code:**
```bash
code
```

---

### **No caso do Windows com Docker**
1. Clone o Repositório**
```bash
git clone https://github.com/restic36/ifba-jogos-juazeiro-front.git
cd ifba-jogos-juazeiro-front
```

2. Execute com Docker**
```bash
docker-compose up
```
Isso irá:
- Construir a imagem do container
- Instalar dependências (`node_modules`)
- Iniciar o servidor Vite na porta `5173`

---

## 🌐 **Acessando o Projeto**
Após iniciar, acesse:
👉 [http://localhost:5173](http://localhost:5173)

---

## ⚙️ **Configurações por Sistema Operacional**


### **🪟 Windows (com Docker)**
1. Instale [Docker Desktop](https://www.docker.com/products/docker-desktop/) e ative a integração WSL2.
2. No terminal (PowerShell ou WSL):
   ```bash
   docker-compose up
   ```
3. Se a porta estiver ocupada, edite `docker-compose.yml`:
   ```yaml
   ports:
     - "5174:5173"  # Mude para outra porta
   ```

### **🐧 Linux / WSL2 (Ubuntu)**
1. Instale Docker:
   ```bash
   sudo apt update && sudo apt install docker.io docker-compose
   ```
2. Adicione seu usuário ao grupo Docker (evita usar `sudo`):
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker  # Recarrega as permissões
   ```
3. Execute normalmente:
   ```bash
   docker-compose up
   ```

### **🍎 macOS**
1. Instale [Docker Desktop para Mac](https://docs.docker.com/desktop/install/mac-install/).
2. Siga os mesmos passos do Linux.

---

## 🛠 **Comandos Úteis**

| Comando | Descrição |
|---------|-----------|
| `docker-compose up` | Inicia o servidor |
| `docker-compose up -d` | Roda em segundo plano |
| `docker-compose down` | Para e remove containers |
| `docker-compose logs -f` | Mostra logs em tempo real |
| `docker-compose exec frontend sh` | Acessa o terminal do container |

---

## 🔍 **Solução de Problemas Comuns**

### **❌ Porta 5173 ocupada**
```bash
# Encontre e mate o processo (Linux/WSL/macOS)
sudo lsof -i :5173
kill -9 <PID>

# Ou mude a porta no docker-compose.yml
```

### **❌ Erros de permissão (Linux/WSL)**
```bash
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
```

### **❌ Docker não responde (Windows)**
- Reinicie o Docker Desktop
- Ou no PowerShell:
  ```powershell
  net stop com.docker.service
  net start com.docker.service
  ```

---

## 📜 **Estrutura do Projeto**
```
ifba-jogos-juazeiro-front/
├── docker-compose.yml  # Configuração do Docker
├── Dockerfile          # Imagem do container
├── init.sh             # Script de inicialização
└── app/                # Código fonte (React + Vite + Tailwind)
```

---

## ✅ **Pronto!**
Agora o **Jogos Logísticos** deve estar rodando no seu ambiente. Se precisar de ajuda, consulte os logs com `docker-compose logs -f`.  

🔗 **Repositório Oficial:** [github.com/restic36/ifba-jogos-juazeiro-front](https://github.com/restic36/ifba-jogos-juazeiro-front)
