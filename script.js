// Cursed Movie Recommender - Main Logic
class CursedMovieRecommender {
    constructor() {
        this.selectedMovies = new Set();
        this.genreFrequency = {};
        this.allGenres = new Set();
        this.movies = []; // Will be populated from TMDB
        this.tmdb = new TMDBAPI();
        this.currentPage = 1;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showApiKeySection();
    }

    setupEventListeners() {
        // API Key setup
        document.getElementById('loadMoviesBtn').addEventListener('click', () => {
            this.loadMoviesWithApiKey();
        });

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchMovies();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchMovies();
            }
        });

        // Load more movies
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.loadMoreMovies();
        });

        // Select All button
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAllMovies();
        });

        // Clear All button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllMovies();
        });

        // Get Recommendations button
        document.getElementById('getRecommendationsBtn').addEventListener('click', () => {
            this.generateCursedRecommendations();
        });
    }

    showApiKeySection() {
        document.getElementById('apiKeySection').style.display = 'block';
        document.getElementById('movieSelectionSection').style.display = 'none';
    }

    async loadMoviesWithApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            alert('Please enter your TMDB API key!');
            return;
        }

        this.tmdb.setApiKey(apiKey);
        
        try {
            this.showLoading();
            await this.tmdb.initializeGenres();
            this.movies = await this.tmdb.getDiverseMovieSet();
            this.populateMovieGrid();
            this.extractAllGenres();
            this.updateSelectionCount();
            this.showMovieSelection();
        } catch (error) {
            console.error('Error loading movies:', error);
            alert('Error loading movies. Please check your API key and try again.');
        } finally {
            this.hideLoading();
        }
    }

    async searchMovies() {
        const query = document.getElementById('searchInput').value.trim();
        
        if (!query) {
            alert('Please enter a search term!');
            return;
        }

        try {
            this.showLoading();
            const searchResults = await this.tmdb.searchMovies(query);
            this.movies = searchResults;
            this.populateMovieGrid();
            this.extractAllGenres();
            this.updateSelectionCount();
        } catch (error) {
            console.error('Error searching movies:', error);
            alert('Error searching movies. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async loadMoreMovies() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.currentPage++;
            const moreMovies = await this.tmdb.getPopularMovies(this.currentPage);
            this.movies.push(...moreMovies);
            this.populateMovieGrid();
            this.extractAllGenres();
        } catch (error) {
            console.error('Error loading more movies:', error);
            this.currentPage--; // Revert page number on error
        } finally {
            this.isLoading = false;
        }
    }

    showMovieSelection() {
        document.getElementById('apiKeySection').style.display = 'none';
        document.getElementById('movieSelectionSection').style.display = 'block';
    }

    showLoading() {
        const loadBtn = document.getElementById('loadMoviesBtn');
        loadBtn.innerHTML = '<span class="loading"></span> Loading...';
        loadBtn.disabled = true;
    }

    hideLoading() {
        const loadBtn = document.getElementById('loadMoviesBtn');
        loadBtn.innerHTML = 'Load Movies';
        loadBtn.disabled = false;
    }

    populateMovieGrid() {
        const movieGrid = document.getElementById('movieGrid');
        movieGrid.innerHTML = '';

        this.movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            movieGrid.appendChild(movieCard);
        });
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.movieId = movie.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'movie-checkbox';
        checkbox.dataset.movieId = movie.id;
        checkbox.addEventListener('change', (e) => {
            this.handleMovieSelection(movie.id, e.target.checked);
        });

        const poster = document.createElement('img');
        poster.src = movie.poster || 'https://via.placeholder.com/300x450/666/fff?text=No+Poster';
        poster.alt = movie.title;
        poster.className = 'movie-poster';
        poster.onerror = () => {
            poster.src = 'https://via.placeholder.com/300x450/666/fff?text=No+Poster';
        };

        const title = document.createElement('h3');
        title.className = 'movie-title';
        title.textContent = movie.title;

        const genres = document.createElement('div');
        genres.className = 'movie-genres';
        if (movie.genres && movie.genres.length > 0) {
            movie.genres.forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                genres.appendChild(genreTag);
            });
        } else {
            const noGenreTag = document.createElement('span');
            noGenreTag.className = 'genre-tag';
            noGenreTag.textContent = 'Unknown Genre';
            genres.appendChild(noGenreTag);
        }

        // Add rating if available
        if (movie.rating) {
            const rating = document.createElement('div');
            rating.className = 'movie-rating';
            rating.innerHTML = `⭐ ${movie.rating.toFixed(1)}`;
            card.appendChild(rating);
        }

        card.appendChild(checkbox);
        card.appendChild(poster);
        card.appendChild(title);
        card.appendChild(genres);

        // Make entire card clickable
        card.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                this.handleMovieSelection(movie.id, checkbox.checked);
            }
        });

        return card;
    }

    handleMovieSelection(movieId, isSelected) {
        const movieCard = document.querySelector(`[data-movie-id="${movieId}"]`);
        
        if (isSelected) {
            this.selectedMovies.add(movieId);
            movieCard.classList.add('selected');
        } else {
            this.selectedMovies.delete(movieId);
            movieCard.classList.remove('selected');
        }

        this.updateSelectionCount();
        this.updateRecommendationButton();
    }

    selectAllMovies() {
        const checkboxes = document.querySelectorAll('.movie-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.handleMovieSelection(parseInt(checkbox.dataset.movieId), true);
        });
    }

    clearAllMovies() {
        const checkboxes = document.querySelectorAll('.movie-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            this.handleMovieSelection(parseInt(checkbox.dataset.movieId), false);
        });
    }

    updateSelectionCount() {
        const countElement = document.getElementById('selectedCount');
        countElement.textContent = this.selectedMovies.size;
    }

    updateRecommendationButton() {
        const button = document.getElementById('getRecommendationsBtn');
        const hint = document.querySelector('.hint');
        
        if (this.selectedMovies.size >= 3) {
            button.disabled = false;
            button.textContent = '🚫 Get Cursed Recommendations 🚫';
            hint.textContent = 'Ready to curse your taste!';
        } else {
            button.disabled = true;
            button.textContent = '🚫 Get Cursed Recommendations 🚫';
            hint.textContent = `Select at least 3 movies to unlock the curse! (${3 - this.selectedMovies.size} more needed)`;
        }
    }

    extractAllGenres() {
        this.allGenres.clear();
        this.movies.forEach(movie => {
            if (movie.genres) {
                movie.genres.forEach(genre => {
                    this.allGenres.add(genre);
                });
            }
        });
    }

    analyzeGenrePreferences() {
        // Reset genre frequency
        this.genreFrequency = {};
        this.allGenres.forEach(genre => {
            this.genreFrequency[genre] = 0;
        });

        // Count genres from selected movies
        this.selectedMovies.forEach(movieId => {
            const movie = this.movies.find(m => m.id === movieId);
            if (movie && movie.genres) {
                movie.genres.forEach(genre => {
                    this.genreFrequency[genre]++;
                });
            }
        });

        return this.genreFrequency;
    }

    findCursedGenres() {
        const genreFreq = this.analyzeGenrePreferences();
        const cursedGenres = [];

        // Find genres with 0 or 1 occurrence (least liked)
        Object.entries(genreFreq).forEach(([genre, count]) => {
            if (count <= 1) {
                cursedGenres.push(genre);
            }
        });

        // If no cursed genres found, find the least frequent ones
        if (cursedGenres.length === 0) {
            const sortedGenres = Object.entries(genreFreq)
                .sort(([,a], [,b]) => a - b)
                .slice(0, 3)
                .map(([genre]) => genre);
            cursedGenres.push(...sortedGenres);
        }

        return cursedGenres;
    }

    generateCursedRecommendations() {
        const cursedGenres = this.findCursedGenres();
        const recommendations = [];

        // Find movies that contain cursed genres but weren't selected
        this.movies.forEach(movie => {
            if (!this.selectedMovies.has(movie.id) && movie.genres) {
                const hasCursedGenre = movie.genres.some(genre => 
                    cursedGenres.includes(genre)
                );
                if (hasCursedGenre) {
                    recommendations.push(movie);
                }
            }
        });

        // Sort by number of cursed genres (more cursed = better recommendation)
        recommendations.sort((a, b) => {
            const aCursedCount = a.genres.filter(g => cursedGenres.includes(g)).length;
            const bCursedCount = b.genres.filter(g => cursedGenres.includes(g)).length;
            return bCursedCount - aCursedCount;
        });

        // Take top 5 recommendations
        const topRecommendations = recommendations.slice(0, 5);
        
        this.displayRecommendations(topRecommendations, cursedGenres);
        this.displayCurseStats();
    }

    displayRecommendations(recommendations, cursedGenres) {
        const recommendationsSection = document.getElementById('recommendationsSection');
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        
        recommendationsSection.style.display = 'block';
        recommendationsGrid.innerHTML = '';

        if (recommendations.length === 0) {
            recommendationsGrid.innerHTML = `
                <div class="recommendation-card">
                    <h3>🎭 No Cursed Movies Found! 🎭</h3>
                    <p>Your taste is too eclectic to curse. Try selecting more movies!</p>
                </div>
            `;
            return;
        }

        recommendations.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'recommendation-card cursed-glow';

            const poster = document.createElement('img');
            poster.src = movie.poster;
            poster.alt = movie.title;
            poster.className = 'recommendation-poster';
            poster.onerror = () => {
                poster.src = 'https://via.placeholder.com/200x300/666/fff?text=No+Poster';
            };

            const title = document.createElement('h3');
            title.className = 'recommendation-title';
            title.textContent = movie.title;

            const genres = document.createElement('div');
            genres.className = 'recommendation-genres';
            movie.genres.forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                // Highlight cursed genres
                if (cursedGenres.includes(genre)) {
                    genreTag.style.background = 'rgba(255, 107, 107, 0.4)';
                    genreTag.style.borderColor = '#ffd93d';
                    genreTag.style.color = '#ffd93d';
                }
                genres.appendChild(genreTag);
            });

            card.appendChild(poster);
            card.appendChild(title);
            card.appendChild(genres);
            recommendationsGrid.appendChild(card);
        });

        // Scroll to recommendations
        recommendationsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayCurseStats() {
        const statsContainer = document.getElementById('curseStats');
        const genreFreq = this.analyzeGenrePreferences();
        const cursedGenres = this.findCursedGenres();

        const statsHTML = `
            <div class="stat-item">
                <div class="stat-label">Movies Selected</div>
                <div class="stat-value">${this.selectedMovies.size}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Genres Analyzed</div>
                <div class="stat-value">${Object.keys(genreFreq).length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Cursed Genres Found</div>
                <div class="stat-value">${cursedGenres.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Most Avoided Genre</div>
                <div class="stat-value">${cursedGenres[0] || 'None'}</div>
            </div>
        `;

        statsContainer.innerHTML = statsHTML;
    }
}

// Initialize the cursed recommender when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CursedMovieRecommender();
});

// Add some cursed console messages for fun
console.log("🎭 Cursed Movie Recommender loaded! 🎭");
console.log("Remember: These recommendations are intentionally terrible!");
console.log("Your taste is about to be judged... harshly!"); 