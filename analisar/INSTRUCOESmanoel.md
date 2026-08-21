# Como subir a branch da API de Conversões do Meta

Manoel, este arquivo acompanha o `meta-capi.bundle`. O bundle é um pacote com
15 commits prontos — nada foi enviado ao GitHub ainda, porque o app do Claude
tem apenas permissão de leitura no `pagina-ggsr`.

Você tem **duas opções**. A primeira é mais rápida e não exige git.

---

## Opção A — liberar a permissão (recomendada, ~2 minutos, sem git)

Nesse caminho você não precisa mexer em nada de código. Basta liberar o acesso
e o próprio Claude sobe a branch e abre o pull request.

1. Acesse https://github.com/settings/installations
2. Clique no app do **Claude**
3. Em **Repository access**, confirme que `pagina-ggsr` está na lista
4. Em **Permissions**, confirme que há acesso de **escrita** em:
   - **Contents** (repository contents)
   - **Pull requests**
5. Se aparecer um aviso de permissões atualizadas aguardando aprovação, aceite

Pronto. Avise o Thales e o PR aparece para você revisar.

**Por que só você consegue fazer isso:** o `pagina-ggsr` está numa conta pessoal,
não numa organização. O GitHub só permite que o dono da conta instale e configure
apps — nem colaboradores com acesso total conseguem.

---

## Opção B — subir você mesmo pelo bundle (exige git na sua máquina)

Se preferir não mexer em permissões, você mesmo pode publicar a branch.

Salve o `meta-capi.bundle` em algum lugar fácil de achar, por exemplo a pasta
Downloads. Depois, no terminal:

**Se você ainda não tem o repositório clonado:**

```bash
git clone https://github.com/henriquegsantos149/pagina-ggsr.git
cd pagina-ggsr
```

**Se já tem, apenas entre na pasta dele e atualize:**

```bash
cd caminho/para/pagina-ggsr
git checkout main
git pull
```

**Depois, em qualquer um dos dois casos** — troque o caminho do bundle pelo real:

```bash
git fetch ~/Downloads/meta-capi.bundle \
  claude/meta-conversions-api-kl9skg:claude/meta-conversions-api-kl9skg

git push -u origin claude/meta-conversions-api-kl9skg
```

Isso publica a branch. O GitHub vai imprimir um link para abrir o pull request,
ou você pode abrir pela interface em **Pull requests → New pull request**,
comparando `main` com `claude/meta-conversions-api-kl9skg`.

**Conferindo que deu certo**, antes de subir:

```bash
git log --oneline main..claude/meta-conversions-api-kl9skg | wc -l
```

Deve responder `15`.

---

## O que tem nesses commits

Implementação da API de Conversões do Meta (envio de eventos pelo servidor, em
paralelo ao pixel do navegador, com deduplicação):

- `Lead` em todo cadastro da lista de espera — hoje quem responde "não" na
  pergunta de formação não gera evento nenhum
- `lead_qualificado` mantido como está, agora também pelo servidor
- `ViewContent` nas duas páginas
- Pixel e Google Tag Manager adicionados à página de vendas, que não tinha
  nenhum dos dois
- Correção da URL canônica da página de vendas, que apontava para um domínio
  errado

São 59 testes automatizados, todos passando. A branch **não altera** a
integração existente com o ActiveCampaign.

---

## Importante: não faça deploy em produção ainda

Publicar a branch e abrir o PR é seguro. Mas antes de mandar para produção,
quatro coisas precisam ser resolvidas — todas fora do código:

1. **Token da API de Conversões.** Precisa ser gerado no Gerenciador de Eventos
   do Meta e configurado na Vercel como `META_CAPI_ACCESS_TOKEN`. Sem ele o
   endpoint não funciona.

2. **Aviso de privacidade / LGPD.** A partir dessa mudança, e-mail e telefone
   passam a ser enviados ao Meta com hash. Hash não é anonimização — continua
   sendo dado pessoal, e o site hoje não tem política de privacidade nem aviso
   de consentimento em nenhuma das páginas. Vale resolver junto.

3. **Catálogo do Meta.** Se houver algum catálogo de produtos conectado ao pixel
   `1373287802810243`, os novos eventos de `ViewContent` podem aparecer como
   sinal incompleto e afetar a entrega de anúncios dinâmicos de **outras** partes
   do negócio, já que esse pixel é compartilhado. Vale conferir no Gerenciador de
   Eventos antes.

4. **Container do GTM.** A página de vendas passou a carregar o `GTM-MTZ9NFFN`.
   Se esse container tiver alguma tag de pixel configurada para todas as páginas,
   pode haver disparo duplicado de `PageView`.

O passo a passo completo de validação está em
`docs/superpowers/plans/2026-08-17-meta-conversions-api.md`, na Task 8.
