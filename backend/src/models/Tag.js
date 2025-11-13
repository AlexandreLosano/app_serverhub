const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome da tag é obrigatório'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    descricao: {
      type: String,
      trim: true,
      default: '',
    },
    cor: {
      type: String,
      default: '#2196F3',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)'],
    },
    usoContador: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'tags',
  }
);

// Middleware para renomear timestamps para português
tagSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.criadoEm = ret.createdAt;
    ret.atualizadoEm = ret.updatedAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
