// controllers/BukuController.js
const Buku = require('../models/BukuModels');
const { Op, Sequelize } = require('sequelize');

/**
 * CREATE / ADD BUKU
 * Body expected:
 * {
 *   id_buku, judul_buku, penulis, penerbit,
 *   tahun_terbit, eksemplar, kategori, bahasa,
 *   deskripsi, cover (URL/path), id_anggota
 * }
 */
const addBuku = async (req, res) => {
  try {
    // Jika cover diupload via multer: 
    const coverPath = req.file ? req.file.path : req.body.cover;
    const {
      id_buku,
      judul_buku,
      penulis,
      penerbit,
      tahun_terbit,
      eksemplar,
      kategori,
      bahasa,
      deskripsi,
      cover,
      halaman
    } = req.body;

    // Validasi sederhana
    if (!id_buku || !judul_buku) {
      return res.status(400).json({ message: 'id_buku dan judul_buku wajib diisi' });
    }

    const data = await Buku.create({
      id_buku,
      judul_buku,
      penulis,
      penerbit,
      tahun_terbit,
      eksemplar,
      kategori,
      bahasa,
      deskripsi,
      cover: coverPath,
      halaman
    });

    res.status(201).json({
      message: 'Create Buku Success',
      data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      serverMessage: error.message
    });
  }
};


/**
 * GET ALL BUKU + OPSIONAL FILTER
 * Query opsional: ?kategori=...&bahasa=...&penulis=...
 */

const getBuku = async (req, res) => {
  try {
    const { kategori, bahasa, penulis, q } = req.query;
    const whereClause = {};

    if (kategori) whereClause.kategori = kategori;
    if (bahasa) whereClause.bahasa = bahasa;
    if (penulis) whereClause.penulis = penulis;

    // Jika ada pencarian (q), tambahkan filter OR di judul atau penulis
    if (q) {
      whereClause[Op.and] = [
        {
          [Op.or]: [
            { judul_buku: { [Op.like]: `%${q}%` } },
            { penulis: { [Op.like]: `%${q}%` } }
          ]
        }
      ];
    }

    const bukuData = await Buku.findAll({ where: whereClause });

    res.json({
      message: 'Get Buku Success',
      data: bukuData
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      serverMessage: error.message
    });
  }
};



/**
 * SEARCH BUKU BY JUDUL (mirip getArticlesByTitle)
 * Query: ?q=keyword
 */
const searchBukuByJudul = async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const hasil = await Buku.findAll({
      where: {
        judul_buku: {
          [Op.like]: `%${searchTerm}%`
        }
      }
    });

    if (!hasil || hasil.length === 0) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    res.json({
      message: 'Search Buku Success',
      data: hasil
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching buku',
      error: error.message
    });
  }
};


/**
 * GET BUKU BY ID (Primary Key id_buku)
 * Param: /:id_buku
 */
const getBukuById = async (req, res) => {
  try {
    const { id } = req.params; // pastikan route pakai /buku/:id
    const buku = await Buku.findByPk(id);
    if (!buku) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
    res.json({
      message: 'Get Buku Success',
      data: buku
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan dalam mengambil Buku' });
  }
};


/**
 * GET RANDOM BUKU
 * Query opsional: ?limit=10
 * (Perbaikan dari versi loop ID manual)
 */
const getRandomBuku = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Buku.findAll({
      order: Sequelize.literal('RAND()'), // MySQL
      limit
    });

    res.json({
      message: 'Get Random Buku Success',
      data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Terjadi kesalahan dalam mengambil buku random',
      error: error.message
    });
  }
};


/**
 * (Opsional) UPDATE BUKU
 * PUT /buku/:id
 */
const updateBuku = async (req, res) => {
  try {
    const { id } = req.params;
    const buku = await Buku.findByPk(id);
    if (!buku) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    await buku.update(req.body);

    res.json({
      message: 'Update Buku Success',
      data: buku
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal update buku',
      error: error.message
    });
  }
};


/**
 * (Opsional) DELETE BUKU
 * DELETE /buku/:id
 */
const deleteBuku = async (req, res) => {
  try {
    const { id } = req.params;
    const buku = await Buku.findByPk(id);
    if (!buku) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
    await buku.destroy();
    res.json({
      message: 'Delete Buku Success'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal delete buku',
      error: error.message
    });
  }
};


module.exports = {
  addBuku,
  getBuku,
  searchBukuByJudul,
  getBukuById,
  getRandomBuku,
  updateBuku,
  deleteBuku
};
