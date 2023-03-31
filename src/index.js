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

refs.loadMoreBtn.style.display = 'none';

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
    refs.loadMoreBtn.style.display = 'block';
  }
  imagesMarkup(response);
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

function onLoadMore() {
  imagesApi.fetchImage().then(imagesMarkup);
  simpleLightbox.refresh();
  if (imagesApi.page >= totalPages) {
    refs.loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      'We are sorry, but you have reached the end of search results.'
    );
  }
}

// const onEntry = entries => {
// 	entries.forEach(entry => {
// 		if (entry.isIntersecting && ImagesApi.query !== '') {
// 			ImagesApi.fetchImage().then(images => {
// 				imagesMarkup(images);
//         simpleLightbox.refresh();
//       });
//     }
//   });
// };

// const options = {
//   rootMargin: '400px',
// };
// const observer = new IntersectionObserver(onEntry, options);

// observer.observe(refs.loadMoreEl);