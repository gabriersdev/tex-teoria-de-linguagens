const fs = require('fs');
const path = require('path');

const RED_BG_WHITE_TEXT = '\x1b[41m\x1b[97m\x1b[1m';
const RESET = '\x1b[0m';

const targetDir = path.join(__dirname, '../content');
const outputDirName = 'output-dist';

// Extensões de arquivos temporários gerados pelo LaTeX
const extensionsToDelete = [
  '.aux', '.bbl', '.blg', '.dvi', '.fdb_latexmk',
  '.fls', '.log', '.synctex.gz', '.pdf', '.toc', '.out', '.lof', '.lot',
  '.bcf', '.run.xml'
];

console.log('Iniciando limpeza inteligente no diretório content...');

fs.readdir(targetDir, (err, files) => {
  if (err) {
    console.error(`${RED_BG_WHITE_TEXT} Erro ao ler o diretório: ${err.message || err} ${RESET}`);
    return;
  }
  
  // 1. Identificar todos os arquivos .tex
  const texFiles = files.filter(f => f.endsWith('.tex'));
  
  // Set para guardar os arquivos que são usados e não devem ser apagados
  const usedFiles = new Set();
  texFiles.forEach(f => usedFiles.add(f));
  
  // Função auxiliar para marcar arquivo como usado
  const addUsedFile = (fileName) => {
    if (!fs.existsSync(path.join(targetDir, fileName))) {
      const possibleExts = ['.jpg', '.png', '.pdf', '.eps', '.tex'];
      for (const ext of possibleExts) {
        if (fs.existsSync(path.join(targetDir, fileName + ext))) {
          usedFiles.add(fileName + ext);
          return;
        }
      }
    }
    usedFiles.add(fileName);
  };
  
  // 2. Ler os arquivos .tex e extrair dependências
  texFiles.forEach(texFile => {
    const texPath = path.join(targetDir, texFile);
    const content = fs.readFileSync(texPath, 'utf8');
    
    const imgRegex = /\\includegraphics(?:\[.*?\])?\{([^}]+)\}/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) addUsedFile(match[1]);
    
    const bibRegex = /\\bibliography\{([^}]+)\}/g;
    while ((match = bibRegex.exec(content)) !== null) {
      match[1].split(',').forEach(bib => addUsedFile(bib.trim() + '.bib'));
    }
    
    const bstRegex = /\\bibliographystyle\{([^}]+)\}/g;
    while ((match = bstRegex.exec(content)) !== null) addUsedFile(match[1] + '.bst');
    
    const styRegex = /\\usepackage(?:\[.*?\])?\{([^}]+)\}/g;
    while ((match = styRegex.exec(content)) !== null) {
      match[1].split(',').forEach(pkg => addUsedFile(pkg.trim() + '.sty'));
    }
    
    const inputRegex = /\\(?:input|include)\{([^}]+)\}/g;
    while ((match = inputRegex.exec(content)) !== null) {
      let fName = match[1];
      if (!fName.endsWith('.tex')) fName += '.tex';
      addUsedFile(fName);
    }
  });
  
  let deletedCount = 0;
  
  // 3. Limpa arquivos desnecessários na pasta content original (raiz)
  // Remove apenas os arquivos não usados que não são diretórios nem temporários
  // (Os temporários serão removidos na próxima etapa em todas as pastas)
  files.forEach(file => {
    if (file === outputDirName) return;
    
    const filePath = path.join(targetDir, file);
    const isTemp = extensionsToDelete.some(e => file.endsWith(e));
    const isUsed = usedFiles.has(file);
    const isDir = fs.lstatSync(filePath).isDirectory();
    
    if (!isUsed && !isDir && !isTemp) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deletado da origem (não utilizado): ${file}`);
        deletedCount++;
      } catch (err) {
        console.error(`${RED_BG_WHITE_TEXT} Erro ao deletar ${file}: ${err.message} ${RESET}`);
      }
    }
  });
  
  // 4. Limpeza recursiva de arquivos temporários e PDFs em todas as subpastas e na raiz
  const cleanRecursively = (dir) => {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const isDir = fs.lstatSync(itemPath).isDirectory();
      
      if (isDir) {
        cleanRecursively(itemPath);
      } else {
        const isTemp = extensionsToDelete.some(e => item.endsWith(e));
        // Evita deletar um PDF que está sendo explicitamente usado como imagem/arquivo referenciado
        const isUsed = usedFiles.has(item);
        
        if (isTemp && !isUsed) {
          try {
            fs.unlinkSync(itemPath);
            console.log(`Deletado (temporário/PDF): ${itemPath}`);
            deletedCount++;
          } catch (err) {
            console.error(`${RED_BG_WHITE_TEXT} Erro ao deletar ${itemPath}: ${err.message} ${RESET}`);
          }
        }
      }
    });
  };
  
  cleanRecursively(targetDir);
  
  console.log(`Limpeza concluída! ${deletedCount} arquivo(s) removido(s).`);
});
