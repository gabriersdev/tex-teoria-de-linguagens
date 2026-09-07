const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Ajusta o PATH no Windows para garantir que o MiKTeX e o Strawberry Perl sejam encontrados
if (process.platform === 'win32') {
  const homedir = os.homedir();
  const additionalPaths = [
    path.join(homedir, 'AppData/Local/Programs/MiKTeX/miktex/bin/x64'),
    'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64',
    'C:\\Program Files (x86)\\MiKTeX\\miktex\\bin\\x64',
    'C:\\Strawberry\\perl\\bin',
    'C:\\Strawberry\\c\\bin'
  ];

  const existingPaths = (process.env.PATH || '').split(path.delimiter);
  const pathsToAdd = additionalPaths.filter(p => fs.existsSync(p));

  if (pathsToAdd.length > 0) {
    process.env.PATH = [...pathsToAdd, ...existingPaths].join(path.delimiter);
  }
}


const RED_BG_WHITE_TEXT = '\x1b[41m\x1b[97m\x1b[1m';
const RESET = '\x1b[0m';

// Variavel de controle para exibir ou ocultar os logs detalhados do compilador (latexmk/pdflatex)
const SHOW_SYSTEM_LOGS = false; // Altere para true se desejar ver todos os logs do LaTeX

const targetDir = path.join(__dirname, '../content');
const outputDirName = 'output-dist';
const outputDirPath = path.join(targetDir, outputDirName);

console.log('Procurando arquivos .tex no diretório content...');

try {
  // Garante que a pasta de destino exista
  if (!fs.existsSync(outputDirPath)) fs.mkdirSync(outputDirPath);
  
  const files = fs.readdirSync(targetDir);
  const texFiles = files.filter(f => f.endsWith('.tex'));
  
  if (texFiles.length === 0) {
    console.log('Nenhum arquivo .tex encontrado para compilar.');
    process.exit(0);
  }
  
  console.log(`Encontrado(s) ${texFiles.length} arquivo(s) .tex para compilar.`);
  
  texFiles.forEach(texFile => {
    const texPath = path.join(targetDir, texFile);
    console.log(`Compilando ${texFile} usando latexmk...`);
    
    try {
      // Adicionamos a flag -outdir para que tudo (incluindo os arquivos temporários)
      // seja gerado e salvo na pasta 'output-dist'
      const stdioOption = SHOW_SYSTEM_LOGS ? 'inherit' : 'pipe';
      execSync(`latexmk -pdf -interaction=nonstopmode -outdir="${outputDirName}" -cd "${texPath}"`, {stdio: stdioOption});
      
      console.log(`Sucesso! O PDF de ${texFile} foi exportado para content/${outputDirName}/`);
    } catch (error) {
      console.error(`${RED_BG_WHITE_TEXT} ERRO AO COMPILAR ${texFile} ${RESET}`);
      if (!SHOW_SYSTEM_LOGS) {
        if (error.stdout && error.stdout.toString().trim()) {
          console.error('- SAÍDA DO COMPILADOR (STDOUT):');
          console.error(error.stdout.toString());
        }
        if (error.stderr && error.stderr.toString().trim()) {
          console.error('- ERRO DO COMPILADOR (STDERR):');
          console.error(error.stderr.toString());
        }
      } else {
        console.error('Verifique a saída acima.');
      }
    }
  });
  
} catch (err) {
  console.error(`${RED_BG_WHITE_TEXT} ERRO AO ACESSAR O DIRETÓRIO: ${err.message} ${RESET}`);
}
