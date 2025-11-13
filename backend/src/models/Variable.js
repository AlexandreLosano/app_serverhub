const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema(
  {
    chave: {
      type: String,
      required: [true, 'Chave da variável é obrigatória'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    valor: {
      type: String,
      required: [true, 'Valor da variável é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'variables',
  }
);

// Middleware para renomear timestamps para português
variableSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.criadoEm = ret.createdAt;
    ret.atualizadoEm = ret.updatedAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const Variable = mongoose.model('Variable', variableSchema);

module.exports = Variable;
