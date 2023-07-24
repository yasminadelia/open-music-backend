/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat album baru.
  pgm.sql("INSERT INTO albums(id, name, year, created_at, updated_at) VALUES ('old_songs', 'old_songs', 0, 'old_songs', 'old_songs')");

  // mengubah nilai album_id pada songs yang album_id-nya bernilai NULL
  pgm.sql("UPDATE songs SET album_id = 'old_songs' WHERE album_id IS NULL");

  // memberikan constraint foreign key pada album_id terhadap kolom id dari tabel albums
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_songs.album_id_albums.id pada tabel songs
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');

  // mengubah nilai album_id old_songs pada songs menjadi NULL
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");

  // menghapus album baru.
  pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
