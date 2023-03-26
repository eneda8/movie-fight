
const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${imgSrc}">
    ${movie.Title} (${movie.Year}) 
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  
  async fetchData(searchTerm) {
      const response = await axios.get("https://www.omdbapi.com/", {
        params: {
          apikey: "792cef96",
          s: searchTerm
        }
      });

      if(response.data.Error) {
        return [];
      }
      return response.data.Search;
  }
}

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),onOptionSelect(movie){
    document.querySelector("#tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  }
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie){
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "792cef96",
      i: movie.imdbID
    }
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }
  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll("#left-summary .notification");
  const rightSideStats = document.querySelectorAll("#right-summary .notification");

  let leftSidePoints = 0;
  let rightSidePoints = 0;
  let winner;

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);

    if(rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-info");
      leftStat.classList.add("is-warning", "is-light");
      rightStat.classList.remove("is-info");
      rightStat.classList.add("is-success", "is-light");
      rightSidePoints += 1;
    } if(rightSideValue < leftSideValue) {
      rightStat.classList.remove("is-info");
      rightStat.classList.add("is-warning", "is-light");
      leftStat.classList.remove("is-info");
      leftStat.classList.add("is-success", "is-light");
      leftSidePoints += 1;
    } else if (rightSideValue == leftSideValue){
      rightStat.classList.remove("is-info");
      rightStat.classList.add("is-success", "is-light");
      leftStat.classList.remove("is-info");
      leftStat.classList.add("is-success", "is-light");
      leftSidePoints += 1;
      rightSidePoints += 1;
    }
  });
  if(leftSidePoints > rightSidePoints) {
    winner = leftMovie.Title;
  } if(leftSidePoints < rightSidePoints) {
    winner = rightMovie.Title;
  } else if (leftSidePoints == rightSidePoints) {
    winner = "tied";
  }
  console.log(winner)
  document.querySelector("#winner").classList.remove("is-hidden");
  const h4 = document.querySelector("#winner").querySelector("h4");
  h4.innerHTML = `And the winner is...${winner}!`
};

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, ""));
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  
  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if(isNaN(value)){
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
    <article class ="media">
      <figure class = "media-left">
        <p class = "image">
        <img src= "${movieDetail.Poster}">
        </p>
      </figure>
      <div class = "media-content">
        <h1>${movieDetail.Title} (${movieDetail.Year})</h1>
        <h4>${movieDetail.Genre}</h4>
        <p>${movieDetail.Plot}</p>
      </div>
    </article>
    <article data-value=${awards} class="notification is-info is-light">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-info is-light">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-info is-light">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-info is-light">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-info is-light">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
}