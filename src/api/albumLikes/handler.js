const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class AlbumLikesHandler {
  constructor(albumLikesService, albumsService) {
    this._albumLikesService = albumLikesService;
    this._albumsService = albumsService;
  }

  async postAlbumLikeHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { id: albumId } = request.params;

      await this._albumsService.verifyAlbum(albumId);
      await this._albumLikesService.verifyAlbumLike(userId, albumId);
      await this._albumLikesService.addAlbumLike(userId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil menyukai album',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const [albumLikesCount, cache] = await this._albumLikesService.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: Number(albumLikesCount),
      },
    });

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteAlbumLikeHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { id: albumId } = request.params;

      await this._albumLikesService.deleteAlbumLike(userId, albumId);
      return {
        status: 'success',
        message: 'Berhasil batal menyukai album',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumLikesHandler;
