const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome do link é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    },
    endereco: {
      type: String,
      required: [true, 'Endereço (URL) é obrigatório'],
      trim: true,
    },
    observacoes: {
      type: String,
      trim: true,
      default: '',
    },
    credenciais: {
      type: String,
      trim: true,
      default: '',
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Categoria é obrigatória'],
    },
    icone: {
      type: String,
      default: '🔗',
    },
    cor: {
      type: String,
      default: '#4CAF50',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)'],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    ordem: {
      type: Number,
      default: 0,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'links',
  }
);

// Middleware para renomear timestamps para português
linkSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.criadoEm = ret.createdAt;
    ret.atualizadoEm = ret.updatedAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

// Index para melhorar performance de queries
linkSchema.index({ nome: 'text', observacoes: 'text' });
linkSchema.index({ categoria: 1 });
linkSchema.index({ tags: 1 });
linkSchema.index({ ordem: 1 });

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
