// Script para corrigir URLs com protocolo na posição errada
const mongoose = require('mongoose');
const Link = require('../models/Link');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin@192.168.2.138:27017/server_hub?authSource=admin';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

async function fixUrls() {
  try {
    console.log(`${colors.blue}Conectando ao MongoDB...${colors.reset}`);
    await mongoose.connect(MONGO_URI);
    console.log(`${colors.green}✓ Conectado!${colors.reset}\n`);

    // Buscar todos os links
    const links = await Link.find({});
    console.log(`${colors.blue}Encontrados ${links.length} links${colors.reset}\n`);

    let fixed = 0;
    let skipped = 0;

    for (const link of links) {
      const originalUrl = link.endereco;

      // Regex para detectar padrão errado: {{VAR}}:protocol://porta ou {{VAR}}:protocol://porta
      const wrongPattern = /^(\{\{[A-Z_]+\}\}):([a-z]+):\/\/(\d+)$/;
      const wrongPatternNoProtocol = /^(\{\{[A-Z_]+\}\}):(https?):\/\/(\d+)$/;

      let newUrl = originalUrl;

      // Corrigir padrão: {{VAR}}:http://porta -> http://{{VAR}}:porta
      if (wrongPatternNoProtocol.test(originalUrl)) {
        newUrl = originalUrl.replace(wrongPatternNoProtocol, '$2://$1:$3');
        console.log(`${colors.yellow}[${link.nome}]${colors.reset}`);
        console.log(`  ❌ ${originalUrl}`);
        console.log(`  ✓ ${newUrl}`);

        link.endereco = newUrl;
        await link.save();
        fixed++;
      }
      // Corrigir padrão alternativo: {{VAR}}:http:8080 -> http://{{VAR}}:8080
      else if (/^(\{\{[A-Z_]+\}\}):(https?):(\d+)$/.test(originalUrl)) {
        newUrl = originalUrl.replace(/^(\{\{[A-Z_]+\}\}):(https?):(\d+)$/, '$2://$1:$3');
        console.log(`${colors.yellow}[${link.nome}]${colors.reset}`);
        console.log(`  ❌ ${originalUrl}`);
        console.log(`  ✓ ${newUrl}`);

        link.endereco = newUrl;
        await link.save();
        fixed++;
      } else {
        skipped++;
      }
    }

    console.log(`\n${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}✓ Correção concluída!${colors.reset}`);
    console.log(`${colors.green}  • Corrigidos: ${fixed}${colors.reset}`);
    console.log(`${colors.blue}  • Não precisavam: ${skipped}${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(`${colors.red}✗ Erro: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

fixUrls();
