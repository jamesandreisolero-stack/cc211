/* =========================================================
   MOVIE LIST - add new titles in this file only.

   Format of one line (keep the comma at the end):
   M('Title', 'type', year, rating, 'Area', ['Genre', 'Genre'], 'Short description', 'flags'),

   type   : 'movie', 'anime' or 'tv'
   genres : 'Thriller', 'Action', 'Sci-Fi' work with the genre buttons
   flags  : optional. p = show under Popular, h = rotate in the top picture, ph = both
   poster : put images/<title in lowercase with dashes>.jpg
            e.g. Star Wars -> images/star-wars.jpg

   To make a title playable, add a video file in the video part:
   video: { 720: 'videos/file.mp4' }
   ========================================================= */

const slug = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const M = (title, type, year, rating, area, genres, synopsis, flags = '') => ({
  title, type, year, rating, area, genres, synopsis,
  popular: flags.includes('p'),
  hero: flags.includes('h'),
  img: `images/${slug(title)}.jpg`,
  video: {}
});

const DATA = [

  // ---------- NEW TITLES: paste new lines here ----------


  // ---------- MOVIES ----------
  M('The Truman Show', 'movie', 1998, 8.2, 'America', ['Sci-Fi', 'Drama'], 'A man slowly discovers his whole life is a TV show.', 'h'),
  M('Avengers: Infinity War', 'movie', 2018, 9.6, 'America', ['Action', 'Adventure', 'Sci-Fi'], 'The Avengers face Thanos as he hunts the Infinity Stones.', 'p'),
  M('Star Wars', 'movie', 1977, 8.6, 'America', ['Action', 'Adventure', 'Sci-Fi'], 'A farm boy joins a rebellion against a galactic empire.', 'p'),
  M('Inception', 'movie', 2010, 8.8, 'America', ['Sci-Fi', 'Action', 'Thriller'], 'A thief enters dreams to plant an idea.', 'ph'),
  M('The Dark Knight', 'movie', 2008, 9.0, 'America', ['Action', 'Thriller'], 'Batman faces the Joker in Gotham.', 'ph'),
  M('Interstellar', 'movie', 2014, 8.7, 'America', ['Sci-Fi', 'Adventure'], 'Explorers travel through a wormhole to save humanity.', 'h'),
  M('Se7en', 'movie', 1995, 8.6, 'America', ['Thriller'], 'Two detectives hunt a killer who uses the seven deadly sins.'),
  M('Mad Max: Fury Road', 'movie', 2015, 8.1, 'Australia', ['Action', 'Sci-Fi'], 'A desert chase to escape a tyrant.'),

  // ---------- ANIME ----------
  M('Attack on Titan', 'anime', 2013, 9.1, 'Japan', ['Action', 'Thriller'], 'Humanity fights giants from behind towering walls.', 'p'),
  M('Death Note', 'anime', 2006, 9.0, 'Japan', ['Thriller'], 'A student finds a notebook that kills by name.', 'h'),
  M('Cowboy Bebop', 'anime', 1998, 8.9, 'Japan', ['Sci-Fi', 'Action'], 'Bounty hunters drift through space.'),
  M('Steins;Gate', 'anime', 2011, 8.8, 'Japan', ['Sci-Fi', 'Thriller'], 'A group of friends discovers messages to the past.'),
  M('Demon Slayer', 'anime', 2019, 8.7, 'Japan', ['Action'], 'A boy becomes a demon slayer to save his sister.'),
  M('Fullmetal Alchemist: Brotherhood', 'anime', 2009, 9.1, 'Japan', ['Action', 'Adventure'], 'Two brothers search for the Philosopher’s Stone.'),

  // ---------- TV SHOWS ----------
  M('Chernobyl', 'tv', 2019, 9.3, 'UK / USA', ['Thriller', 'Drama'], 'The 1986 nuclear disaster and the people who faced it.', 'p'),
  M('Breaking Bad', 'tv', 2008, 9.5, 'America', ['Thriller', 'Drama'], 'A teacher turns to making drugs.', 'p'),
  M('Stranger Things', 'tv', 2016, 8.7, 'America', ['Sci-Fi', 'Thriller'], 'Kids uncover secrets and a parallel dimension.', 'ph'),
  M('The Mandalorian', 'tv', 2019, 8.7, 'America', ['Sci-Fi', 'Action'], 'A bounty hunter protects a mysterious child.'),
  M('Black Mirror', 'tv', 2011, 8.7, 'UK', ['Sci-Fi', 'Thriller'], 'Stories about technology’s dark side.'),
  M('The Boys', 'tv', 2019, 8.7, 'America', ['Action', 'Thriller'], 'Vigilantes take on corrupt superheroes.')

];
