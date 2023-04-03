import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/index.scss';
import NewApiImageService from './js/fetchPictures';
import renderGallery from './js/renderHtml';






  const refs = {
    formEl: document.querySelector('#search-form'),
    divEl: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-moreBtn'),
  };

  const simpleLightbox = new SimpleLightbox('.gallery a');
  const imagesApi = new NewApiImageService();
  let totalPages = 1;
  let isFirstSearch = true; 

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
        if (isFirstSearch || totalHits !== imagesApi.prevTotalHits) { 
          Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
        }
        imagesApi.prevTotalHits = totalHits; 
      }

      imagesMarkup(response);

      if (total - (imagesApi.page - 1) * 40 > 0) {
        refs.loadMoreBtn.style.display = 'block';
      } else {
        refs.loadMoreBtn.style.display = 'none';
      }

      if (imagesApi.page >= totalPages && total > 0) {
        Notiflix.Notify.info(
          'We are sorry, but you have reached the end of search results.'
        );
      }

      isFirstSearch = false; 
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

  function onLoadMore() {
    fetchImages();
  }
;
