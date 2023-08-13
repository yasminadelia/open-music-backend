const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();
// unknown() -> fungsi utk bikin objek yg sifatnya tidak diketahui
// dalam kasus ini, objek bisa punya properti apa aja asalkan ada properti content-type

module.exports = { ImageHeadersSchema };
