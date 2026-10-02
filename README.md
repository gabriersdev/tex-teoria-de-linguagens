# Projeto LaTeX - Teoria de Linguagens

Este é um ambiente moderno e automatizado para a escrita de documentos LaTeX, utilizando o template da Sociedade Brasileira de Computação (SBC). O projeto inclui scripts em Node.js para facilitar a compilação, o gerenciamento de dependências e manter a pasta do projeto sempre limpa.

## 📂 Estrutura do Projeto

```text
tex-teoria-de-linguagens/
├── content/              # Diretório principal onde você escreve o artigo
│   ├── sbc-template.tex  # Arquivo LaTeX principal
│   ├── sbc-template.sty  # Regras de formatação (SBC)
│   ├── sbc-template.bib  # Banco de referências bibliográficas
│   ├── sbc.bst           # Estilo das bibliografias
│   └── output-dist/      # (Autogerada) Recebe o PDF compilado e arquivos temporários
├── scripts/              # Scripts de automação Node.js
│   ├── compile.js        # Script de compilação via latexmk
│   └── clean.js          # Script inteligente de limpeza
├── package.json          # Configuração dos atalhos (NPM Scripts)
└── README.md             # Esta documentação
```

## 🚀 Requisitos e Instalação do Ambiente

Certifique-se de ter os seguintes programas instalados no seu computador para usar todas as funções:
1. **Node.js e NPM**: Utilizados para rodar os scripts de automação.
2. **Perl**: Necessário para a execução do compilador `latexmk`. No Windows, instale o [Strawberry Perl](https://strawberryperl.com/).
3. **Distribuição LaTeX**: Recomendamos o **MiKTeX** (para Windows) ou **TeX Live** (Linux/Mac).
4. **latexmk**: O script principal de compilação exige o pacote `latexmk`. Ele automatiza as passagens de referências e bibliografias (`bibtex`).

### Como instalar o compilador LaTeX (Windows / MiKTeX)
1. Baixe o instalador do [MiKTeX](https://miktex.org/download) e instale-o.
2. Abra o "MiKTeX Console", vá na aba **Updates** e clique em "Check for updates".
3. Para garantir que você tem o `latexmk` (responsável pela automação) disponível, abra um terminal e rode os comandos abaixo.
   
   *(Nota 1: O primeiro comando garante que o MiKTeX saiba de onde baixar os pacotes, evitando o erro "Not a package repository".)*
   *(Nota 2: O último comando atualiza a base e evita o erro "you have not checked for MiKTeX updates" na primeira compilação do latexmk.)*
   ```bash
   mpm --set-repository=$(mpm --pick-repository-url)
   miktex packages install latexmk
   miktex packages update
   ```
*(Se estiver usando Linux/Ubuntu, basta rodar `sudo apt install texlive-full latexmk`)*

## 🛠️ Comandos Disponíveis

Você não precisa decorar os caminhos dos scripts. Na raiz do projeto, use os comandos padrão do NPM para gerenciar o documento:

### Compilar o documento
```bash
npm run compile
```
- O que faz: Entra na pasta `content` e compila os arquivos `.tex` encontrados.
- Destino Limpo: Graças ao gerenciamento do script, seu PDF final e os resíduos do LaTeX (`.aux`, `.log`, `.bbl`, etc) são isolados e salvos diretamente na pasta `content/output-dist`, mantendo a raiz do seu texto organizada.
- **Dica de logs:** O arquivo `scripts/compile.js` contém a variável de controle `SHOW_SYSTEM_LOGS` (definida como `false` por padrão). Altere-a para `true` caso deseje ver todos os detalhes e o progresso da compilação do LaTeXmk/pdflatex em tempo real no terminal.


### Limpeza Inteligente
```bash
npm run clean
```
- O que faz: Roda o faxineiro do projeto.
- Remoção de resíduos: Esvazia os resíduos temporários acumulados na pasta `output-dist`.
- Varredura Inteligente (Garbage Collector): O script lê o seu código fonte `.tex` e analisa exatamente quais imagens (`\includegraphics`), pacotes (`\usepackage`) e referências você está utilizando. Se você apagar uma imagem do seu código, o script perceberá que ela não tem mais utilidade e a deletará fisicamente do seu computador, mantendo o projeto o mais leve possível.

### Construir e Limpar (Recomendado)
```bash
npm run build
```
- O que faz: A união perfeita. Executa o `compile` atualizando o seu PDF e, na sequência, roda o `clean` para varrer os rastros da compilação e imagens não utilizadas, entregando apenas o resultado final limpo.

## 💡 Dicas de Uso
- Se você adicionar um novo arquivo `.tex` avulso dentro de `content`, o `npm run compile` o identificará e compilará um PDF separado para ele de forma automática.
- Para imagens e dependências, tome o cuidado de só manter no diretório `content` o que você efetivamente for usar no texto, pois a varredura inteligente do script de limpeza é implacável com arquivos sem referência!

## 🐛 Descobertas e Solução de Problemas (Troubleshooting)

Durante o desenvolvimento deste projeto, documentamos soluções cruciais para armadilhas muito comuns ao trabalhar com LaTeX. Caso enfrente problemas, consulte esta lista:

### 1. O Erro `! I can't write on file sbc-template.pdf`
Quando esse erro ocorrer durante a compilação, significa que o seu arquivo de saída (PDF) está **aberto/bloqueado por algum leitor de PDF** (como Adobe Acrobat).
**A Solução:** Feche o arquivo PDF. Como o `latexmk` pode "memorizar" que a última execução falhou, após fechar o arquivo, primeiro rode `npm run clean` para esvaziar o cache, e logo em seguida compile novamente.

### 2. Extensão LaTeX Workshop do VS Code "Travando"
A extensão tenta auto-compilar o código e rodar verificações de formato por conta própria a cada salvamento, o que gera conflito de arquivos e lentidão. 
**A Solução:** Foi criado um arquivo `.vscode/settings.json` no projeto, forçando a configuração `"latex-workshop.latex.autoBuild.run": "never"`. Isso devolve o controle da compilação totalmente para o nosso comando manual via NPM.

### 3. Código acentuado (UTF-8) quebrando a compilação no pacote `listings`
O pacote `listings`, que insere e formata blocos de códigos bonitos no texto, quebra (gera erros do tipo `Invalid UTF-8 byte`) caso encontre caracteres multi-byte como *é, ç, ã* nas strings ou nos comentários do seu código (Ex: Java, Python).
**A Solução:** No cabeçalho (*preamble*) do seu arquivo principal (`sbc-template.tex`), configuramos o comando `\lstset` com o atributo `literate`. Nele, foi inserido um dicionário que mapeia toda a acentuação do português para macros do LaTeX (`literate={á}{{\'a}}1 {é}{{\'e}}1...`). Assim, a acentuação de códigos externos passa a renderizar perfeitamente.

### 4. Uso de arquivos "filhos" e o comando `\input{}`
**Regra de Ouro:** Ao criar partes do seu texto e injetá-las no arquivo principal usando o comando `\input{parts/seu-arquivo.tex}`, saiba que o arquivo importado **não pode** conter tags de inicialização (nada de `\documentclass`, `\usepackage` ou `\begin{document}`).
O LaTeX interpreta o `\input` como se você estivesse "copiando e colando" o texto lá dentro. Se ele ler dois `\documentclass` no mesmo fluxo, ele estourará um erro. Coloque todos os imports de pacotes exclusivamente no arquivo "pai" (o arquivo principal que invoca os demais).

### 5. Erro `latexmk não é reconhecido` e PATH no Windows
Após a instalação do MiKTeX ou Strawberry Perl, o terminal atual pode não reconhecer os novos comandos até que seja reiniciado ou as variáveis de ambiente globais sejam atualizadas.
**A Solução:** O script `scripts/compile.js` foi configurado para resolver isso de forma automática, injetando temporariamente no `process.env.PATH` do processo Node as pastas de instalação padrões do MiKTeX (`AppData/Local/Programs/MiKTeX` / `Program Files`) e do Strawberry Perl (`C:\Strawberry`). Isso possibilita rodar a compilação diretamente mesmo que o terminal atual ainda não tenha sido reiniciado.

### 6. Janela popup "Package Installation" do MiKTeX travando o terminal
Na primeira compilação do projeto, o MiKTeX tenta baixar os pacotes necessários (como `times.sty` ou `caption.sty`) exibindo uma janela de confirmação de interface gráfica (GUI). Se o terminal rodar em segundo plano ou o usuário não notar a janela, a compilação ficará travada indefinidamente.
**A Solução:** Configure a ferramenta de instalação em segundo plano do MiKTeX para baixar pacotes de forma automática e silenciosa sem prompts visuais. Execute o seguinte comando no terminal:
```bash
initexmf --set-config-value "[MPM]AutoInstall=1"
```

### 7. Scripts PowerShell Desabilitados (`npm.ps1 não pode ser carregado`) no Windows
No PowerShell do Windows, tentar rodar `npm run build` pode retornar um erro informando que a execução de scripts está desabilitada no sistema (`UnauthorizedAccess`).
**A Solução:** Você pode ignorar essa restrição chamando explicitamente a versão executável `npm.cmd` em vez de `npm.ps1` usando o operador de chamada do PowerShell:
```powershell
& "C:\Program Files\nodejs\npm.cmd" run build
```
Ou alternativamente, rodar no Prompt de Comando (CMD) tradicional, ou executar o script de compilação diretamente com o Node:
```bash
node scripts/compile.js
```

### 8. Erros `! LaTeX Error: There's no line here to end.` e `Missing \begin{document}.` em `\nextinstitute`
Ao utilizar o template da SBC para declarar múltiplos blocos de endereços ou e-mails, o comando `\nextinstitute` **deve obrigatoriamente estar dentro** do bloco do comando `\address{...}`.
**A Solução:** Mova o fechamento de chave `}` do bloco `\address{` para depois do último e-mail ou do comando `\nextinstitute`. Caso a chave seja fechada prematuramente antes de `\nextinstitute`, o compilador tentará renderizá-lo fora do cabeçalho, provocando erros de compilação fatais.

### 9. Uso de Asteriscos Personalizados nas Filiações e a Numeração Automática (`¹`)
Caso prefira usar marcações personalizadas de autores (ex: `Nome\inst{*}`, `Nome\inst{**}`) em vez da numeração sequencial tradicional (`1, 2, ...`), o template SBC adicionará por padrão o caractere automático de filiação `¹` na primeira linha de endereço.
**A Solução:** Redefina a macro `\instnum` para vazia inserindo a instrução `\renewcommand{\instnum}{}` logo após declarar o bloco `\address{...}` no preâmbulo do seu arquivo principal.

### 10. Quebra de Linha em Listas de Autores Muito Longas (`\author{}`)
Quando o projeto contém muitos autores, a lista pode exceder a largura padrão e estourar as margens.
**A Solução:** Você pode forçar uma quebra de linha inserindo o comando de quebra do LaTeX `\\` ao final da linha de um dos autores (ex: `Nome\inst{***},\\`). Certifique-se de utilizar apenas comandos LaTeX válidos e **nunca** caracteres especiais literais como `\n` ou barras invertidas simples, pois o compilador retornará `! Undefined control sequence.`.

### 11. Erro de Arquivo Não Encontrado (`File not found`) em comandos `\input{}`
Erros fatais ocorrem quando o nome do arquivo referenciado dentro de um comando `\input{}` não coincide exatamente com o arquivo existente na pasta de origem.
**A Solução:** Verifique eventuais erros de digitação (typos) no nome e extensão dos arquivos importados. Por exemplo, referenciar `codes/esparance-py.tex` quando o arquivo em disco se chama `esperance-py.tex` (com 'e') fará a compilação do LaTeX falhar.


