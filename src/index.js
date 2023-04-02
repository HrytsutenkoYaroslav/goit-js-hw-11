import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/index.scss';
import NewApiImageService from './js/fetchPictures';
import renderGallery from './js/renderHtml';

window.addEventListener('scroll', handleScroll);

const refs = {
  formEl: document.querySelector('#search-form'),
  divEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-moreBtn'),
};

refs.loadMoreBtn.classList.add('hidden');
handleScroll();

const simpleLightbox = new SimpleLightbox('.gallery a');
const imagesApi = new NewApiImageService();
let totalPages = 1;

refs.formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  refs.divEl.innerHTML = '';
  imagesApi.query = event.target.elements.searchQuery.value.trim();

  imagesApi.resetPage();
  if (!imagesApi.query) {
    return Notiflix.Notify.warning('Please, fill in the search field');
  }
  fetchImages();
  event.currentTarget.reset();
}

async function fetchImages() {
  const response = await imagesApi.fetchImage();
  const { hits, totalHits } = response;
  totalPages = Math.ceil(totalHits / 40);
  if (!hits.length) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
  }

  if (totalHits > 10) {
    refs.loadMoreBtn.classList.remove('hidden');
  }

  imagesMarkup(response);
}

function imagesMarkup(data) {
  refs.divEl.insertAdjacentHTML('beforeend', renderGallery(data.hits));
  simpleLightbox.refresh();
  imagesApi.incrementPage();
}

refs.loadMoreBtn.addEventListener('click', onLoadMore);


function onLoadMore() {
  imagesApi.fetchImage().then(imagesMarkup);
  simpleLightbox.refresh();
  if (imagesApi.page >= totalPages) {
    refs.loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.info(
      'We are sorry, but you have reached the end of search results.'
    );
  }
}

function handleScroll() {
  if (window.scrollY > window.innerHeight / 2) {
    refs.loadMoreBtn.classList.remove('hidden');
  }
}