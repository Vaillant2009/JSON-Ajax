const API_KEY = '6a471ae3';
const API_URL = 'https://www.omdbapi.com/';

let currentPage = 1;
let totalPages = 1;
let searchTitle = '';
let searchType = '';

$('#searchForm').on('submit', function(event) {
    event.preventDefault();

    searchTitle = $('#movieTitle').val().trim();
    searchType = $('#movieType').val();
    currentPage = 1;

    $('#movieDetails').empty();

    if (searchTitle === '') {
        $('#message').text('Введіть назву фільму!');
        return;
    }

    searchMovies();
});

function searchMovies() {
    $('#message').text('Завантаження...');
    $('#movieList').empty();
    $('#pagination').empty();

    $.ajax({
        url: API_URL,
        method: 'GET',
        dataType: 'json',
        data: {
            apikey: API_KEY,
            s: searchTitle,
            type: searchType,
            page: currentPage
        },
        success: function(data) {
            if (data.Response === 'True') {
                totalPages = Math.ceil(Number(data.totalResults) / 10);
                $('#message').empty();
                displayMovies(data.Search);
                displayPagination();
            } else {
                $('#message').text('Фільми не знайдено!');
                $('#movieList').empty();
                $('#pagination').empty();
            }
        },
        error: function() {
            $('#message').text('Помилка підключення до сервера!');
        }
    });
}

function displayMovies(movies) {
    $('#movieList').empty();

    movies.forEach(function(movie) {
        let poster = movie.Poster;

        if (poster === 'N/A') {
            poster = 'https://placehold.co/300x400?text=No+Poster';
        }

        const card = $('<div>').addClass('movie-card');
        const image = $('<img>').attr({ src: poster, alt: movie.Title });
        const title = $('<h3>').text(movie.Title);
        const year = $('<p>').text('Рік: ' + movie.Year);
        const type = $('<p>').text('Тип: ' + getTypeName(movie.Type));
        const button = $('<button>')
            .text('Детальніше')
            .attr('data-id', movie.imdbID)
            .addClass('details-button');

        card.append(image, title, year, type, button);
        $('#movieList').append(card);
    });
}

function displayPagination() {
    $('#pagination').empty();

    if (totalPages <= 1) {
        return;
    }

    const previousButton = $('<button>')
        .text('Назад')
        .prop('disabled', currentPage === 1)
        .on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                $('#movieDetails').empty();
                searchMovies();
            }
        });

    $('#pagination').append(previousButton);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let page = startPage; page <= endPage; page++) {
        const pageButton = $('<button>')
            .text(page)
            .toggleClass('active', page === currentPage)
            .on('click', function() {
                currentPage = page;
                $('#movieDetails').empty();
                searchMovies();
            });

        $('#pagination').append(pageButton);
    }

    const nextButton = $('<button>')
        .text('Далі')
        .prop('disabled', currentPage === totalPages)
        .on('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                $('#movieDetails').empty();
                searchMovies();
            }
        });

    $('#pagination').append(nextButton);
}

$(document).on('click', '.details-button', function() {
    const movieID = $(this).attr('data-id');
    getMovieDetails(movieID);
});

function getMovieDetails(movieID) {
    $('#movieDetails').html('<p>Завантаження інформації...</p>');

    $.ajax({
        url: API_URL,
        method: 'GET',
        dataType: 'json',
        data: {
            apikey: API_KEY,
            i: movieID,
            plot: 'full'
        },
        success: function(data) {
            if (data.Response === 'True') {
                displayDetails(data);
            } else {
                $('#movieDetails').text('Не вдалося отримати інформацію!');
            }
        },
        error: function() {
            $('#movieDetails').text('Помилка отримання інформації!');
        }
    });
}

function displayDetails(movie) {
    let poster = movie.Poster;

    if (poster === 'N/A') {
        poster = 'https://placehold.co/300x400?text=No+Poster';
    }

    const details = $('<div>').addClass('details-card');
    const image = $('<img>').attr({ src: poster, alt: movie.Title });
    const info = $('<div>').addClass('details-info');

    const title = $('<h2>').text(movie.Title);
    const year = $('<p>').text('Рік: ' + movie.Year);
    const genre = $('<p>').text('Жанр: ' + movie.Genre);
    const director = $('<p>').text('Режисер: ' + movie.Director);
    const actors = $('<p>').text('Актори: ' + movie.Actors);
    const country = $('<p>').text('Країна: ' + movie.Country);
    const runtime = $('<p>').text('Тривалість: ' + movie.Runtime);
    const rating = $('<p>').text('Рейтинг IMDb: ' + movie.imdbRating);
    const plot = $('<p>').text('Опис: ' + movie.Plot);

    info.append(
        title,
        year,
        genre,
        director,
        actors,
        country,
        runtime,
        rating,
        plot
    );

    details.append(image, info);
    $('#movieDetails').empty().append(details);
}

function getTypeName(type) {
    const types = {
        movie: 'Фільм',
        series: 'Серіал',
        episode: 'Епізод'
    };

    return types[type] || type;
}
