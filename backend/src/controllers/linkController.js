const Link = require('../models/Link');
const Tag = require('../models/Tag');

// @desc    Listar todos os links
// @route   GET /api/links
// @query   ?categoria=id&tags=tag1,tag2&search=termo&ativo=true
const getLinks = async (req, res, next) => {
  try {
    const { categoria, tags, search, ativo } = req.query;

    // Construir filtro dinâmico
    const filter = {};

    if (categoria) {
      filter.categoria = categoria;
    }

    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { observacoes: { $regex: search, $options: 'i' } },
      ];
    }

    if (ativo !== undefined) {
      filter.ativo = ativo === 'true';
    }

    const links = await Link.find(filter)
      .populate('categoria', 'nome icone cor')
      .populate('tags', 'nome cor')
      .sort({ ordem: 1 });

    res.json({
      success: true,
      count: links.length,
      data: links,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar link por ID
// @route   GET /api/links/:id
const getLinkById = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id)
      .populate('categoria', 'nome icone cor')
      .populate('tags', 'nome cor');

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link não encontrado',
      });
    }

    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo link
// @route   POST /api/links
const createLink = async (req, res, next) => {
  try {
    console.log('📥 POST /api/links - Recebido:', JSON.stringify(req.body, null, 2));
    const { tags, ...linkData } = req.body;

    // Criar o link
    console.log('💾 Criando link com dados:', JSON.stringify(linkData, null, 2));
    const link = await Link.create(linkData);
    console.log('✅ Link criado com ID:', link._id);

    // Se houver tags, incrementar contador de uso
    if (tags && tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: tags } },
        { $inc: { usoContador: 1 } }
      );

      link.tags = tags;
      await link.save();
    }

    // Buscar link populado
    const populatedLink = await Link.findById(link._id)
      .populate('categoria', 'nome icone cor')
      .populate('tags', 'nome cor');

    res.status(201).json({
      success: true,
      data: populatedLink,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar link
// @route   PUT /api/links/:id
const updateLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link não encontrado',
      });
    }

    // Se as tags mudaram, atualizar contadores
    const { tags: newTags, ...updateData } = req.body;

    if (newTags) {
      const oldTags = link.tags;

      // Decrementar tags removidas
      const removedTags = oldTags.filter(
        tag => !newTags.includes(tag.toString())
      );
      if (removedTags.length > 0) {
        await Tag.updateMany(
          { _id: { $in: removedTags } },
          { $inc: { usoContador: -1 } }
        );
      }

      // Incrementar tags adicionadas
      const addedTags = newTags.filter(
        tag => !oldTags.map(t => t.toString()).includes(tag)
      );
      if (addedTags.length > 0) {
        await Tag.updateMany(
          { _id: { $in: addedTags } },
          { $inc: { usoContador: 1 } }
        );
      }

      updateData.tags = newTags;
    }

    const updatedLink = await Link.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('categoria', 'nome icone cor')
      .populate('tags', 'nome cor');

    res.json({
      success: true,
      data: updatedLink,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar link
// @route   DELETE /api/links/:id
const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link não encontrado',
      });
    }

    // Decrementar contador de uso das tags
    if (link.tags && link.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: link.tags } },
        { $inc: { usoContador: -1 } }
      );
    }

    await link.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Link removido com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reordenar links (drag-and-drop)
// @route   PATCH /api/links/reorder
// @body    { links: [{ id, ordem }] }
const reorderLinks = async (req, res, next) => {
  try {
    const { links } = req.body;

    if (!links || !Array.isArray(links)) {
      return res.status(400).json({
        success: false,
        error: 'Array de links é obrigatório',
      });
    }

    // Atualizar ordem de cada link
    const updatePromises = links.map(({ id, ordem }) =>
      Link.findByIdAndUpdate(id, { ordem }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Ordem dos links atualizada com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
};
