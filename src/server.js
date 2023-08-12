/* eslint-disable no-underscore-dangle */
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/SongsService');
const SongsValidator = require('./validator/songs');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// users
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // pasang plugin
  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  }, {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  }, {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  }, {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  }, {
    plugin: playlists,
    options: {
      playlistsService,
      songsService,
      validator: PlaylistsValidator,
    },
  }, {
    plugin: _exports,
    options: {
      producerService: ProducerService,
      playlistsService,
      validator: ExportsValidator,
    },
  }]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
