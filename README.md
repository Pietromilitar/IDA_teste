# IDE_teste (CodePad)

Projeto inicial de uma IDE web leve, focada em uso no navegador (inclusive celular), com suporte a edição de múltiplos arquivos, preview e execução local de JavaScript/TypeScript.

## O que já existe
- Editor com abas e árvore de arquivos.
- Execução de JavaScript no navegador.
- Compilação/transpilação de TypeScript via CDN.
- Preview para HTML e Markdown.
- PWA com Service Worker.
- Estrutura separada em arquivos (`index.html`, `style.css`, `app.js`).

## Melhorias recentes
- **Persistência automática de workspace** via `localStorage`.
  - Restaura arquivos, aba ativa, abas abertas e configurações ao recarregar a página.
- **Validação ao criar arquivo** para evitar nomes duplicados e caminhos inválidos.
- **Salvamento reativo de configurações** (tema, fonte, quebra de linha etc.) no workspace persistido.
- **Explorer mais estiloso** com filtro rápido e badges por extensão.
- **Preview HTML em tela cheia no próprio app** (sem abrir nova aba).

## Como testar localmente
Como é um app estático, basta servir a pasta com qualquer servidor HTTP:

```bash
python -m http.server 8080
```

Depois, abra:

- http://localhost:8080/index.html

## Próximos passos sugeridos
- Exportar/importar projeto em `.json`.
- Melhorar busca com suporte a regex opcional.
- Adicionar linting básico para JS/TS no browser.
