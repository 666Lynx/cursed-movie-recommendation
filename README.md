# 🎬 Cursed Movie Recommender 🎬

A delightfully evil movie recommendation system that analyzes your taste and recommends movies you'll probably hate! Now with TMDB API integration for access to thousands of movies.

## ✨ Features

- **TMDB API Integration**: Access to thousands of movies with posters, ratings, and genres
- **Search Functionality**: Find specific movies by title
- **Dynamic Loading**: Load more movies as needed
- **Cursed Recommendations**: Algorithm that finds movies from genres you avoid
- **Beautiful UI**: Dark theme with cursed animations and effects
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### 1. Get Your TMDB API Key

1. Go to [The Movie Database (TMDB)](https://www.themoviedb.org/)
2. Create a free account
3. Go to your [API Settings](https://www.themoviedb.org/settings/api)
4. Request an API key (choose "Developer" option)
5. Copy your API key

### 2. Setup the Application

1. Open `index.html` in your web browser
2. Enter your TMDB API key in the input field
3. Click "Load Movies" to start using the app

### 3. How to Use

1. **Load Movies**: Enter your API key and click "Load Movies" to get started
2. **Search Movies**: Use the search bar to find specific movies
3. **Select Movies**: Click on movies you actually like (we'll use this against you!)
4. **Get Cursed**: Select at least 3 movies to unlock cursed recommendations
5. **Load More**: Click "Load More Movies" to get additional options

## 🔧 Technical Details

### Files Structure
```
cursed-movie-recommender/
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # Main application logic
├── tmdb-api.js         # TMDB API integration
├── movies.js           # Fallback movie data
└── README.md           # This file
```

### API Integration

The app uses TMDB's REST API to fetch:
- Popular movies from different time periods
- Movie search results
- Movie details including genres and ratings
- Movie posters and backdrop images

### Cursed Algorithm

The recommendation algorithm:
1. Analyzes genres from your selected movies
2. Identifies genres you rarely or never select
3. Finds movies from those "cursed" genres
4. Ranks recommendations by how many cursed genres they contain

## 🎨 Customization

### Adding New Features

- **Genre Filtering**: Add buttons to filter movies by genre
- **Year Range**: Add sliders to filter by release year
- **Rating Filter**: Add minimum rating requirements
- **Watchlist**: Save movies for later viewing

### Styling

The app uses a dark theme with:
- Creepster font for titles
- Roboto font for body text
- Red and yellow color scheme
- Cursed glow animations
- Responsive grid layout

## 🔒 Privacy & Security

- API keys are stored locally in the browser
- No data is sent to external servers except TMDB
- Movie selections are not saved permanently
- All processing happens client-side

## 🐛 Troubleshooting

### Common Issues

1. **"Error loading movies"**
   - Check your API key is correct
   - Ensure you have internet connection
   - Try refreshing the page

2. **"No movies found"**
   - Try searching for a different term
   - Check if your search term is spelled correctly
   - Use the "Load More Movies" button

3. **Images not loading**
   - Some movies may not have poster images
   - The app will show a placeholder image

### API Limits

TMDB has rate limits:
- 1000 requests per day for free accounts
- 40 requests per 10 seconds
- The app is designed to work within these limits

## 🤝 Contributing

Feel free to contribute to this cursed project! Some ideas:
- Add more cursed algorithms
- Improve the UI/UX
- Add more movie data sources
- Create mobile app versions

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the API
- [Google Fonts](https://fonts.google.com/) for the fonts
- All the movies that will be cursed by this algorithm

---

**⚠️ Warning: These recommendations are intentionally terrible. Watch at your own risk! ⚠️** 