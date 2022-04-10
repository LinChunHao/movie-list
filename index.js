const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 8;

const movies = [];
let filteredMovies = [];
let favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
let currentPage = 1;
let viewStyle = "card";
let navBarIndex = "Home";

const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator");
const renderStyle = document.querySelector("#render-style");
const navBar = document.querySelector("#nav-bar");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

// Get API Data

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMoviesData(getMoviesByPage(currentPage));
});

function currentMoviesData() {
  if (navBarIndex === "Home") {
    return movies;
  } else if (navBarIndex === "Favorite") {
    return favoriteMovies;
  }
}

function createBtnHtml(item) {
  return favoriteMovies.some((movie) => movie.id === item.id)
    ? `<button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>`
    : `<button class="btn btn-info btn-add-favorite" data-id="${item.id}">＋</button>`;
}

function getMoviesByPage(page) {
  const sliceMoviesDate = filteredMovies.length
    ? filteredMovies
    : currentMoviesData();
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  return sliceMoviesDate.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {

  if (amount === 0) return alert("還沒有收藏任何電影，快去收藏吧！");

  const totalPages = Math.ceil(amount / MOVIES_PER_PAGE);
  if (currentPage > totalPages) {
    currentPage = totalPages
    renderMoviesData(getMoviesByPage(currentPage));
  }
  let rawHTML = "";
  for (let i = 0; i < totalPages; i++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${i + 1}">${i + 1
      }</a></li>
    `;
  }
  paginator.innerHTML = rawHTML;

  //每當產生頁碼時，標示正在那一頁中，預設為第一頁
  paginator.children[currentPage - 1].firstElementChild.classList.add(
    "bg-primary",
    "text-white"
  );
}

function showMovieModal(id) {
  const modalTitle = document.querySelector(".modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  modalTitle.innerText = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";
  modalImage.innerHTML = "";

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = `Release date: ` + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" class="card-img-top" alt="Movie Poster">`;
  });
}

function addToFavorite(id) {
  const movie = movies.find((movie) => movie.id === id);
  favoriteMovies.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
  renderMoviesData(getMoviesByPage(currentPage));
}

function removeFromFavorite(id) {
  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id);
  favoriteMovies.splice(movieIndex, 1);
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
  renderMoviesData(getMoviesByPage(currentPage));
  renderPaginator(currentMoviesData().length);
}

function renderMoviesData(data) {
  if (viewStyle === "card") {
    let rawHTML = "";

    data.forEach((item) => {
      const btnHTML = createBtnHtml(item);
      rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie mx-1" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
          ${btnHTML}
        </div>
     </div>
  </div>
</div>
  `;
    });

    dataPanel.innerHTML = rawHTML;
  } else {
    let rawHTML = `<table class="table">
      <tbody>`;
    data.forEach(function (item) {
      const btnHTML = createBtnHtml(item);
      rawHTML += ` 
    <tr><th scope="row">${item.title}</th><td class="text-end pe-3"><button class="btn btn-primary btn-show-movie mx-1" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button> ${btnHTML}</tr>`;
    });
    rawHTML += `</table></tbody>`;

    dataPanel.innerHTML = rawHTML;
  }
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

renderStyle.addEventListener("click", function onRenderStyleClicked(event) {
  const sliceMoviesData = filteredMovies.length
    ? filteredMovies
    : currentMoviesData();

  if (event.target.tagName !== "I") return;

  const activeItem = document.querySelector("#render-style .text-primary");
  if (activeItem) {
    activeItem.classList.remove("text-primary");
  }

  if (event.target.classList.contains("fa-th-large")) {
    viewStyle = "card";
    event.target.classList.add("text-primary");
    renderMoviesData(getMoviesByPage(sliceMoviesData));
  } else if (event.target.classList.contains("fa-bars")) {
    viewStyle = "list";
    event.target.classList.add("text-primary");
    renderMoviesData(getMoviesByPage(sliceMoviesData));
  }
  renderPaginator(sliceMoviesData.length);
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") {
    return;
  }
  const sliceMoviesData = filteredMovies.length ? filteredMovies : currentMoviesData();
  currentPage = Number(event.target.dataset.page);
  renderMoviesData(getMoviesByPage(currentPage));
  renderPaginator(sliceMoviesData.length);
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();

  const keyword = searchInput.value.trim().toLowerCase();
  const sliceMoviesData = filteredMovies.length
    ? filteredMovies
    : currentMoviesData();
  //若輸入欄裡有數值則，過濾movies到filterMovies
  filteredMovies = currentMoviesData().filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //如果過濾出來的filteredMovies的資料長度為0，則顯示找不到相關的電影
  if (filteredMovies.length === 0) {
    return alert("輸入的關鍵字：" + keyword + "，沒有符合條件的電影");
  }
  //否則就渲染過濾後的頁面及過濾後的電影
  currentPage = 1; // 避免在當前頁面非第一頁，使用搜尋功能，導致版面亂掉
  renderMoviesData(getMoviesByPage(currentPage));
  renderPaginator(filteredMovies.length);
});

navBar.addEventListener("click", function onNavBarClicked(event) {
  const target = event.target;
  if (target.tagName !== "A") {
    return;
  }

  const activeItem = document.querySelector("#nav-bar .active");
  if (activeItem) {
    activeItem.classList.remove("active");
  }

  currentPage = 1;
  filteredMovies = [];
  const targetText = event.target.innerText;
  switch (targetText) {
    case "Home":
      navBarIndex = "Home";
      target.classList.add("active");
      renderPaginator(movies.length);
      renderMoviesData(getMoviesByPage(currentPage));
      break;

    case "Movie List":
      navBarIndex = "Home";
      renderPaginator(movies.length);
      renderMoviesData(getMoviesByPage(currentPage));
      break;

    case "Favorite":
      if (favoriteMovies.length === 0) {
        alert("還沒有收藏任何電影，快去收藏吧！");
        renderPaginator(movies.length);
        renderMoviesData(getMoviesByPage(currentPage));
        return;
      }
      navBarIndex = "Favorite";
      target.classList.add("active");
      renderPaginator(favoriteMovies.length);
      renderMoviesData(getMoviesByPage(currentPage));
      break;
  }
});
