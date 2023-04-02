import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/index.scss';
import NewApiImageService from './js/fetchPictures';
import renderGallery from './js/renderHtml';



document.addEventListener('DOMContentLoaded', function() {
  const refs = {
    formEl: document.querySelector('#search-form'),
    divEl: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-moreBtn'),
  };

  
  
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
    try {
      const response = await imagesApi.fetchImage();
      const { hits, totalHits, total } = response;
      totalPages = Math.ceil(total / 40);
  
      if (!hits.length) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      }
  
      imagesMarkup(response);
  
      if (total >= 40 && imagesApi.page < totalPages) { // Проверка на количество изображений и страниц
        refs.loadMoreBtn.style.display = 'block';; // Отображение кнопки "Load more"
      } else {
        refs.loadMoreBtn.classList.add('hidden'); // Скрытие кнопки "Load more"
      }
  
      if (imagesApi.page >= totalPages) {
        Notiflix.Notify.info(
          'We are sorry, but you have reached the end of search results.'
        );
      }
    } catch (error) {
      console.error(error);
      Notiflix.Notify.failure('Oops! Something went wrong while fetching images.');
    }
  }
  function imagesMarkup(data) {
    refs.divEl.insertAdjacentHTML('beforeend', renderGallery(data.hits));
    simpleLightbox.refresh();
    imagesApi.incrementPage();
  }

  refs.loadMoreBtn.addEventListener('click', onLoadMore);

  const { height: cardHeight } = document
  .querySelector('.gallery')
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: 'smooth',
});
async function onLoadMore() {
  try {
  const images = await imagesApi.fetchImage();
  imagesMarkup(images);
  simpleLightbox.refresh();
  if (imagesApi.page >= totalPages) {
  refs.loadMoreBtn.classList.add('hidden');
  Notiflix.Notify.info(
  'We are sorry, but you have reached the end of search results.'
  );
  }
  } catch (error) {
  console.error(error);
  Notiflix.Notify.failure('Oops! Something went wrong while loading more images.');
  }
  }

  
});