import {
    handleCardClick,
    showProjectDetails,
    hideProjectDetails,
    filterCards,
    playSound
} from './cardModule.js';

const gallery = document.querySelector('.gallery');
let cards = document.querySelectorAll('.card');
const categoryButtons = document.querySelectorAll('.category-btn');
const projectDetails = document.getElementById('project-details');
const projectTitle = document.getElementById('project-title');
const projectImage = document.getElementById('project-image');
const projectDescription = document.getElementById('project-description');
const closeDetails = document.getElementById('close-details');

let currentIndex = 0;
let totalCards = cards.length;
const visibleCards = 15;

function updateCardPositions() {
    cards.forEach((card, index) => {
        const offset = index - currentIndex;
        const translateX = offset * 100;
        const translateY = offset * 50;
        const translateZ = -Math.abs(offset) * 100;

        // 基础位置和缩放
        const transform = `
            translateX(${translateX}px)
            translateY(${translateY}px)
            translateZ(${translateZ}px)
            scale(${Math.abs(offset) === 0 ? 1.2 : 0.8})
        `;

        card.style.transform = transform;
        card.style.zIndex = Math.abs(offset) === 0 ? 1000 : (totalCards - Math.abs(offset));

        // 只在滚动时更新active状态
        if (Math.abs(offset) === 0) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function handleScroll(event) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    currentIndex = (currentIndex + delta + totalCards) % totalCards;

    // 更新卡片位置
    updateCardPositions();

    // 获取当前中间的卡片
    const centerCard = cards[currentIndex];
    if (centerCard) {
        // 可以选择是否显示详情
        // showProjectDetails(centerCard);
    }

    if (currentIndex > totalCards - visibleCards - 5) {
        loadMorePhotos();
    }
}

function handleCardHover(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 只添加hover类，不改变位置
    card.classList.add('hover');

    // 阻止事件冒泡，避免触发其他效果
    event.stopPropagation();
}

function handleCardLeave(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 移除hover类
    card.classList.remove('hover');
}

function loadMorePhotos() {
    for (let i = 0; i < 15; i++) {
        const newCard = cards[i % 15].cloneNode(true);
        gallery.appendChild(newCard);
    }
    cards = document.querySelectorAll('.card');
    totalCards = cards.length;
    updateCardPositions();
}

// 更新事件监听器
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    if (gallery) {
        gallery.addEventListener('click', handleCardClick);
        gallery.addEventListener('mouseover', handleCardHover);
        gallery.addEventListener('mouseout', handleCardLeave);
    }
});

gallery.addEventListener('wheel', handleScroll, {
    passive: true
});
closeDetails.addEventListener('click', hideProjectDetails);

// 初始化卡片位置
updateCardPositions();

// 添加鼠标移动效果
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    gallery.style.transform = `rotateY(${mouseX * 10}deg) rotateX(${-mouseY * 10}deg)`;
});

// 动轮播
// setInterval(() => {
//     currentIndex = (currentIndex + 1) % totalCards;
//     updateCardPositions();
// }, 5000);

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    cards.forEach((card, index) => {
        const offset = (index - currentIndex + totalCards) % totalCards;
        card.style.transform += `translateY(${scrollY * 0.1 * offset}px)`;
    });
});

let isDragging = false;
let startX, startY, startScrollLeft, startScrollTop;

gallery.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - gallery.offsetLeft;
    startY = e.pageY - gallery.offsetTop;
    startScrollLeft = gallery.scrollLeft;
    startScrollTop = gallery.scrollTop;
});

gallery.addEventListener('mouseleave', () => {
    isDragging = false;
});

gallery.addEventListener('mouseup', () => {
    isDragging = false;
});

gallery.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - gallery.offsetLeft;
    const y = e.pageY - gallery.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    gallery.scrollLeft = startScrollLeft - walkX;
    gallery.scrollTop = startScrollTop - walkY;
});

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('.lazy');
    lazyImages.forEach(img => {
        img.src = img.dataset.src;
    });
});

// 监听滚动事件，加载更多照片
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMorePhotos();
    }
});

// 添加事件监听器
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('highlight');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('highlight');
    });
});

updateCardPositions();

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterCards(button.dataset.category);
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

