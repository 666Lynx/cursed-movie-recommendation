// TMDB API Integration for Cursed Movie Recommender
class TMDBAPI {
    constructor() {
        // You'll need to get a free API key from https://www.themoviedb.org/settings/api
        this.apiKey = 'YOUR_TMDB_API_KEY_HERE'; // Replace with your actual API key
        this.baseURL = 'https://api.themoviedb.org/3';
        this.imageBaseURL = 'https://image.tmdb.org/t/p/w500';
        this.backdropBaseURL = 'https://image.tmdb.org/t/p/original';
    }

    // Set API key (call this after getting your key)
    setApiKey(key) {
        this.apiKey = key;
    }

    // Fetch popular movies from TMDB
    async getPopularMovies(page = 1) {
        try {
            const response = await fetch(
                `${this.baseURL}/movie/popular?api_key=${this.apiKey}&language=en-US&page=${page}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatMovies(data.results);
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return [];
        }
    }

    // Search movies by title
    async searchMovies(query, page = 1) {
        try {
            const response = await fetch(
                `${this.baseURL}/search/movie?api_key=${this.apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatMovies(data.results);
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    // Get movies by genre
    async getMoviesByGenre(genreId, page = 1) {
        try {
            const response = await fetch(
                `${this.baseURL}/discover/movie?api_key=${this.apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genreId}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatMovies(data.results);
        } catch (error) {
            console.error('Error fetching movies by genre:', error);
            return [];
        }
    }

    // Get movie details including genres
    async getMovieDetails(movieId) {
        try {
            const response = await fetch(
                `${this.baseURL}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const movie = await response.json();
            return this.formatMovie(movie);
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    // Get all available genres
    async getGenres() {
        try {
            const response = await fetch(
                `${this.baseURL}/genre/movie/list?api_key=${this.apiKey}&language=en-US`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.genres;
        } catch (error) {
            console.error('Error fetching genres:', error);
            return [];
        }
    }

    // Format movie data to match our app's structure
    formatMovie(movie) {
        return {
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path ? `${this.imageBaseURL}${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${this.backdropBaseURL}${movie.backdrop_path}` : null,
            genres: movie.genres ? movie.genres.map(g => g.name) : [],
            overview: movie.overview,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            voteCount: movie.vote_count,
            popularity: movie.popularity
        };
    }

    // Format multiple movies
    formatMovies(movies) {
        return movies.map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path ? `${this.imageBaseURL}${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${this.backdropBaseURL}${movie.backdrop_path}` : null,
            genres: movie.genre_ids ? this.mapGenreIdsToNames(movie.genre_ids) : [],
            overview: movie.overview,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            voteCount: movie.vote_count,
            popularity: movie.popularity
        }));
    }

    // Map genre IDs to names (this will be populated when we fetch genres)
    mapGenreIdsToNames(genreIds) {
        if (!this.genreMap) {
            return genreIds.map(id => `Genre ${id}`);
        }
        return genreIds.map(id => this.genreMap[id] || `Genre ${id}`);
    }

    // Initialize genre mapping
    async initializeGenres() {
        const genres = await this.getGenres();
        this.genreMap = {};
        genres.forEach(genre => {
            this.genreMap[genre.id] = genre.name;
        });
    }

    // Get a diverse set of movies for the initial selection
    async getDiverseMovieSet() {
        const movies = [];
        
        // Get popular movies from different years/genres
        const popularMovies = await this.getPopularMovies(1);
        movies.push(...popularMovies.slice(0, 10));
        
        // Get some classic movies (older popular movies)
        const classicMovies = await this.getPopularMovies(5);
        movies.push(...classicMovies.slice(0, 5));
        
        // Get some recent movies
        const recentMovies = await this.getPopularMovies(2);
        movies.push(...recentMovies.slice(0, 5));
        
        // Remove duplicates and return
        const uniqueMovies = movies.filter((movie, index, self) => 
            index === self.findIndex(m => m.id === movie.id)
        );
        
        return uniqueMovies.slice(0, 30); // Return up to 30 diverse movies
    }
}

// Export for use in other files
window.TMDBAPI = TMDBAPI; 