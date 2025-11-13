const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome da categoria é obrigatório'],
      trim: true,
      unique: true,
    },
    descricao: {
      type: String,
      trim: true,
      default: '',
    },
    icone: {
      type: String,
      default: '📁',
    },
    cor: {
      type: String,
      default: '#4CAF50',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)'],
    },
    ordem: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'categorias',
  }
);

// Middleware para renomear timestamps para português
categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.criadoEm = ret.createdAt;
    ret.atualizadoEm = ret.updatedAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
