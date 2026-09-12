const fs = require('fs');
const path = require('path');

function fixDictFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix multiline errServerError strings that break TypeScript
  content = content.replace(
    /errServerError:\s*"([^"]*)\n\s*([^"]*)",/g,
    'errServerError: "$1 $2",'
  );
  
  // Fix German locale
  content = content.replace(
    /errServerError:\s*"Ein interner Fehler ist aufgetreten\.\s+Versuche es in ein paar Minuten erneut\.",/g,
    'errServerError: "Ein interner Fehler ist aufgetreten. Versuche es in ein paar Minuten erneut.",'
  );
  
  // Fix Italian locale
  content = content.replace(
    /errServerError:\s*"Si è verificato un errore interno\.\s+Riprova tra qualche minuto\.",/g,
    'errServerError: "Si è verificato un errore interno. Riprova tra qualche minuto.",'
  );
  
  // Fix Spanish locale
  content = content.replace(
    /errServerError:\s*"Ocurrió un error interno\.\s+Inténtalo de nuevo en unos minutos\.",/g,
    'errServerError: "Ocurrió un error interno. Inténtalo de nuevo en unos minutos.",'
  );
  
  // Fix Portuguese locale
  content = content.replace(
    /errServerError:\s*"Ocorreu um erro interno\.\s+Tente novamente em alguns minutos\.",/g,
    'errServerError: "Ocorreu um erro interno. Tente novamente em alguns minutos.",'
  );
  
  // Fix French locale (the problematic one)
  content = content.replace(
    /errStale:\s*"Le traitement a pris trop de temps\. Veuillez rAcessayer\.",\s*errServerError:\s*"Une erreur interne est survenue\.\s+RAcessayez dans quelques minutes\.",/g,
    'errStale: "Le traitement a pris trop de temps. Veuillez rAcessayer.",\n  errServerError: "Une erreur interne est survenue. Réessayez dans quelques minutes.",'
  );
  
  // Fix German locale (the other one with issue)
  content = content.replace(
    /errStale:\s*"Die Verarbeitung hat zu lange gedauert\.\s+Bitte versuche es erneut\.",\s*errServerError:\s*"Ein interner Fehler ist aufgetreten\.\s+Versuche es in ein paar Minuten erneut\.",/g,
    'errStale: "Die Verarbeitung hat zu lange gedauert. Bitte versuche es erneut.",\n  errServerError: "Ein interner Fehler ist aufgetreten. Versuche es in ein paar Minuten erneut.",'
  );
  
  // Fix Italian locale (the other one with issue)
  content = content.replace(
    /errStale:\s*"L'elaborazione ha richiesto troppo tempo\.\s+Riprova\.",\s*errServerError:\s*"Si è verificato un errore interno\.\s+Riprova tra qualche minuto\.",/g,
    'errStale: "L\'elaborazione ha richiesto troppo tempo. Riprova.",\n  errServerError: "Si è verificato un errore interno. Riprova tra qualche minuto.",'
  );
  
  // Fix Portuguese locale (the other one with issue)
  content = content.replace(
    /errStale:\s*"O processamento demorou demais\.\s+Tente novamente\.",\s*errServerError:\s*"Ocorreu um erro interno\.\s+Tente novamente em alguns minutos\.",/g,
    'errStale: "O processamento demorou demais. Tente novamente.",\n  errServerError: "Ocorreu um erro interno. Tente novamente em alguns minutos.",'
  );
  
  // Fix Spanish locale (the other one with issue)
  content = content.replace(
    /errStale:\s*"El procesamiento tardó demasiado\.\s+Inténtalo de nuevo\.",\s*errServerError:\s*"Ocurrió un error interno\.\s+Inténtalo de nuevo en unos minutos\.",/g,
    'errStale: "El procesamiento tardó demasiado. Inténtalo de nuevo.",\n  errServerError: "Ocurrió un error interno. Inténtalo de nuevo en unos minutos.",'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', filePath);
}

const dictDir = path.join(__dirname, 'services', 'frontend', 'src', 'lib', 'i18n', 'dictionaries');
['dict_lang1.ts', 'dict_lang2.ts', 'dict_lang3.ts', 'dict_lang4.ts', 'dict_lang5.ts', 'dict_lang6.ts'].forEach(f => {
  fixDictFile(path.join(dictDir, f));
});