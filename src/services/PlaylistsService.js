/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
      FROM playlists as p
      LEFT JOIN users as u 
      ON u.id = p.owner
      WHERE owner = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist_songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongsById(playlistId) {
    const queryPlaylistDetail = {
      text: `SELECT p.id, p.name, u.username
      FROM playlists as p
      LEFT JOIN users as u
      ON u.id = p.owner
      WHERE p.id = $1`,
      values: [playlistId],
    };

    const queryPlaylistSongs = {
      text: `SELECT s.id, s.title, s.performer
      FROM songs as s
      LEFT JOIN playlist_songs as ps
      ON ps.song_id = s.id
      WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const result1 = await this._pool.query(queryPlaylistDetail);
    const result2 = await this._pool.query(queryPlaylistSongs);

    if (!result1.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    let finalResult = {};
    if (result2.rows.length) {
      finalResult = {
        ...result1.rows[0],
        songs: [...result2.rows],
      };
    } else {
      finalResult = {
        ...result1.rows[0],
        songs: [''],
      };
    }

    return finalResult;
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs 
      WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Lagu tidak ditemukan.');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
